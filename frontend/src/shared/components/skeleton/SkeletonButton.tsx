import React from 'react';
import { SkeletonBase } from './SkeletonBase';

interface SkeletonButtonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  variant?: 'primary' | 'secondary' | 'outline' | 'small' | 'large';
  fullWidth?: boolean;
}

export const SkeletonButton: React.FC<SkeletonButtonProps> = ({
  className = '',
  width,
  height,
  variant = 'primary',
  fullWidth = false
}) => {
  const getVariantDimensions = () => {
    switch (variant) {
      case 'small':
        return { width: '80px', height: '32px' };
      case 'large':
        return { width: '140px', height: '48px' };
      case 'primary':
      case 'secondary':
      case 'outline':
      default:
        return { width: '120px', height: '40px' };
    }
  };

  const defaultDimensions = getVariantDimensions();
  const buttonWidth = fullWidth ? '100%' : (width || defaultDimensions.width);
  const buttonHeight = height || defaultDimensions.height;

  return (
    <SkeletonBase
      className={`${className}`}
      width={buttonWidth}
      height={buttonHeight}
      rounded="xl"
    />
  );
};

export default SkeletonButton;
