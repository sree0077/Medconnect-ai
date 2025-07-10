const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../common/middleware/auth');
const {
  getSymptomCheckerHistory,
  getConsultationHistory,
  getAIUsageStats,
  getSymptomCheckerSession,
  getConsultationSession,
  submitSymptomCheckerFeedback,
  submitConsultationSatisfaction,
  deleteAISession
} = require('../../common/controllers/aiLoggingController');

// Middleware to ensure only patients can access their own AI history
const ensurePatientAccess = (req, res, next) => {
  if (req.user.role !== 'patient') {
    return res.status(403).json({ error: 'Access denied. Patients only.' });
  }
  next();
};

// Get symptom checker history
// GET /api/patient/ai-history/symptoms?page=1&limit=10&sortBy=timestamp&sortOrder=desc
router.get('/symptoms', authenticateToken, ensurePatientAccess, getSymptomCheckerHistory);

// Get consultation history
// GET /api/patient/ai-history/consultations?page=1&limit=10&sortBy=startTime&sortOrder=desc
router.get('/consultations', authenticateToken, ensurePatientAccess, getConsultationHistory);

// Get AI usage statistics
// GET /api/patient/ai-history/stats
router.get('/stats', authenticateToken, ensurePatientAccess, getAIUsageStats);

// Get specific symptom checker session
// GET /api/patient/ai-history/symptoms/:sessionId
router.get('/symptoms/:sessionId', authenticateToken, ensurePatientAccess, getSymptomCheckerSession);

// Get specific consultation session
// GET /api/patient/ai-history/consultations/:sessionId
router.get('/consultations/:sessionId', authenticateToken, ensurePatientAccess, getConsultationSession);

// Submit feedback for symptom checker session
// POST /api/patient/ai-history/symptoms/:sessionId/feedback
// Body: { helpful: boolean, rating: number, comments: string }
router.post('/symptoms/:sessionId/feedback', authenticateToken, ensurePatientAccess, submitSymptomCheckerFeedback);

// Submit satisfaction rating for consultation session
// POST /api/patient/ai-history/consultations/:sessionId/satisfaction
// Body: { rating: number, feedback: string }
router.post('/consultations/:sessionId/satisfaction', authenticateToken, ensurePatientAccess, submitConsultationSatisfaction);

// Delete specific AI session (GDPR compliance)
// DELETE /api/patient/ai-history/session/:sessionId?type=symptom|consultation
router.delete('/session/:sessionId', authenticateToken, ensurePatientAccess, deleteAISession);

// Export AI history data (GDPR compliance)
router.get('/export', authenticateToken, ensurePatientAccess, async (req, res) => {
  try {
    const userId = req.user._id;
    const User = require('../../common/models/User');
    
    const user = await User.findById(userId).select('symptomCheckerHistory consultationHistory aiUsageStats');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const exportData = {
      exportDate: new Date().toISOString(),
      userId: userId,
      aiUsageStats: user.aiUsageStats,
      symptomCheckerHistory: user.symptomCheckerHistory || [],
      consultationHistory: user.consultationHistory || []
    };

    // Set headers for file download
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="ai-history-${userId}-${Date.now()}.json"`);
    
    res.json(exportData);
  } catch (error) {
    console.error('Error exporting AI history:', error);
    res.status(500).json({ error: 'Failed to export AI history' });
  }
});

// Get AI history summary for dashboard
router.get('/summary', authenticateToken, ensurePatientAccess, async (req, res) => {
  try {
    console.log('=== AI HISTORY SUMMARY REQUEST ===');
    console.log('User:', req.user?.name, 'ID:', req.user?._id);

    const userId = req.user._id;
    const User = require('../../common/models/User');
    
    const user = await User.findById(userId).select('symptomCheckerHistory consultationHistory aiUsageStats');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const symptomHistory = user.symptomCheckerHistory || [];
    const consultationHistory = user.consultationHistory || [];
    
    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const recentSymptomChecks = symptomHistory.filter(
      session => new Date(session.timestamp) > sevenDaysAgo
    );
    
    const recentConsultations = consultationHistory.filter(
      session => new Date(session.startTime) > sevenDaysAgo
    );

    // Get last symptom check details
    const lastSymptomCheck = symptomHistory.length > 0 
      ? symptomHistory.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0]
      : null;

    // Get last consultation details
    const lastConsultation = consultationHistory.length > 0
      ? consultationHistory.sort((a, b) => new Date(b.startTime) - new Date(a.startTime))[0]
      : null;

    const summary = {
      totalInteractions: user.aiUsageStats.totalAIInteractions || 0,
      recentActivity: {
        symptomChecksLast7Days: recentSymptomChecks.length,
        consultationsLast7Days: recentConsultations.length
      },
      lastActivity: {
        lastSymptomCheck: lastSymptomCheck ? {
          date: lastSymptomCheck.timestamp,
          symptoms: lastSymptomCheck.symptoms,
          severity: lastSymptomCheck.severity
        } : null,
        lastConsultation: lastConsultation ? {
          date: lastConsultation.startTime,
          messageCount: lastConsultation.totalMessages,
          duration: lastConsultation.sessionDuration
        } : null
      },
      preferences: {
        preferredFeature: user.aiUsageStats.preferredAIFeature || 'none'
      }
    };

    console.log('Sending summary response:', summary);
    res.json({ summary });
  } catch (error) {
    console.error('Error fetching AI history summary:', error);
    res.status(500).json({ error: 'Failed to fetch AI history summary' });
  }
});

module.exports = router;
