// filepath: /home/sreeraj/Desktop/medconnect-ai/frontend/src/pages/SymptomChecker.tsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Bot, User, Send, Stethoscope, Shield, Clock, Plus, X } from 'lucide-react';
import { SkeletonChat } from '../../shared/components/skeleton';

interface Message {
  id: number;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

export default function SymptomChecker() {
  // Original state
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // New state for chat interface
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showInitialTyping, setShowInitialTyping] = useState(false);
  const [isTypewriting, setIsTypewriting] = useState(false);
  const [typewriterText, setTypewriterText] = useState('');
  const [hasStarted, setHasStarted] = useState(false);

  // Ref for auto-scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const welcomeMessage = "Hello sir, how could I help you today? Please describe what symptoms you are feeling and I'll provide some guidance. Remember, this is for informational purposes only and doesn't replace professional medical advice.";

  // Initialize the chat
  useEffect(() => {
    // Start the animation sequence after a brief delay
    const startTimer = setTimeout(() => {
      setHasStarted(true);
      setShowInitialTyping(true);
    }, 1000);

    return () => clearTimeout(startTimer);
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, isTypewriting]);

  useEffect(() => {
    if (showInitialTyping) {
      // Show typing indicator for 2 seconds
      const typingTimer = setTimeout(() => {
        setShowInitialTyping(false);
        setIsTypewriting(true);
        
        // Start typewriter effect
        let currentIndex = 0;
        const typewriterInterval = setInterval(() => {
          if (currentIndex <= welcomeMessage.length) {
            setTypewriterText(welcomeMessage.slice(0, currentIndex));
            currentIndex++;
          } else {
            clearInterval(typewriterInterval);
            setIsTypewriting(false);
            
            // Add the complete message to messages array
            const botMessage: Message = {
              id: 1,
              text: welcomeMessage,
              isBot: true,
              timestamp: new Date()
            };
            setMessages([botMessage]);
            setTypewriterText('');
          }
        }, 50); // Adjust speed here (lower = faster)

        return () => clearInterval(typewriterInterval);
      }, 2000);

      return () => clearTimeout(typingTimer);
    }
  }, [showInitialTyping, welcomeMessage]);

  const handleAddSymptom = () => {
    if (!inputText.trim()) return;
    
    setSymptoms(prev => [...prev, inputText.trim()]);
    setInputText('');
    setError(''); // Clear any existing errors
  };

