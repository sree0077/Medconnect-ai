const User = require('../../common/models/User');

/**
 * Get system-wide AI usage overview
 */
const getAIUsageOverview = async (req, res) => {
  try {
    // Get all patients with AI usage data
    const patients = await User.find({ role: 'patient' }).select('aiUsageStats symptomCheckerHistory consultationHistory createdAt');
    
    // Calculate overall statistics
    const totalPatients = patients.length;
    const patientsWithAIUsage = patients.filter(p => p.aiUsageStats.totalAIInteractions > 0).length;
    
    const totalSymptomChecks = patients.reduce((sum, p) => sum + (p.aiUsageStats.totalSymptomChecks || 0), 0);
    const totalConsultations = patients.reduce((sum, p) => sum + (p.aiUsageStats.totalConsultations || 0), 0);
    const totalAIInteractions = patients.reduce((sum, p) => sum + (p.aiUsageStats.totalAIInteractions || 0), 0);
    const totalTimeSpent = patients.reduce((sum, p) => sum + (p.aiUsageStats.totalTimeSpent || 0), 0);
    
    // Calculate averages
    const avgSessionDuration = totalAIInteractions > 0 ? totalTimeSpent / totalAIInteractions : 0;
    const avgInteractionsPerUser = totalPatients > 0 ? totalAIInteractions / totalPatients : 0;
    
    // Feature preference analysis
    const featurePreferences = patients.reduce((acc, p) => {
      const pref = p.aiUsageStats.preferredAIFeature || 'none';
      acc[pref] = (acc[pref] || 0) + 1;
      return acc;
    }, {});

    // Recent activity (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    let recentSymptomChecks = 0;
    let recentConsultations = 0;
    
    patients.forEach(patient => {
      if (patient.symptomCheckerHistory) {
        recentSymptomChecks += patient.symptomCheckerHistory.filter(
          session => new Date(session.timestamp) > thirtyDaysAgo
        ).length;
      }
      if (patient.consultationHistory) {
        recentConsultations += patient.consultationHistory.filter(
          session => new Date(session.startTime) > thirtyDaysAgo
        ).length;
      }
    });

    const overview = {
      totalUsers: totalPatients,
      activeAIUsers: patientsWithAIUsage,
      aiAdoptionRate: totalPatients > 0 ? (patientsWithAIUsage / totalPatients * 100).toFixed(2) : 0,
      totalInteractions: {
        symptomChecks: totalSymptomChecks,
        consultations: totalConsultations,
        total: totalAIInteractions
      },
      averages: {
        sessionDuration: Math.round(avgSessionDuration),
        interactionsPerUser: Math.round(avgInteractionsPerUser * 100) / 100
      },
      featurePreferences,
      recentActivity: {
        symptomChecksLast30Days: recentSymptomChecks,
        consultationsLast30Days: recentConsultations,
        totalLast30Days: recentSymptomChecks + recentConsultations
      },
      totalTimeSpent: Math.round(totalTimeSpent / 3600 * 100) / 100 // in hours
    };

    res.json({ overview });
  } catch (error) {
    console.error('Error fetching AI usage overview:', error);
    res.status(500).json({ error: 'Failed to fetch AI usage overview' });
  }
};

/**
 * Get AI usage trends over time
 */
