const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');

/**
 * Middleware to log AI symptom checker interactions
 */
const logSymptomCheckerInteraction = async (userId, sessionData) => {
  try {
    const sessionId = uuidv4();
    const timestamp = new Date();
    
    const symptomSession = {
      sessionId,
      timestamp,
      symptoms: sessionData.symptoms || [],
      aiAnalysis: sessionData.analysis || '',
      confidence: sessionData.confidence || 0,
      recommendations: sessionData.recommendations || [],
      severity: sessionData.severity || 'low',
      followUpActions: sessionData.followUpActions || [],
      sessionDuration: sessionData.sessionDuration || 0,
      apiResponseTime: sessionData.apiResponseTime || 0,
      userFeedback: {
        helpful: null,
        rating: null,
        comments: ''
      }
    };

    // Add to user's symptom checker history
    await User.findByIdAndUpdate(
      userId,
      {
        $push: { symptomCheckerHistory: symptomSession },
        $inc: { 
          'aiUsageStats.totalSymptomChecks': 1,
          'aiUsageStats.totalAIInteractions': 1,
          'aiUsageStats.totalTimeSpent': sessionData.sessionDuration || 0
        },
        $set: { 
          'aiUsageStats.lastSymptomCheck': timestamp,
          'aiUsageStats.preferredAIFeature': 'symptom-checker'
        }
      },
      { new: true }
    );

    // Update average session duration
    const user = await User.findById(userId);
    if (user && user.aiUsageStats.totalSymptomChecks > 0) {
      const avgDuration = user.aiUsageStats.totalTimeSpent / user.aiUsageStats.totalAIInteractions;
      await User.findByIdAndUpdate(
        userId,
        { $set: { 'aiUsageStats.averageSessionDuration': avgDuration } }
      );
    }

    console.log(`✅ Logged symptom checker session for user ${userId}: ${sessionId}`);
    return sessionId;
  } catch (error) {
    console.error('❌ Error logging symptom checker interaction:', error);
    throw error;
  }
};

/**
 * Middleware to log AI consultation interactions
 */
const logConsultationMessage = async (userId, sessionId, messageData) => {
  try {
    const messageId = uuidv4();
    const timestamp = new Date();
    
    const message = {
      messageId,
      timestamp,
      isUserMessage: messageData.isUserMessage || false,
      content: messageData.content || '',
      ragSources: messageData.ragSources || [],
      responseTime: messageData.responseTime || 0,
      confidence: messageData.confidence || 0
    };

    // Find existing consultation session or create new one
    const user = await User.findById(userId);
    let sessionIndex = -1;
    
    if (user && user.consultationHistory) {
      sessionIndex = user.consultationHistory.findIndex(
        session => session.sessionId === sessionId
      );
    }

    if (sessionIndex === -1) {
      // Create new consultation session
      const newSession = {
        sessionId,
        startTime: timestamp,
        endTime: null,
        messages: [message],
        totalMessages: 1,
        sessionDuration: 0,
        ragQueriesCount: messageData.ragSources ? messageData.ragSources.length : 0,
        averageConfidence: messageData.confidence || 0,
        userSatisfaction: {
          rating: null,
          feedback: ''
        }
      };

      await User.findByIdAndUpdate(
        userId,
        {
          $push: { consultationHistory: newSession },
          $inc: { 
            'aiUsageStats.totalConsultations': 1,
            'aiUsageStats.totalAIInteractions': 1
          },
          $set: { 
            'aiUsageStats.lastConsultation': timestamp,
            'aiUsageStats.preferredAIFeature': 'consultation'
          }
        }
      );
    } else {
      // Add message to existing session
      await User.findByIdAndUpdate(
        userId,
        {
          $push: { [`consultationHistory.${sessionIndex}.messages`]: message },
          $inc: { 
            [`consultationHistory.${sessionIndex}.totalMessages`]: 1,
            [`consultationHistory.${sessionIndex}.ragQueriesCount`]: messageData.ragSources ? messageData.ragSources.length : 0,
            'aiUsageStats.totalAIInteractions': 1
          }
        }
      );

      // Update average confidence for the session
      const updatedUser = await User.findById(userId);
      const session = updatedUser.consultationHistory[sessionIndex];
      const totalConfidence = session.messages.reduce((sum, msg) => sum + (msg.confidence || 0), 0);
      const avgConfidence = totalConfidence / session.messages.length;

      await User.findByIdAndUpdate(
        userId,
        { $set: { [`consultationHistory.${sessionIndex}.averageConfidence`]: avgConfidence } }
      );
    }

    console.log(`✅ Logged consultation message for user ${userId}, session ${sessionId}: ${messageId}`);
    return messageId;
  } catch (error) {
    console.error('❌ Error logging consultation message:', error);
    throw error;
  }
};

