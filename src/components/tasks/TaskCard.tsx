'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircleIcon, CircleStackIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useTheme } from '@/contexts/ThemeContext';

interface Task {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

interface TaskCardProps {
  task: Task;
  onToggle: (taskId: string) => void;
  onEdit: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  showPriorityIndicator?: boolean;
  showDueDate?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggle,
  onEdit,
  onDelete,
  showPriorityIndicator = true,
  showDueDate = true
}) => {
  const { theme } = useTheme();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const cardBg = theme.mode === 'dark'
    ? task.isCompleted ? 'bg-gray-700/50' : 'bg-gray-800/50'
    : task.isCompleted ? 'bg-gray-100' : 'bg-white';

  const borderColor = task.isCompleted
    ? 'border-gray-500'
    : task.priority === 'high'
      ? 'border-red-500'
      : task.priority === 'medium'
        ? 'border-yellow-500'
        : 'border-purple-500';

  return (
    <motion.div
      className={`card border-l-4 ${borderColor} rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-start gap-3`}
      style={{
        background: cardBg,
        boxShadow: `0 2px 6px ${theme.colors.accent}33`, // subtle purple shadow
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{
        y: -5,
        boxShadow: `0 8px 20px ${theme.colors.accent}55`, // purple hover shadow
      }}
    >
      {/* Toggle complete */}
      <button
        onClick={() => onToggle(task.id)}
        className={`flex-shrink-0 h-6 w-6 rounded-full border flex items-center justify-center ${
          task.isCompleted
            ? 'bg-green-500/20 border-green-500 text-green-500'
            : 'border-gray-400 dark:border-gray-600 hover:border-purple-500 transition-colors'
        }`}
        aria-label={task.isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
      >
        {task.isCompleted && <CheckCircleIcon className="h-4 w-4" />}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0 flex-1">
        <h3
          className={`text-base sm:text-lg font-semibold truncate ${task.isCompleted ? 'line-through' : ''}`}
          style={{
            color: task.isCompleted
              ? theme.colors.text.disabled
              : theme.colors.text.primary
          }}
        >
          {task.title}
        </h3>

        {task.description && (
          <p
            className="text-xs sm:text-sm mt-1"
            style={{
              color: task.isCompleted
                ? theme.colors.text.disabled
                : theme.colors.text.secondary
            }}
          >
            {task.description}
          </p>
        )}

        <div className="flex flex-wrap items-center mt-2 sm:mt-3 gap-2">
          {showPriorityIndicator && task.priority && (
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium text-white ${getPriorityColor(task.priority)}`}>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </span>
          )}

          {showDueDate && task.dueDate && (
            <div className="flex items-center text-xs sm:text-sm text-gray-500 dark:text-gray-400 gap-1">
              <CircleStackIcon className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-row sm:flex-col space-x-2 sm:space-x-0 sm:space-y-2 ml-3 sm:ml-0">
        <button
          onClick={() => onEdit(task.id)}
          className="text-gray-400 dark:text-gray-300 hover:text-purple-500 dark:hover:text-purple-400 transition-colors"
          aria-label="Edit task"
        >
          <PencilIcon className="h-4 sm:h-5 w-4 sm:w-5" />
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="text-gray-400 dark:text-gray-300 hover:text-red-500 transition-colors"
          aria-label="Delete task"
        >
          <TrashIcon className="h-4 sm:h-5 w-4 sm:w-5" />
        </button>
      </div>
    </motion.div>
  );
};

export default TaskCard;
