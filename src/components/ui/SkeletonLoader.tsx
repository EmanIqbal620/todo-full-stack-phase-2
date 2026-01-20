import React from 'react';
import { SkeletonLoaderProps } from '@/types/ui';

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  type = 'card',
  width,
  height,
  count = 1
}) => {
  const baseClasses = "rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse";

  const getTypeDimensions = () => {
    switch (type) {
      case 'card':
        return {
          width: width || '100%',
          height: height || '120px',
          classes: `${baseClasses} rounded-lg`,
        };
      case 'text':
        return {
          width: width || '100%',
          height: height || '16px',
          classes: `${baseClasses} rounded`,
        };
      case 'avatar':
        return {
          width: width || '40px',
          height: height || '40px',
          classes: `${baseClasses} rounded-full`,
        };
      case 'image':
        return {
          width: width || '100%',
          height: height || '200px',
          classes: `${baseClasses} rounded`,
        };
      default:
        return {
          width: width || '100%',
          height: height || '120px',
          classes: `${baseClasses}`,
        };
    }
  };

  const { width: compWidth, height: compHeight, classes } = getTypeDimensions();

  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={classes}
          style={{
            width: typeof compWidth === 'number' ? `${compWidth}px` : compWidth,
            height: typeof compHeight === 'number' ? `${compHeight}px` : compHeight,
          }}
        />
      ))}
    </div>
  );
};

export default SkeletonLoader;