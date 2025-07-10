import React from 'react';
import { PatientLayout } from '../layouts/PatientLayout';
import AIConsultationChat from '../components/AIConsultationChat';
import { Brain, Shield, Clock, Users, Zap, BookOpen } from 'lucide-react';

const AIConsultation: React.FC = () => {
  return (
    <PatientLayout>
      <div className="py-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            AI Medical Consultation
          </h1>
          <p className="text-gray-600 mt-2">
            Get instant medical guidance powered by advanced AI and comprehensive medical knowledge
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-500 rounded-lg">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-purple-800">AI-Powered</h3>
                <p className="text-sm text-purple-600">Advanced medical knowledge base</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-green-800">Secure & Private</h3>
                <p className="text-sm text-green-600">Your conversations are protected</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-800">24/7 Available</h3>
                <p className="text-sm text-blue-600">Get help anytime you need it</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Chat Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chat Area */}
          <div className="lg:col-span-3">
            <AIConsultationChat className="h-[600px]" />
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Quick Tips */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Zap className="w-5 h-5 text-yellow-500 mr-2" />
                Quick Tips
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Be specific about your symptoms</li>
                <li>• Mention duration and severity</li>
                <li>• Include relevant medical history</li>
                <li>• Ask follow-up questions for clarity</li>
              </ul>
            </div>

            {/* Sample Questions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <BookOpen className="w-5 h-5 text-purple-500 mr-2" />
                Sample Questions
              </h3>
              <div className="space-y-2">
                {[
                  "What could cause persistent headaches?",
                  "How to manage high blood pressure?",
                  "What are the symptoms of diabetes?",
                  "When should I see a doctor for chest pain?"
                ].map((question, index) => (
                  <button
                    key={index}
                    className="w-full text-left text-sm text-purple-600 hover:text-purple-800 hover:bg-purple-50 p-2 rounded-lg transition-colors"
                    onClick={() => {
                      // This would set the input text in the chat component
                      // For now, it's just a visual example
                    }}
                  >
                    "{question}"
                  </button>
                ))}
              </div>
            </div>

            {/* Medical Disclaimer */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <h3 className="font-semibold text-yellow-800 mb-2 flex items-center">
                <Shield className="w-5 h-5 text-yellow-600 mr-2" />
                Important Notice
              </h3>
              <p className="text-sm text-yellow-700">
                This AI assistant provides educational information only and should not replace professional medical advice. 
                Always consult with qualified healthcare providers for diagnosis and treatment.
              </p>
            </div>

            {/* Emergency Notice */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <h3 className="font-semibold text-red-800 mb-2 flex items-center">
                <Users className="w-5 h-5 text-red-600 mr-2" />
                Emergency?
              </h3>
              <p className="text-sm text-red-700 mb-2">
                If you're experiencing a medical emergency, don't use this chat.
              </p>
              <p className="text-sm font-semibold text-red-800">
                Call emergency services immediately: 911
              </p>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
          <h3 className="text-lg font-semibold text-purple-800 mb-3">
            How Our AI Medical Assistant Works
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-purple-700 mb-2">Advanced Knowledge Base</h4>
              <p className="text-sm text-purple-600">
                Our AI is trained on comprehensive medical literature, symptom databases, and treatment guidelines 
                to provide accurate and relevant health information.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-purple-700 mb-2">Contextual Understanding</h4>
              <p className="text-sm text-purple-600">
                The AI maintains conversation context and can provide personalized responses based on your 
                specific symptoms and health concerns.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PatientLayout>
  );
};

export default AIConsultation;
