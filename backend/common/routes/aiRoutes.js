const express = require("express");
const axios = require("axios");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");
const { logSymptomCheckerInteraction, logConsultationMessage } = require("../middleware/aiLoggingMiddleware");
const { checkAIUsageLimit, trackAIUsage } = require("../middleware/usageTrackingMiddleware");

// AI Service configuration
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5001';

// POST /api/ai/symptom
router.post("/symptom", authenticateToken, checkAIUsageLimit, trackAIUsage('symptomCheckerMessage'), async (req, res) => {
  const startTime = Date.now(); // Track request start time for logging

  console.log("=== SYMPTOM ANALYSIS REQUEST ===");
  console.log("User:", req.user?.name, "Role:", req.user?.role);
  console.log("Request body:", req.body);
  console.log("Headers:", req.headers.authorization ? "Token present" : "No token");

  const { symptoms } = req.body;
  if (!symptoms) return res.status(400).json({ error: "No symptoms provided" });

  const symptomList = Array.isArray(symptoms)
    ? symptoms.join(", ")
    : symptoms;

  // Debug: Check environment variables
  console.log("Environment check:", {
    hasApiKey: !!process.env.GEMINI_API_KEY,
    apiUrl: process.env.GEMINI_API_URL,
    nodeEnv: process.env.NODE_ENV
  });

  // Check if API key is configured
  if (!process.env.GEMINI_API_KEY) {
    console.error("Gemini API key not configured");
    return res.status(500).json({ error: "AI service not properly configured" });
  }

  // Gemini-style prompt
  const prompt = `As an AI medical assistant, analyze these symptoms: ${symptomList}.

Please provide:
1. Top 3 possible medical conditions ranked by likelihood
2. Brief explanation for each condition
3. General advice (when to seek immediate medical attention)

Format the response in a clear, structured way.

IMPORTANT: This is for educational purposes only and should not replace professional medical advice.`;

  try {
    // Construct the Gemini API URL with the API key
    const apiUrl = `${process.env.GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`;

    console.log("Making request to Gemini API...");
    console.log("API URL (without key):", process.env.GEMINI_API_URL);

    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }]
    };

    // Debug: Log request configuration (without API key)
    console.log("Request configuration:", {
      url: process.env.GEMINI_API_URL,
      bodyStructure: JSON.stringify(requestBody, null, 2)
    });

    const response = await axios.post(
      apiUrl,
      requestBody,
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    // Debug: Log response structure
    console.log("Gemini API Response Structure:", {
      status: response.status,
      hasData: !!response.data,
      dataKeys: Object.keys(response.data)
    });

    // Extract text from Gemini response
    const analysis = response.data.candidates?.[0]?.content?.parts?.[0]?.text ||
                    response.data.candidates?.[0]?.text ||
                    response.data.text ||
                    "Unable to analyze symptoms at this time.";

    console.log("Successfully processed response");

    // Log the symptom checker interaction
    try {
      const sessionData = {
        symptoms: Array.isArray(symptoms) ? symptoms : [symptoms],
        analysis: analysis,
        confidence: 75, // Default confidence score - could be enhanced with actual AI confidence
        recommendations: [], // Could be extracted from analysis
        severity: 'medium', // Could be determined from analysis
        followUpActions: [],
        sessionDuration: Math.floor((Date.now() - startTime) / 1000),
        apiResponseTime: Date.now() - startTime
      };

      await logSymptomCheckerInteraction(req.user._id, sessionData);
    } catch (loggingError) {
      console.error('Error logging symptom checker interaction:', loggingError);
      // Don't fail the request if logging fails
    }

    res.json({ analysis });
  } catch (err) {
    // Enhanced error logging
    console.error("Gemini API error details:", {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status,
      headers: err.response?.headers,
      config: {
        url: err.config?.url?.replace(process.env.GEMINI_API_KEY, '[REDACTED]'),
        method: err.config?.method,
        headers: err.config?.headers
      },
      stack: err.stack
    });

    // Handle specific API errors
    if (err.response?.status === 503) {
      // Gemini API is overloaded - provide a helpful fallback response
      const fallbackAnalysis = `I apologize, but our AI service is currently experiencing high demand. Here's some general guidance for your symptoms (${symptomList}):

**General Recommendations:**
• Monitor your symptoms closely
• Stay hydrated and get adequate rest
• Consider over-the-counter remedies if appropriate
• Seek medical attention if symptoms worsen or persist

**When to seek immediate medical care:**
• High fever (over 103°F/39.4°C)
• Difficulty breathing
• Severe or worsening symptoms
• Signs of allergic reaction

**Important:** This is general guidance only. Please consult with a healthcare professional for proper medical advice tailored to your specific situation.`;

      // Still try to log the session even with fallback response
      try {
        const sessionData = {
          symptoms: Array.isArray(symptoms) ? symptoms : [symptoms],
          analysis: fallbackAnalysis,
          confidence: 50, // Lower confidence for fallback
          recommendations: ['Consult healthcare professional', 'Monitor symptoms'],
          severity: 'medium',
          followUpActions: ['Seek medical advice if symptoms persist'],
          sessionDuration: Math.floor((Date.now() - startTime) / 1000),
          apiResponseTime: Date.now() - startTime
        };

        await logSymptomCheckerInteraction(req.user._id, sessionData);
      } catch (loggingError) {
        console.error('Error logging fallback symptom checker interaction:', loggingError);
      }

      return res.json({
        analysis: fallbackAnalysis,
        fallback: true,
        message: "AI service temporarily unavailable - showing general guidance"
      });
    }

    // Send appropriate error message for other errors
    res.status(500).json({
      error: "AI service error",
      details: process.env.NODE_ENV === 'development'
        ? {
            message: err.message,
            response: err.response?.data,
            status: err.response?.status
          }
        : "Failed to analyze symptoms. Please try again later."
    });
  }
});

