import React from 'react';
import { SkeletonBase } from './SkeletonBase';

interface SkeletonTextProps {
  lines?: number;
  className?: string;
  width?: string | number;
  height?: string | number;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body' | 'caption';
  lastLineWidth?: string;
}

export const SkeletonText: React.FC<SkeletonTextProps> = ({
  lines = 1,
  className = '',
  width,
  height,
  variant = 'body',
  lastLineWidth = '75%'
}) => {
  const getVariantHeight = () => {
    switch (variant) {
      case 'h1': return '2.5rem';
      case 'h2': return '2rem';
      case 'h3': return '1.75rem';
      case 'h4': return '1.5rem';
      case 'h5': return '1.25rem';
      case 'h6': return '1.125rem';
      case 'body': return '1.25rem';
      case 'caption': return '1rem';
      default: return '1.25rem';
    }
  };

  const lineHeight = height || getVariantHeight();

  if (lines === 1) {
    return (
      <SkeletonBase
        className={className}
        width={width || '100%'}
        height={lineHeight}
        rounded="sm"
      />
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <SkeletonBase
          key={index}
          width={index === lines - 1 ? lastLineWidth : '100%'}
          height={lineHeight}
          rounded="sm"
        />
      ))}
    </div>
  );
};

export default SkeletonText;
