'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

interface StatisticCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  change?: string;
  changeType?: 'positive' | 'negative';
}

const StatisticCard: React.FC<StatisticCardProps> = ({
  title,
  value,
  icon,
  change,
  changeType,
}) => {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25 }}
      className="
        rounded-2xl p-6
        bg-neutral-100
        dark:bg-[#0B0F1A]
        border border-neutral-200
        dark:border-purple-500/20
        shadow-md
        dark:shadow-[0_12px_40px_rgba(168,85,247,0.18)]
      "
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {title}
          </p>
          <p className="mt-1 text-3xl font-bold text-neutral-900 dark:text-white">
            {value}
          </p>
        </div>

        {icon && (
          <div
            className="
              h-12 w-12 rounded-xl
              flex items-center justify-center
              bg-purple-200 text-purple-700
              dark:bg-purple-500/10 dark:text-purple-400
            "
          >
            {icon}
          </div>
        )}
      </div>

      {change && (
        <p
          className={`mt-3 text-sm font-medium ${
            changeType === 'positive'
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          }`}
        >
          {change}
        </p>
      )}
    </motion.div>
  );
};

interface StatisticsCardsProps {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks?: number;
}

const StatisticsCards: React.FC<StatisticsCardsProps> = ({
  totalTasks,
  completedTasks,
  pendingTasks,
  overdueTasks = 0,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
      <StatisticCard
        title="Total Tasks"
        value={totalTasks}
        icon={<ClipboardDocumentListIcon className="h-6 w-6" />}
        change="+12% from last week"
        changeType="positive"
      />

      <StatisticCard
        title="Completed"
        value={completedTasks}
        icon={<CheckCircleIcon className="h-6 w-6" />}
        change="+8% from last week"
        changeType="positive"
      />

      <StatisticCard
        title="Pending"
        value={pendingTasks}
        icon={<ClockIcon className="h-6 w-6" />}
        change="-3% from last week"
        changeType="negative"
      />

      <StatisticCard
        title="Overdue"
        value={overdueTasks}
        icon={<ExclamationTriangleIcon className="h-6 w-6" />}
        change="+2 since yesterday"
        changeType="negative"
      />
    </div>
  );
};

export default StatisticsCards;
