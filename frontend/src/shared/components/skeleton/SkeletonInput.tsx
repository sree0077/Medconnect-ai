import React from 'react';
import { SkeletonBase } from './SkeletonBase';

interface SkeletonInputProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  withLabel?: boolean;
  withIcon?: boolean;
  variant?: 'text' | 'select' | 'textarea' | 'search';
}

export const SkeletonInput: React.FC<SkeletonInputProps> = ({
  className = '',
  width = '100%',
  height,
  withLabel = true,
  withIcon = false,
  variant = 'text'
}) => {
  const getInputHeight = () => {
    switch (variant) {
      case 'textarea': return '96px';
      case 'select': return '44px';
      case 'search': return '40px';
      case 'text':
      default: return '44px';
    }
  };

  const inputHeight = height || getInputHeight();

  return (
    <div className={`space-y-2 ${className}`}>
      {withLabel && (
        <SkeletonBase
          width="120px"
          height="20px"
          rounded="sm"
        />
      )}
      <div className="relative">
        {withIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <SkeletonBase
              width="18px"
              height="18px"
              rounded="sm"
            />
          </div>
        )}
        <SkeletonBase
          width={width}
          height={inputHeight}
          rounded="lg"
          className={withIcon ? 'pl-10' : ''}
        />
      </div>
    </div>
  );
};

export default SkeletonInput;
