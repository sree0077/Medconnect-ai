import React from 'react';
import { SkeletonBase } from './SkeletonBase';

interface SkeletonAvatarProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  shape?: 'circle' | 'square';
}

export const SkeletonAvatar: React.FC<SkeletonAvatarProps> = ({
  className = '',
  size = 'md',
  shape = 'circle'
}) => {
  const getSizeDimensions = () => {
    switch (size) {
      case 'xs': return '24px';
      case 'sm': return '32px';
      case 'md': return '40px';
      case 'lg': return '48px';
      case 'xl': return '64px';
      case '2xl': return '80px';
      default: return '40px';
    }
  };

  const dimensions = getSizeDimensions();
  const rounded = shape === 'circle' ? 'full' : 'lg';

  return (
    <SkeletonBase
      className={className}
      width={dimensions}
      height={dimensions}
      rounded={rounded}
    />
  );
};

export default SkeletonAvatar;