// POST /api/ai/chat - RAG-powered chat endpoint
router.post("/chat", authenticateToken, checkAIUsageLimit, trackAIUsage('aiConsultationMessage'), async (req, res) => {
  const startTime = Date.now(); // Track request start time for logging

  console.log("=== RAG CHAT REQUEST ===");
  console.log("User:", req.user?.name, "Role:", req.user?.role);
  console.log("Request body:", req.body);

  const { message, conversation_history, conversation_id } = req.body;
  if (!message) return res.status(400).json({ error: "No message provided" });

  try {
    console.log("Making request to AI service...");

    const response = await axios.post(`${AI_SERVICE_URL}/api/ai/chat`, {
      message,
      conversation_history: conversation_history || [],
      conversation_id
    }, {
      headers: {
        "Content-Type": "application/json"
      },
      timeout: 30000 // 30 second timeout
    });

    console.log("Successfully received response from AI service");

    // Log the consultation message
    try {
      const sessionId = conversation_id || `session_${Date.now()}_${req.user._id}`;

      // Log user message
      await logConsultationMessage(req.user._id, sessionId, {
        isUserMessage: true,
        content: message,
        ragSources: [],
        responseTime: 0,
        confidence: 0
      });

      // Log AI response
      await logConsultationMessage(req.user._id, sessionId, {
        isUserMessage: false,
        content: response.data.response || '',
        ragSources: response.data.retrieved_documents || [],
        responseTime: Date.now() - startTime,
        confidence: response.data.confidence || 80
      });
    } catch (loggingError) {
      console.error('Error logging consultation message:', loggingError);
      // Don't fail the request if logging fails
    }

    res.json(response.data);
  } catch (err) {
    console.error("AI Service error:", {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status
    });

    // Fallback to direct Gemini API if AI service is unavailable
    if (err.code === 'ECONNREFUSED' || err.response?.status >= 500) {
      console.log("AI service unavailable, falling back to direct Gemini API...");
      return fallbackToDirectGemini(req, res, message);
    }

    res.status(500).json({
      error: "AI chat service error",
      details: process.env.NODE_ENV === 'development'
        ? err.response?.data || err.message
        : "Failed to process chat message. Please try again later."
    });
  }
});



// Fallback function for direct Gemini API
async function fallbackToDirectGemini(req, res, message) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "AI service not properly configured" });
    }

    const apiUrl = `${process.env.GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`;
    const prompt = `As an AI medical assistant, please respond to this question: ${message}

Please provide helpful, accurate medical information while emphasizing that this is for educational purposes only and should not replace professional medical advice.`;

    const response = await axios.post(apiUrl, {
      contents: [{
        parts: [{
          text: prompt
        }]
      }]
    }, {
      headers: {
        "Content-Type": "application/json"
      }
    });

    const analysis = response.data.candidates?.[0]?.content?.parts?.[0]?.text ||
                    "Unable to process your request at this time.";

    res.json({
      response: analysis,
      sources_used: 0,
      timestamp: new Date().toISOString(),
      fallback: true
    });
  } catch (err) {
    console.error("Fallback Gemini API error:", err.message);
    res.status(500).json({
      error: "AI service temporarily unavailable",
      details: "Please try again later."
    });
  }
}



module.exports = router;