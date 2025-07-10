import React from 'react';
import { SkeletonBase } from './SkeletonBase';
import { SkeletonText } from './SkeletonText';

interface SkeletonChartProps {
  className?: string;
  type?: 'bar' | 'line' | 'pie' | 'area' | 'donut';
  width?: string | number;
  height?: string | number;
  withTitle?: boolean;
  withLegend?: boolean;
  withAxes?: boolean;
}

export const SkeletonChart: React.FC<SkeletonChartProps> = ({
  className = '',
  type = 'bar',
  width = '100%',
  height = '300px',
  withTitle = true,
  withLegend = false,
  withAxes = true
}) => {
  const renderChart = () => {
    switch (type) {
      case 'bar':
        return (
          <div className="flex items-end justify-between h-full space-x-2 px-4 pb-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonBase
                key={`bar-${index}`}
                width="40px"
                height={`${60 + Math.random() * 120}px`}
                rounded="sm"
                className="bg-gradient-to-t from-purple-200 to-purple-300 dark:from-primary-700 dark:to-primary-600"
              />
            ))}
          </div>
        );

      case 'line':
        return (
          <div className="relative h-full p-4">
            <svg className="w-full h-full" viewBox="0 0 400 200">
              <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgb(147, 51, 234)" stopOpacity="0.3" />
                  <stop offset="50%" stopColor="rgb(168, 85, 247)" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="rgb(196, 181, 253)" stopOpacity="0.3" />
                </linearGradient>
              </defs>
              <path
                d="M 20 150 Q 100 100 180 120 T 380 80"
                stroke="url(#lineGradient)"
                strokeWidth="3"
                fill="none"
                className="animate-pulse"
              />
              {Array.from({ length: 6 }).map((_, index) => (
                <circle
                  key={`point-${index}`}
                  cx={20 + index * 60}
                  cy={150 - Math.random() * 80}
                  r="4"
                  fill="rgb(147, 51, 234)"
                  className="animate-pulse"
                />
              ))}
            </svg>
          </div>
        );

      case 'pie':
      case 'donut':
        return (
          <div className="flex items-center justify-center h-full">
            <div className="relative">
              <SkeletonBase
                width="200px"
                height="200px"
                rounded="full"
                className="bg-gradient-to-r from-purple-200 via-pink-200 to-purple-300 dark:from-primary-700 dark:via-primary-600 dark:to-primary-500"
              />
              {type === 'donut' && (
                <SkeletonBase
                  width="120px"
                  height="120px"
                  rounded="full"
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-surface"
                />
              )}
            </div>
          </div>
        );

      case 'area':
        return (
          <div className="relative h-full p-4">
            <svg className="w-full h-full" viewBox="0 0 400 200">
              <defs>
                <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgb(147, 51, 234)" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="rgb(147, 51, 234)" stopOpacity="0.1" />
                </linearGradient>
              </defs>
              <path
                d="M 20 150 Q 100 100 180 120 T 380 80 L 380 180 L 20 180 Z"
                fill="url(#areaGradient)"
                className="animate-pulse"
              />
            </svg>
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center h-full">
            <SkeletonBase width="80%" height="80%" rounded="lg" />
          </div>
        );
    }
  };

  return (
    <div className={`bg-white dark:bg-surface rounded-xl shadow-sm border border-gray-100 dark:border-border p-6 ${className}`}>
      {/* Title */}
      {withTitle && (
        <div className="mb-4">
          <SkeletonText variant="h3" width="200px" className="mb-2" />
          <SkeletonText variant="caption" width="300px" />
        </div>
      )}

      {/* Chart Container */}
      <div className="relative" style={{ width, height }}>
        {/* Y-axis labels */}
        {withAxes && type !== 'pie' && type !== 'donut' && (
          <div className="absolute left-0 top-0 h-full flex flex-col justify-between py-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <SkeletonText key={`y-axis-${index}`} variant="caption" width="30px" />
            ))}
          </div>
        )}

        {/* Chart */}
        <div className="ml-8">
          {renderChart()}
        </div>

        {/* X-axis labels */}
        {withAxes && type !== 'pie' && type !== 'donut' && (
          <div className="flex justify-between mt-2 ml-8">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonText key={`x-axis-${index}`} variant="caption" width="40px" />
            ))}
          </div>
        )}
      </div>

      {/* Legend */}
      {withLegend && (
        <div className="mt-4 flex flex-wrap gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={`legend-${index}`} className="flex items-center space-x-2">
              <SkeletonBase width="12px" height="12px" rounded="sm" />
              <SkeletonText variant="caption" width="60px" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SkeletonChart;
