import React from 'react';

interface SkeletonBaseProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  animate?: boolean;
  children?: React.ReactNode;
}

export const SkeletonBase: React.FC<SkeletonBaseProps> = ({
  className = '',
  width,
  height,
  rounded = 'md',
  animate = true,
  children
}) => {
  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full'
  };

  const baseClasses = `
    bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 
    dark:from-slate-700 dark:via-slate-600 dark:to-slate-700
    ${animate ? 'animate-pulse' : ''}
    ${roundedClasses[rounded]}
    ${className}
  `;

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div className={baseClasses} style={style}>
      {children}
    </div>
  );
};

export default SkeletonBase;
