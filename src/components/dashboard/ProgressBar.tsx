import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  percentage: number;
  label?: string;
  color?: string;
  height?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  percentage,
  label = 'Progress',
  color = '#4B0076',
  height = 'h-3'
}) => {
  return (
    <div className="w-full">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium" style={{ color: 'currentColor' }}>{label}</span>
        <span className="text-sm font-medium" style={{ color: 'currentColor' }}>{percentage}%</span>
      </div>
      <div className="w-full rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(156, 163, 175, 0.3)' }}>
        <motion.div
          className={`${height} rounded-full`}
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;