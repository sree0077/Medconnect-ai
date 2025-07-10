import React from 'react';
import { SkeletonBase } from './SkeletonBase';
import { SkeletonText } from './SkeletonText';
import { SkeletonAvatar } from './SkeletonAvatar';

interface SkeletonChatProps {
  className?: string;
  messages?: number;
  withInput?: boolean;
  withHeader?: boolean;
}

export const SkeletonChat: React.FC<SkeletonChatProps> = ({
  className = '',
  messages = 5,
  withInput = true,
  withHeader = true
}) => {
  const renderMessage = (index: number, isBot: boolean) => (
    <div
      key={`message-${index}`}
      className={`flex items-start space-x-3 ${isBot ? '' : 'flex-row-reverse space-x-reverse'} mb-4`}
    >
      <SkeletonAvatar size="sm" />
      <div className={`flex-1 max-w-xs md:max-w-md ${isBot ? '' : 'flex flex-col items-end'}`}>
        <div
          className={`p-3 rounded-lg ${
            isBot
              ? 'bg-gray-100 dark:bg-surface-secondary'
              : 'bg-purple-500/10 dark:bg-primary-900/20'
          }`}
        >
          <SkeletonText
            lines={Math.floor(Math.random() * 3) + 1}
            variant="body"
            width="100%"
            lastLineWidth={`${60 + Math.random() * 30}%`}
          />
        </div>
        <div className="mt-1">
          <SkeletonText variant="caption" width="60px" />
        </div>
      </div>
    </div>
  );

  return (
    <div className={`bg-white dark:bg-surface rounded-xl shadow-sm border border-gray-100 dark:border-border ${className}`}>
      {/* Header */}
      {withHeader && (
        <div className="p-4 border-b border-gray-200 dark:border-border">
          <div className="flex items-center space-x-3">
            <SkeletonAvatar size="md" />
            <div className="flex-1">
              <SkeletonText variant="h4" width="150px" className="mb-1" />
              <SkeletonText variant="caption" width="100px" />
            </div>
            <div className="flex space-x-2">
              <SkeletonBase width="32px" height="32px" rounded="full" />
              <SkeletonBase width="32px" height="32px" rounded="full" />
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="p-4 h-96 overflow-y-auto">
        <div className="space-y-4">
          {Array.from({ length: messages }).map((_, index) => {
            const isBot = index % 2 === 0; // Alternate between bot and user messages
            return renderMessage(index, isBot);
          })}

          {/* Typing indicator */}
          <div className="flex items-start space-x-3">
            <SkeletonAvatar size="sm" />
            <div className="flex-1 max-w-xs">
              <div className="p-3 rounded-lg bg-gray-100 dark:bg-surface-secondary">
                <div className="flex space-x-1">
                  <SkeletonBase width="8px" height="8px" rounded="full" className="animate-pulse" />
                  <SkeletonBase width="8px" height="8px" rounded="full" className="animate-pulse animation-delay-200" />
                  <SkeletonBase width="8px" height="8px" rounded="full" className="animate-pulse animation-delay-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Input */}
      {withInput && (
        <div className="p-4 border-t border-gray-200 dark:border-border">
          <div className="flex items-center space-x-3">
            <div className="flex-1">
              <SkeletonBase width="100%" height="40px" rounded="lg" />
            </div>
            <SkeletonBase width="40px" height="40px" rounded="lg" />
          </div>
        </div>
      )}
    </div>
  );
};

export default SkeletonChat;
