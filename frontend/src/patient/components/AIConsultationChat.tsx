import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { aiService } from '../../shared/services/api';
import { useActionLimitCheck } from '../../shared/hooks/useUsageTracking';
import UsageLimitModal from './UsageLimitModal';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  sources?: number;
  isTyping?: boolean;
}

interface AIConsultationChatProps {
  className?: string;
}

const AIConsultationChat: React.FC<AIConsultationChatProps> = ({ className = '' }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId] = useState(() => `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Usage tracking
  const { showLimitModal, limitModalData, checkAndExecuteAction, closeLimitModal } = useActionLimitCheck();

  // Welcome message
  useEffect(() => {
    const welcomeMessage: Message = {
      id: 'welcome',
      text: "I'm here to help with your health questions. You can ask me about symptoms, medications, treatments, or general health concerns. What would you like to know?",
      isBot: true,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    // Check usage limits before sending message
    await checkAndExecuteAction('aiMessage', async () => {
      const userMessage: Message = {
        id: `user_${Date.now()}`,
        text: inputText.trim(),
        isBot: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, userMessage]);
      setInputText('');
      setIsLoading(true);
      setIsTyping(true);
      setError(null);

      try {
        // Prepare conversation history (last 10 messages for context)
        const conversationHistory = messages.slice(-10).map(msg => ({
          question: msg.isBot ? '' : msg.text,
          response: msg.isBot ? msg.text : ''
        })).filter(item => item.question || item.response);

        const response = await aiService.chat(
          userMessage.text,
          conversationHistory,
          conversationId
        );

        // Simulate typing delay for better UX
        setTimeout(() => {
          const botMessage: Message = {
            id: `bot_${Date.now()}`,
            text: response.response,
            isBot: true,
            timestamp: new Date(),
            sources: response.sources_used
          };

          setMessages(prev => [...prev, botMessage]);
          setIsTyping(false);
        }, 1000);

      } catch (err: any) {
        console.error('Chat error:', err);
        setIsTyping(false);

        // Handle specific error cases
        if (err.response?.status === 429) {
          setError('Usage limit exceeded. Please upgrade to continue using AI consultation.');
        } else {
          setError(err.response?.data?.message || 'Failed to send message. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([{
      id: 'welcome_new',
      text: "Chat cleared! How can I help you today?",
      isBot: true,
      timestamp: new Date()
    }]);
    setError(null);
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-purple-800">AI Medical Assistant</h3>
            <p className="text-sm text-purple-600">Powered by Advanced Medical Knowledge</p>
          </div>
        </div>
        <button
          onClick={clearChat}
          className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
          title="Clear chat"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-3 bg-red-50 border-b border-red-200 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span className="text-sm text-red-700">{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
          >
            <div className={`flex max-w-[80%] ${message.isBot ? 'flex-row' : 'flex-row-reverse'}`}>
              {/* Avatar */}
              <div className={`flex-shrink-0 ${message.isBot ? 'mr-3' : 'ml-3'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  message.isBot 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
                    : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                }`}>
                  {message.isBot ? (
                    <Bot className="w-4 h-4 text-white" />
                  ) : (
                    <User className="w-4 h-4 text-white" />
                  )}
                </div>
              </div>

              {/* Message Content */}
              <div className={`rounded-lg px-4 py-2 ${
                message.isBot
                  ? 'bg-gray-100 text-gray-800'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
              }`}>
                <div className="whitespace-pre-wrap">{message.text}</div>
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-xs ${
                    message.isBot ? 'text-gray-500' : 'text-purple-100'
                  }`}>
                    {formatTimestamp(message.timestamp)}
                  </span>
                  {message.sources && message.sources > 0 && (
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                      {message.sources} sources
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex mr-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="bg-gray-100 rounded-lg px-4 py-2">
              <div className="flex items-center space-x-1">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm text-gray-500 ml-2">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex space-x-3">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me about your health concerns..."
            className="flex-1 bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isLoading}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        
        {/* Disclaimer */}
        <p className="text-xs text-gray-500 mt-2 text-center">
          ⚠️ This AI assistant provides educational information only. Always consult healthcare professionals for medical advice.
        </p>
      </div>

      {/* Usage Limit Modal */}
      {showLimitModal && limitModalData && (
        <UsageLimitModal
          isOpen={showLimitModal}
          onClose={closeLimitModal}
          limitType={limitModalData.limitType}
          currentUsage={limitModalData.currentUsage}
        />
      )}
    </div>
  );
};

export default AIConsultationChat;
