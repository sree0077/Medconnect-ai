const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../common/middleware/auth');
const {
  getAIUsageOverview,
  getAIUsageTrends,
  getAIPerformanceMetrics,
  getTopAIUsers,
  getTopSymptoms,
  getSystemTrends
} = require('../controllers/aiAnalyticsController');

// Middleware to ensure only admins can access AI analytics
const ensureAdminAccess = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admins only.' });
  }
  next();
};

// Get system-wide AI usage overview
// GET /api/admin/ai-analytics/overview
router.get('/overview', authenticateToken, ensureAdminAccess, getAIUsageOverview);

// Get AI usage trends over time
// GET /api/admin/ai-analytics/trends?period=30d
router.get('/trends', authenticateToken, ensureAdminAccess, getAIUsageTrends);

// Get AI performance metrics
// GET /api/admin/ai-analytics/performance
router.get('/performance', authenticateToken, ensureAdminAccess, getAIPerformanceMetrics);

// Get top AI users
// GET /api/admin/ai-analytics/top-users?limit=10
router.get('/top-users', authenticateToken, ensureAdminAccess, getTopAIUsers);

// Get top symptoms from symptom checker
// GET /api/admin/ai-analytics/top-symptoms
router.get('/top-symptoms', authenticateToken, ensureAdminAccess, getTopSymptoms);

// Get system trends (user registrations, etc.)
// GET /api/admin/ai-analytics/system-trends?period=30d
router.get('/system-trends', authenticateToken, ensureAdminAccess, getSystemTrends);

// Get detailed user AI activity (for admin review)
router.get('/user/:userId', authenticateToken, ensureAdminAccess, async (req, res) => {
  try {
    const { userId } = req.params;
    const User = require('../../common/models/User');
    
    const user = await User.findById(userId).select('name email symptomCheckerHistory consultationHistory aiUsageStats');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Calculate additional metrics for this user
    const symptomHistory = user.symptomCheckerHistory || [];
    const consultationHistory = user.consultationHistory || [];
    
    const avgSymptomConfidence = symptomHistory.length > 0 
      ? symptomHistory.reduce((sum, session) => sum + (session.confidence || 0), 0) / symptomHistory.length
      : 0;

    const avgConsultationConfidence = consultationHistory.length > 0
      ? consultationHistory.reduce((sum, session) => sum + (session.averageConfidence || 0), 0) / consultationHistory.length
      : 0;

    const userActivity = {
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      },
      stats: user.aiUsageStats,
      performance: {
        avgSymptomConfidence: Math.round(avgSymptomConfidence * 100) / 100,
        avgConsultationConfidence: Math.round(avgConsultationConfidence * 100) / 100
      },
      recentActivity: {
        symptomCheckerHistory: symptomHistory.slice(-5), // Last 5 sessions
        consultationHistory: consultationHistory.slice(-5) // Last 5 sessions
      }
    };

    res.json({ userActivity });
  } catch (error) {
    console.error('Error fetching user AI activity:', error);
    res.status(500).json({ error: 'Failed to fetch user AI activity' });
  }
});

// Get AI system health metrics
router.get('/system-health', authenticateToken, ensureAdminAccess, async (req, res) => {
  try {
    const User = require('../../common/models/User');
    
    // Get recent error patterns (this would be enhanced with actual error logging)
    const recentUsers = await User.find({ 
      role: 'patient',
      $or: [
        { 'aiUsageStats.lastSymptomCheck': { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
        { 'aiUsageStats.lastConsultation': { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }
      ]
    }).select('symptomCheckerHistory consultationHistory');

    let totalSessions = 0;
    let successfulSessions = 0;
    let totalResponseTime = 0;
    let responseTimeCount = 0;

    recentUsers.forEach(user => {
      // Analyze recent symptom checker sessions
      if (user.symptomCheckerHistory) {
        const recentSymptomSessions = user.symptomCheckerHistory.filter(
          session => new Date(session.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
        );
        
        recentSymptomSessions.forEach(session => {
          totalSessions++;
          if (session.aiAnalysis && session.aiAnalysis.length > 0) {
            successfulSessions++;
          }
          if (session.apiResponseTime) {
            totalResponseTime += session.apiResponseTime;
            responseTimeCount++;
          }
        });
      }

      // Analyze recent consultation sessions
      if (user.consultationHistory) {
        const recentConsultationSessions = user.consultationHistory.filter(
          session => new Date(session.startTime) > new Date(Date.now() - 24 * 60 * 60 * 1000)
        );
        
        recentConsultationSessions.forEach(session => {
          totalSessions++;
          if (session.messages && session.messages.length > 0) {
            successfulSessions++;
          }
          
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

    const systemHealth = {
      last24Hours: {
        totalSessions,
        successRate: totalSessions > 0 ? Math.round((successfulSessions / totalSessions) * 100) : 100,
        averageResponseTime: responseTimeCount > 0 ? Math.round(totalResponseTime / responseTimeCount) : 0,
        activeUsers: recentUsers.length
      },
      status: {
        overall: 'healthy', // This would be determined by actual system monitoring
        aiService: 'operational',
        database: 'operational',
        responseTime: responseTimeCount > 0 && (totalResponseTime / responseTimeCount) < 5000 ? 'good' : 'slow'
      },
      alerts: [] // This would contain actual system alerts
    };

    res.json({ systemHealth });
  } catch (error) {
    console.error('Error fetching system health:', error);
    res.status(500).json({ error: 'Failed to fetch system health metrics' });
  }
});

module.exports = router;
