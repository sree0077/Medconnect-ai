const User = require('../models/User');
const {
  logSymptomCheckerInteraction,
  logConsultationMessage,
  endConsultationSession,
  updateSymptomCheckerFeedback,
  updateConsultationSatisfaction
} = require('../middleware/aiLoggingMiddleware');

/**
 * Get user's symptom checker history
 */
const getSymptomCheckerHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10, sortBy = 'timestamp', sortOrder = 'desc' } = req.query;
    
    const user = await User.findById(userId).select('symptomCheckerHistory');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Sort and paginate symptom checker history
    const history = user.symptomCheckerHistory || [];
    const sortedHistory = history.sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      
      if (sortOrder === 'desc') {
        return new Date(bValue) - new Date(aValue);
      } else {
        return new Date(aValue) - new Date(bValue);
      }
    });

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedHistory = sortedHistory.slice(startIndex, endIndex);

    res.json({
      history: paginatedHistory,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(history.length / limit),
        totalItems: history.length,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching symptom checker history:', error);
    res.status(500).json({ error: 'Failed to fetch symptom checker history' });
  }
};

/**
 * Get user's consultation history
 */
const getConsultationHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10, sortBy = 'startTime', sortOrder = 'desc' } = req.query;
    
    const user = await User.findById(userId).select('consultationHistory');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Sort and paginate consultation history
    const history = user.consultationHistory || [];
    const sortedHistory = history.sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      
      if (sortOrder === 'desc') {
        return new Date(bValue) - new Date(aValue);
      } else {
        return new Date(aValue) - new Date(bValue);
      }
    });

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedHistory = sortedHistory.slice(startIndex, endIndex);

    res.json({
      history: paginatedHistory,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(history.length / limit),
        totalItems: history.length,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching consultation history:', error);
    res.status(500).json({ error: 'Failed to fetch consultation history' });
  }
};

/**
 * Get user's AI usage statistics
 */
const getAIUsageStats = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const user = await User.findById(userId).select('aiUsageStats symptomCheckerHistory consultationHistory');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Calculate additional statistics
    const symptomHistory = user.symptomCheckerHistory || [];
    const consultationHistory = user.consultationHistory || [];
    
    const recentSymptomChecks = symptomHistory.filter(
      session => new Date(session.timestamp) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    ).length;
    
    const recentConsultations = consultationHistory.filter(
      session => new Date(session.startTime) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    ).length;

    const avgSymptomConfidence = symptomHistory.length > 0 
      ? symptomHistory.reduce((sum, session) => sum + (session.confidence || 0), 0) / symptomHistory.length
      : 0;

    const avgConsultationConfidence = consultationHistory.length > 0
      ? consultationHistory.reduce((sum, session) => sum + (session.averageConfidence || 0), 0) / consultationHistory.length
      : 0;

    const stats = {
      ...user.aiUsageStats.toObject(),
      recentActivity: {
        symptomChecksLast30Days: recentSymptomChecks,
        consultationsLast30Days: recentConsultations
      },
      averageConfidence: {
        symptomChecker: Math.round(avgSymptomConfidence * 100) / 100,
        consultation: Math.round(avgConsultationConfidence * 100) / 100
      },
      lastActivity: {
        lastSymptomCheck: user.aiUsageStats.lastSymptomCheck,
        lastConsultation: user.aiUsageStats.lastConsultation
      }
    };

    res.json({ stats });
  } catch (error) {
    console.error('Error fetching AI usage stats:', error);
    res.status(500).json({ error: 'Failed to fetch AI usage statistics' });
  }
};

/**
 * Get specific symptom checker session
 */
const getSymptomCheckerSession = async (req, res) => {
  try {
    const userId = req.user._id;
    const { sessionId } = req.params;
    
    const user = await User.findById(userId).select('symptomCheckerHistory');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const session = user.symptomCheckerHistory.find(s => s.sessionId === sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({ session });
  } catch (error) {
    console.error('Error fetching symptom checker session:', error);
    res.status(500).json({ error: 'Failed to fetch session' });
  }
};

/**
 * Get specific consultation session
 */
const getConsultationSession = async (req, res) => {
  try {
    const userId = req.user._id;
    const { sessionId } = req.params;
    
    const user = await User.findById(userId).select('consultationHistory');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const session = user.consultationHistory.find(s => s.sessionId === sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({ session });
  } catch (error) {
    console.error('Error fetching consultation session:', error);
    res.status(500).json({ error: 'Failed to fetch session' });
  }
};

/**
 * Submit feedback for symptom checker session
 */
const submitSymptomCheckerFeedback = async (req, res) => {
  try {
    const userId = req.user._id;
    const { sessionId } = req.params;
    const { helpful, rating, comments } = req.body;

    const success = await updateSymptomCheckerFeedback(userId, sessionId, {
      helpful,
      rating,
      comments
    });

    if (!success) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    console.error('Error submitting symptom checker feedback:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
};

/**
 * Submit satisfaction rating for consultation session
 */
const submitConsultationSatisfaction = async (req, res) => {
  try {
    const userId = req.user._id;
    const { sessionId } = req.params;
    const { rating, feedback } = req.body;

    const success = await updateConsultationSatisfaction(userId, sessionId, {
      rating,
      feedback
    });

    if (!success) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({ message: 'Satisfaction rating submitted successfully' });
  } catch (error) {
    console.error('Error submitting consultation satisfaction:', error);
    res.status(500).json({ error: 'Failed to submit satisfaction rating' });
  }
};

/**
 * Delete specific AI session (GDPR compliance)
 */
const deleteAISession = async (req, res) => {
  try {
    const userId = req.user._id;
    const { sessionId } = req.params;
    const { type } = req.query; // 'symptom' or 'consultation'

    if (type === 'symptom') {
      await User.findByIdAndUpdate(
        userId,
        { $pull: { symptomCheckerHistory: { sessionId } } }
      );
    } else if (type === 'consultation') {
      await User.findByIdAndUpdate(
        userId,
        { $pull: { consultationHistory: { sessionId } } }
      );
    } else {
      return res.status(400).json({ error: 'Invalid session type' });
    }

    res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    console.error('Error deleting AI session:', error);
    res.status(500).json({ error: 'Failed to delete session' });
  }
};

module.exports = {
  getSymptomCheckerHistory,
  getConsultationHistory,
  getAIUsageStats,
  getSymptomCheckerSession,
  getConsultationSession,
  submitSymptomCheckerFeedback,
  submitConsultationSatisfaction,
  deleteAISession
};
