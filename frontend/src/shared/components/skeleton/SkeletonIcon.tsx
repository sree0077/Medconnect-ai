import React from 'react';
import { SkeletonBase } from './SkeletonBase';

interface SkeletonIconProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'square' | 'circle';
}

export const SkeletonIcon: React.FC<SkeletonIconProps> = ({
  className = '',
  size = 'md',
  variant = 'square'
}) => {
  const getSizeDimensions = () => {
    switch (size) {
      case 'xs': return '16px';
      case 'sm': return '20px';
      case 'md': return '24px';
      case 'lg': return '32px';
      case 'xl': return '40px';
      default: return '24px';
    }
  };

  const dimensions = getSizeDimensions();
  const rounded = variant === 'circle' ? 'full' : 'sm';

  return (
    <SkeletonBase
      className={className}
      width={dimensions}
      height={dimensions}
      rounded={rounded}
    />
  );
};

export default SkeletonIcon;
