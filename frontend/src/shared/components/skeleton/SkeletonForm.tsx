import React from 'react';
import { SkeletonInput } from './SkeletonInput';
import { SkeletonButton } from './SkeletonButton';
import { SkeletonText } from './SkeletonText';
import { SkeletonBase } from './SkeletonBase';

interface SkeletonFormProps {
  className?: string;
  fields?: number;
  withTitle?: boolean;
  withSubtitle?: boolean;
  withSubmitButton?: boolean;
  withSecondaryButton?: boolean;
  layout?: 'vertical' | 'horizontal' | 'grid';
  columns?: number;
}

export const SkeletonForm: React.FC<SkeletonFormProps> = ({
  className = '',
  fields = 4,
  withTitle = true,
  withSubtitle = false,
  withSubmitButton = true,
  withSecondaryButton = false,
  layout = 'vertical',
  columns = 2
}) => {
  const getLayoutClasses = () => {
    switch (layout) {
      case 'horizontal':
        return 'space-y-4';
      case 'grid':
        return `grid grid-cols-1 md:grid-cols-${columns} gap-4`;
      default:
        return 'space-y-5';
    }
  };

  const getFieldLayout = (index: number) => {
    if (layout === 'horizontal') {
      return 'flex items-center space-x-4';
    }
    return '';
  };

  return (
    <div className={`bg-white dark:bg-surface rounded-xl shadow-sm border border-gray-100 dark:border-border p-6 ${className}`}>
      {/* Form Header */}
      {(withTitle || withSubtitle) && (
        <div className="mb-6">
          {withTitle && (
            <SkeletonText variant="h3" width="200px" className="mb-2" />
          )}
          {withSubtitle && (
            <SkeletonText variant="body" width="300px" />
          )}
        </div>
      )}

      {/* Form Fields */}
      <div className={getLayoutClasses()}>
        {Array.from({ length: fields }).map((_, index) => (
          <div key={`field-${index}`} className={getFieldLayout(index)}>
            {layout === 'horizontal' && (
              <div className="w-32 flex-shrink-0">
                <SkeletonText variant="body" width="100%" />
              </div>
            )}
            <div className="flex-1">
              <SkeletonInput 
                withLabel={layout !== 'horizontal'}
                variant={index % 3 === 0 ? 'select' : index % 4 === 0 ? 'textarea' : 'input'}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Form Actions */}
      {(withSubmitButton || withSecondaryButton) && (
        <div className="mt-6 flex items-center justify-end space-x-3">
          {withSecondaryButton && (
            <SkeletonButton variant="secondary" width="100px" />
          )}
          {withSubmitButton && (
            <SkeletonButton variant="primary" width="120px" />
          )}
        </div>
      )}

      {/* Additional Form Elements */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <SkeletonBase width="16px" height="16px" rounded="sm" />
            <SkeletonText variant="caption" width="120px" />
          </div>
          <SkeletonText variant="caption" width="80px" />
        </div>
      </div>
    </div>
  );
};

export default SkeletonForm;