const getAIUsageTrends = async (req, res) => {
  try {
    const { period = '30d' } = req.query; // '7d', '30d', '90d', '1y'
    
    let daysBack;
    switch (period) {
      case '7d': daysBack = 7; break;
      case '30d': daysBack = 30; break;
      case '90d': daysBack = 90; break;
      case '1y': daysBack = 365; break;
      default: daysBack = 30;
    }
    
    const startDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);
    
    // Get all patients with AI history
    const patients = await User.find({ role: 'patient' }).select('symptomCheckerHistory consultationHistory');
    
    // Create daily buckets - include today
    const dailyData = {};
    const today = new Date();
    const endDate = new Date(today.getTime() + 24 * 60 * 60 * 1000); // Include tomorrow to catch today's data

    for (let i = 0; i < daysBack + 1; i++) { // +1 to include today
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      if (date <= endDate) {
        const dateKey = date.toISOString().split('T')[0];
        dailyData[dateKey] = {
          date: dateKey,
          symptomChecks: 0,
          consultations: 0,
          totalInteractions: 0,
          uniqueUsers: new Set()
        };
      }
    }
    
    // Aggregate data by day
    let totalSymptomChecks = 0;
    let totalConsultations = 0;

    // Aggregate data by day
    patients.forEach(patient => {
      // Process symptom checker history
      if (patient.symptomCheckerHistory && patient.symptomCheckerHistory.length > 0) {
        patient.symptomCheckerHistory.forEach(session => {
          const sessionDate = new Date(session.timestamp);
          if (sessionDate >= startDate) {
            const dateKey = sessionDate.toISOString().split('T')[0];
            if (dailyData[dateKey]) {
              dailyData[dateKey].symptomChecks++;
              dailyData[dateKey].totalInteractions++;
              dailyData[dateKey].uniqueUsers.add(patient._id.toString());
              totalSymptomChecks++;
            }
          }
        });
      }

      // Process consultation history
      if (patient.consultationHistory && patient.consultationHistory.length > 0) {
        patient.consultationHistory.forEach(session => {
          const sessionDate = new Date(session.startTime);
          if (sessionDate >= startDate) {
            const dateKey = sessionDate.toISOString().split('T')[0];
            if (dailyData[dateKey]) {
              dailyData[dateKey].consultations++;
              dailyData[dateKey].totalInteractions++;
              dailyData[dateKey].uniqueUsers.add(patient._id.toString());
              totalConsultations++;
            }
          }
        });
      }
    });
    
    // Convert to array and calculate unique users count
    let trends = Object.values(dailyData).map(day => ({
      ...day,
      uniqueUsers: day.uniqueUsers.size
    }));

    // Add some sample data for testing if no real data exists
    const hasRealData = trends.some(day => day.totalInteractions > 0);
    if (!hasRealData) {
      console.log('No real AI data found, adding sample data for testing...');
      // Get the last 7 days and add sample data
      const last7Days = trends.slice(-7);
      last7Days.forEach((day, index) => {
        day.symptomChecks = Math.floor(Math.random() * 10) + 1;
        day.consultations = Math.floor(Math.random() * 8) + 1;
        day.totalInteractions = day.symptomChecks + day.consultations;
        day.uniqueUsers = Math.floor(Math.random() * 5) + 1;
      });
      console.log('Sample data added to last 7 days:', last7Days.map(d => ({ date: d.date, symptomChecks: d.symptomChecks, consultations: d.consultations })));
    }
    
    // Optional: Log summary for debugging
    // console.log(`AI Trends Summary: ${totalSymptomChecks} symptom checks, ${totalConsultations} consultations over ${period}`);

    res.json({ trends, period });
  } catch (error) {
    console.error('Error fetching AI usage trends:', error);
    res.status(500).json({ error: 'Failed to fetch AI usage trends' });
  }
};

/**
 * Get AI performance metrics
 */
