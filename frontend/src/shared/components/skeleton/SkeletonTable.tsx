import React from 'react';
import { SkeletonBase } from './SkeletonBase';
import { SkeletonText } from './SkeletonText';

interface SkeletonTableProps {
  className?: string;
  rows?: number;
  columns?: number;
  withHeader?: boolean;
  withActions?: boolean;
  columnWidths?: string[];
}

export const SkeletonTable: React.FC<SkeletonTableProps> = ({
  className = '',
  rows = 5,
  columns = 4,
  withHeader = true,
  withActions = false,
  columnWidths = []
}) => {
  const actualColumns = withActions ? columns + 1 : columns;
  const defaultColumnWidths = Array(actualColumns).fill('1fr');
  const gridColumns = columnWidths.length > 0 ? columnWidths : defaultColumnWidths;

  return (
    <div className={`bg-white dark:bg-surface rounded-xl shadow-sm border border-gray-100 dark:border-border overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <div className="min-w-full">
          {/* Table Header */}
          {withHeader && (
            <div 
              className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-primary-900/20 dark:to-primary-800/20 px-6 py-3 border-b border-gray-200 dark:border-border grid gap-4"
              style={{ gridTemplateColumns: gridColumns.join(' ') }}
            >
              {Array.from({ length: actualColumns }).map((_, index) => (
                <div key={`header-${index}`}>
                  <SkeletonText 
                    variant="caption" 
                    width={index === actualColumns - 1 && withActions ? '60px' : '80%'} 
                  />
                </div>
              ))}
            </div>
          )}
          
          {/* Table Body */}
          <div className="divide-y divide-gray-200 dark:divide-border">
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <div 
                key={`row-${rowIndex}`}
                className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-surface-secondary grid gap-4 items-center"
                style={{ gridTemplateColumns: gridColumns.join(' ') }}
              >
                {Array.from({ length: actualColumns }).map((_, colIndex) => (
                  <div key={`cell-${rowIndex}-${colIndex}`}>
                    {colIndex === actualColumns - 1 && withActions ? (
                      <div className="flex space-x-2">
                        <SkeletonBase width="24px" height="24px" rounded="sm" />
                        <SkeletonBase width="24px" height="24px" rounded="sm" />
                      </div>
                    ) : (
                      <SkeletonText 
                        variant="body" 
                        width={colIndex === 0 ? '90%' : `${60 + Math.random() * 30}%`} 
                      />
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonTable;