/**
 * End a consultation session and calculate final metrics
 */
const endConsultationSession = async (userId, sessionId) => {
  try {
    const user = await User.findById(userId);
    if (!user || !user.consultationHistory) return;

    const sessionIndex = user.consultationHistory.findIndex(
      session => session.sessionId === sessionId
    );

    if (sessionIndex === -1) return;

    const session = user.consultationHistory[sessionIndex];
    const endTime = new Date();
    const sessionDuration = Math.floor((endTime - session.startTime) / 1000); // in seconds

    await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          [`consultationHistory.${sessionIndex}.endTime`]: endTime,
          [`consultationHistory.${sessionIndex}.sessionDuration`]: sessionDuration
        },
        $inc: {
          'aiUsageStats.totalTimeSpent': sessionDuration
        }
      }
    );

    // Update average session duration
    const avgDuration = user.aiUsageStats.totalTimeSpent / user.aiUsageStats.totalAIInteractions;
    await User.findByIdAndUpdate(
      userId,
      { $set: { 'aiUsageStats.averageSessionDuration': avgDuration } }
    );

    console.log(`✅ Ended consultation session for user ${userId}: ${sessionId}`);
  } catch (error) {
    console.error('❌ Error ending consultation session:', error);
    throw error;
  }
};

/**
 * Update user feedback for symptom checker session
 */
const updateSymptomCheckerFeedback = async (userId, sessionId, feedback) => {
  try {
    const user = await User.findById(userId);
    if (!user || !user.symptomCheckerHistory) return false;

    const sessionIndex = user.symptomCheckerHistory.findIndex(
      session => session.sessionId === sessionId
    );

    if (sessionIndex === -1) return false;

    await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          [`symptomCheckerHistory.${sessionIndex}.userFeedback`]: {
            helpful: feedback.helpful || null,
            rating: feedback.rating || null,
            comments: feedback.comments || ''
          }
        }
      }
    );

    console.log(`✅ Updated symptom checker feedback for user ${userId}, session ${sessionId}`);
    return true;
  } catch (error) {
    console.error('❌ Error updating symptom checker feedback:', error);
    throw error;
  }
};

/**
 * Update user satisfaction for consultation session
 */
const updateConsultationSatisfaction = async (userId, sessionId, satisfaction) => {
  try {
    const user = await User.findById(userId);
    if (!user || !user.consultationHistory) return false;

    const sessionIndex = user.consultationHistory.findIndex(
      session => session.sessionId === sessionId
    );

    if (sessionIndex === -1) return false;

    await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          [`consultationHistory.${sessionIndex}.userSatisfaction`]: {
            rating: satisfaction.rating || null,
            feedback: satisfaction.feedback || ''
          }
        }
      }
    );

    console.log(`✅ Updated consultation satisfaction for user ${userId}, session ${sessionId}`);
    return true;
  } catch (error) {
    console.error('❌ Error updating consultation satisfaction:', error);
    throw error;
  }
};

module.exports = {
  logSymptomCheckerInteraction,
  logConsultationMessage,
  endConsultationSession,
  updateSymptomCheckerFeedback,
  updateConsultationSatisfaction
};