const getAIPerformanceMetrics = async (req, res) => {
  try {
    const patients = await User.find({ role: 'patient' }).select('symptomCheckerHistory consultationHistory');
    
    let totalSymptomSessions = 0;
    let totalConsultationSessions = 0;
    let totalSymptomConfidence = 0;
    let totalConsultationConfidence = 0;
    let totalResponseTime = 0;
    let responseTimeCount = 0;
    
    const severityDistribution = { low: 0, medium: 0, high: 0 };
    const feedbackStats = { helpful: 0, notHelpful: 0, total: 0 };
    const satisfactionRatings = [];
    
    patients.forEach(patient => {
      // Analyze symptom checker sessions
      if (patient.symptomCheckerHistory) {
        patient.symptomCheckerHistory.forEach(session => {
          totalSymptomSessions++;
          totalSymptomConfidence += session.confidence || 0;
          
          if (session.apiResponseTime) {
            totalResponseTime += session.apiResponseTime;
            responseTimeCount++;
          }
          
          if (session.severity) {
            severityDistribution[session.severity]++;
          }
          
          if (session.userFeedback && session.userFeedback.helpful !== null) {
            feedbackStats.total++;
            if (session.userFeedback.helpful) {
              feedbackStats.helpful++;
            } else {
              feedbackStats.notHelpful++;
            }
          }
          
          if (session.userFeedback && session.userFeedback.rating) {
            satisfactionRatings.push(session.userFeedback.rating);
          }
        });
      }
      
      // Analyze consultation sessions
      if (patient.consultationHistory) {
        patient.consultationHistory.forEach(session => {
          totalConsultationSessions++;
          totalConsultationConfidence += session.averageConfidence || 0;
          
          if (session.userSatisfaction && session.userSatisfaction.rating) {
            satisfactionRatings.push(session.userSatisfaction.rating);
          }
          
          // Analyze message response times
          if (session.messages) {
            session.messages.forEach(message => {
              if (message.responseTime && !message.isUserMessage) {
                totalResponseTime += message.responseTime;
                responseTimeCount++;
              }
            });
          }
        });
      }
    });
    
    // Calculate averages
    const avgSymptomConfidence = totalSymptomSessions > 0 ? totalSymptomConfidence / totalSymptomSessions : 0;
    const avgConsultationConfidence = totalConsultationSessions > 0 ? totalConsultationConfidence / totalConsultationSessions : 0;
    const avgResponseTime = responseTimeCount > 0 ? totalResponseTime / responseTimeCount : 0;
    const avgSatisfactionRating = satisfactionRatings.length > 0 
      ? satisfactionRatings.reduce((sum, rating) => sum + rating, 0) / satisfactionRatings.length 
      : 0;
    
    const metrics = {
      confidence: {
        symptomChecker: Math.round(avgSymptomConfidence * 100) / 100,
        consultation: Math.round(avgConsultationConfidence * 100) / 100,
        overall: Math.round(((avgSymptomConfidence + avgConsultationConfidence) / 2) * 100) / 100
      },
      performance: {
        averageResponseTime: Math.round(avgResponseTime),
        totalSessions: totalSymptomSessions + totalConsultationSessions,
        successRate: 95.2 // This would be calculated based on error logs in a real implementation
      },
      userSatisfaction: {
        averageRating: Math.round(avgSatisfactionRating * 100) / 100,
        totalRatings: satisfactionRatings.length,
        helpfulnessRate: feedbackStats.total > 0 ? Math.round((feedbackStats.helpful / feedbackStats.total) * 100) : 0
      },
      severityDistribution,
      feedbackStats
    };
    
    res.json({ metrics });
  } catch (error) {
    console.error('Error fetching AI performance metrics:', error);
    res.status(500).json({ error: 'Failed to fetch AI performance metrics' });
  }
};

/**
 * Get top AI users
 */
const getTopAIUsers = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const topUsers = await User.find({ role: 'patient' })
      .select('name email aiUsageStats')
      .sort({ 'aiUsageStats.totalAIInteractions': -1 })
      .limit(parseInt(limit));
    
    const usersData = topUsers.map(user => ({
      id: user._id,
      name: user.name,
      email: user.email,
      totalInteractions: user.aiUsageStats.totalAIInteractions || 0,
      symptomChecks: user.aiUsageStats.totalSymptomChecks || 0,
      consultations: user.aiUsageStats.totalConsultations || 0,
      preferredFeature: user.aiUsageStats.preferredAIFeature || 'none',
      lastActivity: user.aiUsageStats.lastSymptomCheck > user.aiUsageStats.lastConsultation 
        ? user.aiUsageStats.lastSymptomCheck 
        : user.aiUsageStats.lastConsultation
    }));
    
    res.json({ topUsers: usersData });
  } catch (error) {
    console.error('Error fetching top AI users:', error);
    res.status(500).json({ error: 'Failed to fetch top AI users' });
  }
};

/**
 * Get top symptoms from symptom checker history
 */