  const handleRemoveSymptom = (index: number) => {
    setSymptoms(prev => prev.filter((_, i) => i !== index));
    setError(''); // Clear any existing errors
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddSymptom();
    }
  };

  const handleSendMessage = async () => {
    if (symptoms.length === 0) {
      setError('Please add at least one symptom');
      return;
    }

    const symptomsText = symptoms.length === 1 
      ? `I am experiencing: ${symptoms[0]}`
      : `I am experiencing the following symptoms: ${symptoms.join(', ')}`;

    const userMessage: Message = {
      id: messages.length + 1,
      text: symptomsText,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    setIsTyping(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/ai/symptom`,
        { symptoms },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      // Add bot response to the chat
      const analysisText = response.data.analysis;
      
      const botResponse: Message = {
        id: messages.length + 2,
        text: analysisText || "Thank you for sharing your symptoms. Based on what you've described, I recommend consulting with a healthcare professional for proper evaluation. In the meantime, make sure to rest, stay hydrated, and monitor your symptoms. If you experience severe symptoms, please seek immediate medical attention.",
        isBot: true,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botResponse]);
      setSymptoms([]); // Clear symptoms after sending
    } catch (err: any) {
      // Log error for debugging (only in development)
      if (process.env.NODE_ENV === 'development') {
        console.error('Symptom analysis error:', err);
      }

      // Handle different types of errors
      let errorMessage = 'Failed to analyze symptoms. Please try again.';
      
      if (err.response?.status === 401) {
        errorMessage = 'Please log in again to use this feature';
      } else if (err.response?.status === 500) {
        errorMessage = err.response.data.message || 'Server error. Please try again later.';
      } else if (!navigator.onLine) {
        errorMessage = 'Please check your internet connection';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      
      // Add error message as bot response
      const botErrorResponse: Message = {
        id: messages.length + 2,
        text: `Error: ${errorMessage}`,
        isBot: true,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botErrorResponse]);
    } finally {
      setLoading(false);
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full">
              <Stethoscope className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-purple-800">AI Symptom Checker</h1>
              <p className="text-purple-600">Get preliminary health guidance 24/7</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
            <div className="flex items-center space-x-3">
              <Shield className="w-6 h-6 text-green-600" />
              <div>
                <h3 className="font-semibold text-purple-800">Confidential</h3>
                <p className="text-sm text-purple-600">Your privacy is protected</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
            <div className="flex items-center space-x-3">
              <Clock className="w-6 h-6 text-blue-600" />
              <div>
                <h3 className="font-semibold text-purple-800">24/7 Available</h3>
                <p className="text-sm text-purple-600">Get help anytime</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
            <div className="flex items-center space-x-3">
              <Bot className="w-6 h-6 text-purple-600" />
              <div>
                <h3 className="font-semibold text-purple-800">AI Powered</h3>
                <p className="text-sm text-purple-600">Advanced symptom analysis</p>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Container */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg">
          <h3 className="text-lg font-semibold text-purple-700 px-6 py-3 border-b border-gray-100">
            Chat with AI Symptom Checker
          </h3>
          {/* Chat Messages */}
          <div className="h-[500px] overflow-y-auto p-6">
            {/* Initial Loading State */}
            {!hasStarted && (
              <SkeletonChat
                messages={3}
                withInput={false}
                withHeader={false}
                className="border-0 shadow-none bg-transparent"
              />
            )}

            {/* Initial Typing Indicator */}
            {showInitialTyping && (
              <div className="flex justify-start">
                <div className="flex max-w-xs lg:max-w-md">
                  <div className="flex-shrink-0 mr-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r from-purple-500 to-purple-600">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="px-4 py-3 rounded-2xl bg-purple-50 border border-purple-200">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Typewriter Effect */}
            {isTypewriting && (
              <div className="flex justify-start">
                <div className="flex max-w-xs lg:max-w-md">
                  <div className="flex-shrink-0 mr-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r from-purple-500 to-purple-600">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="px-4 py-3 rounded-2xl bg-purple-50 text-purple-800 border border-purple-200">
                    <p className="text-sm leading-relaxed">
                      {typewriterText}
                      <span className="animate-pulse">|</span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Regular Messages */}
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isBot ? 'justify-start' : 'justify-end'} mb-4`}
              >
                <div className={`flex ${message.isBot ? 'max-w-full' : 'max-w-xs md:max-w-lg lg:max-w-xl'} ${message.isBot ? '' : 'flex-row-reverse'}`}>
                  <div className={`flex-shrink-0 ${message.isBot ? 'mr-3' : 'ml-3'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      message.isBot
                        ? 'bg-gradient-to-r from-purple-500 to-purple-600'
                        : 'bg-gradient-to-r from-blue-500 to-blue-600'
                    }`}>
                      {message.isBot ? (
                        <Bot className="w-5 h-5 text-white" />
                      ) : (
                        <User className="w-5 h-5 text-white" />
                      )}
                    </div>
                  </div>
                  <div className={`px-4 py-3 rounded-2xl ${
                    message.isBot
                      ? 'bg-purple-50 text-purple-800 border border-purple-200 shadow-sm flex-1'
                      : 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-sm'
                  }`}>
                    <div className="text-sm leading-relaxed whitespace-pre-wrap" style={{ overflowWrap: 'break-word', wordBreak: 'break-word' }}>
                      {message.text.split('\n').map((line, i) => {
                        // Enhanced formatting for better readability
                        let formattedLine = line;

                        // Process pairs of asterisks as emphasis markers
                        if (formattedLine.includes("**")) {
                          // Replace **Text** patterns with styled spans
                          formattedLine = formattedLine.replace(/\*\*([^*]+)\*\*/g,
                            `<span class="font-semibold ${message.isBot ? 'text-purple-900' : 'text-white'}"">$1</span>`);

                          // Handle any remaining unpaired asterisks
                          formattedLine = formattedLine.replace(/\*\*/g, '');
                        }

                        // Process numbered lists for better formatting
                        if (formattedLine.match(/^\d+\./)) {
                          formattedLine = `<div class="mt-2 mb-1">${formattedLine}</div>`;
                        }

                        return (
                          <span key={i}>
                            <span dangerouslySetInnerHTML={{ __html: formattedLine }} />
                            {i < message.text.split('\n').length - 1 && <br />}
                          </span>
                        );
                      })}
                    </div>
                    <p className="text-xs mt-2 opacity-70">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Regular Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex max-w-xs lg:max-w-md">
                  <div className="flex-shrink-0 mr-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r from-purple-500 to-purple-600">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="px-4 py-3 rounded-2xl bg-purple-50 border border-purple-200">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Auto-scroll anchor */}
            <div ref={messagesEndRef} />
          </div>

          {/* Added Symptoms Display */}
          {symptoms.length > 0 && (
            <div className="px-6 py-3 border-t border-gray-100">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-purple-700 font-medium">Added symptoms:</span>
                {symptoms.map((symptom, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-1 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm border border-purple-200"
                  >
                    <span>{symptom}</span>
                    <button
                      onClick={() => handleRemoveSymptom(index)}
                      className="text-purple-600 hover:text-purple-800 transition-colors"
                      disabled={loading}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error display */}
          {error && (
            <div className="px-6 py-3 border-t border-gray-100">
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded">
                <span className="font-medium">Error:</span> {error}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex space-x-3">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter a symptom (e.g., headache, fever)"
                className="flex-1 bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={isTyping || !hasStarted || loading}
              />
              <button
                onClick={handleAddSymptom}
                disabled={!inputText.trim() || isTyping || !hasStarted || loading}
                className="px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Add</span>
              </button>
              <button
                onClick={handleSendMessage}
                disabled={symptoms.length === 0 || isTyping || !hasStarted || loading}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
              >
                <Send className="w-5 h-5" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
          <p className="text-sm text-yellow-800 text-center">
            <strong>Disclaimer:</strong> This AI symptom checker is for informational purposes only and does not provide medical advice. 
            Always consult with qualified healthcare professionals for proper diagnosis and treatment. In case of emergency, call your local emergency services immediately.
          </p>
        </div>
      </div>
    </div>
  );
}