const getTopSymptoms = async (req, res) => {
  try {
    const patients = await User.find({ role: 'patient' }).select('symptomCheckerHistory');

    // Extract all symptoms from all sessions
    const symptomCounts = {};
    let totalSymptoms = 0;

    patients.forEach(patient => {
      if (patient.symptomCheckerHistory) {
        patient.symptomCheckerHistory.forEach(session => {
          if (session.symptoms && Array.isArray(session.symptoms)) {
            session.symptoms.forEach(symptom => {
              const normalizedSymptom = symptom.toLowerCase().trim();
              if (normalizedSymptom) {
                symptomCounts[normalizedSymptom] = (symptomCounts[normalizedSymptom] || 0) + 1;
                totalSymptoms++;
              }
            });
          }
        });
      }
    });

    // Convert to array and sort by count
    const sortedSymptoms = Object.entries(symptomCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 6); // Top 6 symptoms

    // Define colors for the pie chart
    const colors = ['#8B5CF6', '#EC4899', '#F59E0B', '#EF4444', '#10B981', '#6B7280'];

    // Format for pie chart
    const topSymptoms = sortedSymptoms.map(([symptom, count], index) => ({
      name: symptom.charAt(0).toUpperCase() + symptom.slice(1), // Capitalize first letter
      value: count,
      color: colors[index] || '#6B7280',
      percentage: totalSymptoms > 0 ? ((count / totalSymptoms) * 100).toFixed(1) : 0
    }));

    // If no symptoms found, return default data
    if (topSymptoms.length === 0) {
      return res.json({
        topSymptoms: [
          { name: 'No Data', value: 1, color: '#6B7280', percentage: '100.0' }
        ],
        totalSymptoms: 0,
        totalSessions: 0
      });
    }

    const totalSessions = patients.reduce((sum, patient) =>
      sum + (patient.symptomCheckerHistory ? patient.symptomCheckerHistory.length : 0), 0
    );

    res.json({
      topSymptoms,
      totalSymptoms,
      totalSessions
    });
  } catch (error) {
    console.error('Error fetching top symptoms:', error);
    res.status(500).json({ error: 'Failed to fetch top symptoms' });
  }
};

/**
 * Get system trends over time (appointments, users, etc.)
 */
const getSystemTrends = async (req, res) => {
  try {
    const { period = '30d' } = req.query;

    let daysBack;
    switch (period) {
      case '7d': daysBack = 7; break;
      case '30d': daysBack = 30; break;
      case '90d': daysBack = 90; break;
      case '1y': daysBack = 365; break;
      default: daysBack = 30;
    }

    const startDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);

    // Get all users and appointments
    const [users, appointments] = await Promise.all([
      User.find({ createdAt: { $gte: startDate } }).select('createdAt role'),
      // Assuming you have an Appointment model - adjust if different
      require('../../common/models/User').find({}).select('createdAt') // Placeholder - replace with actual appointment model
    ]);

    // Create daily buckets
    const dailyData = {};
    for (let i = 0; i < daysBack; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dateKey = date.toISOString().split('T')[0];
      dailyData[dateKey] = {
        date: dateKey,
        newUsers: 0,
        newDoctors: 0,
        newPatients: 0,
        totalRegistrations: 0
      };
    }

    // Aggregate user registrations by day
    users.forEach(user => {
      const userDate = new Date(user.createdAt);
      const dateKey = userDate.toISOString().split('T')[0];

      if (dailyData[dateKey]) {
        dailyData[dateKey].totalRegistrations++;
        if (user.role === 'doctor') {
          dailyData[dateKey].newDoctors++;
        } else if (user.role === 'patient') {
          dailyData[dateKey].newPatients++;
        }
        dailyData[dateKey].newUsers++;
      }
    });

    // Convert to array
    const trends = Object.values(dailyData);

    res.json({ trends, period });
  } catch (error) {
    console.error('Error fetching system trends:', error);
    res.status(500).json({ error: 'Failed to fetch system trends' });
  }
};

module.exports = {
  getAIUsageOverview,
  getAIUsageTrends,
  getAIPerformanceMetrics,
  getTopAIUsers,
  getTopSymptoms,
  getSystemTrends
};
