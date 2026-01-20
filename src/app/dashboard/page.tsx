'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatisticsCards from '@/components/dashboard/StatisticsCards';
import ProgressBar from '@/components/dashboard/ProgressBar';
import TaskList from '@/components/tasks/TaskList';
import FloatingActionButton from '@/components/ui/FloatingActionButton';
import EditTaskModal from '@/components/tasks/EditTaskModal';
import { useTheme } from '@/contexts/ThemeContext';
import { useLoading } from '@/contexts/LoadingContext';
import { useToast } from '@/contexts/ToastContext';
import { NotificationTypeEnum } from '@/types/ui';

// Define the Task type to match TaskList expectations
interface Task {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

// Mock data for demonstration
const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Complete project proposal',
    description: 'Finish the proposal document and send to client',
    isCompleted: false,
    priority: 'high',
    dueDate: '2026-01-20',
    createdAt: '2026-01-15',
    updatedAt: '2026-01-15',
  },
  {
    id: '2',
    title: 'Schedule team meeting',
    description: 'Arrange meeting for next week to discuss roadmap',
    isCompleted: true,
    priority: 'medium',
    dueDate: '2026-01-18',
    createdAt: '2026-01-14',
    updatedAt: '2026-01-16',
    completedAt: '2026-01-16',
  },
  {
    id: '3',
    title: 'Review pull requests',
    description: 'Review and merge outstanding PRs in the project',
    isCompleted: false,
    priority: 'low',
    dueDate: '2026-01-22',
    createdAt: '2026-01-15',
    updatedAt: '2026-01-15',
  },
];

const DashboardPage: React.FC = () => {
  const { theme } = useTheme();
  const { showLoading, hideLoading } = useLoading();
  const { showToast } = useToast();
  const [tasks, setTasks] = useState(mockTasks);
  const [filteredTasks, setFilteredTasks] = useState(mockTasks);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'dateCreated' | 'dueDate' | 'priority' | 'title'>('dateCreated');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true); // Loading state for dashboard sections

  // Simulate loading data
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Calculate statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.isCompleted).length;
  const pendingTasks = totalTasks - completedTasks;
  const overdueTasks = tasks.filter(task =>
    !task.isCompleted && task.dueDate && new Date(task.dueDate) < new Date()
  ).length;

  // Calculate completion percentage
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Apply filters and sorting
  useEffect(() => {
    let result = [...tasks];

    // Apply filter
    if (filter === 'active') {
      result = result.filter(task => !task.isCompleted);
    } else if (filter === 'completed') {
      result = result.filter(task => task.isCompleted);
    }

    // Apply search
    if (searchTerm) {
      result = result.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'dateCreated':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'dueDate':
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'priority':
          const priorityOrder: Record<string, number> = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority || 'low'] - priorityOrder[a.priority || 'low'];
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    setFilteredTasks(result);
  }, [tasks, filter, sortBy, searchTerm]);

  const handleToggleTask = (taskId: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId
          ? {
              ...task,
              isCompleted: !task.isCompleted,
              completedAt: !task.isCompleted ? new Date().toISOString() : undefined
            }
          : task
      )
    );
    showToast(`Task ${tasks.find(t => t.id === taskId)?.isCompleted ? 'marked incomplete' : 'completed'}`, NotificationTypeEnum.SUCCESS);
  };

  const handleEditTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    setCurrentTask(task);
    setIsModalOpen(true);
  };

  const handleDeleteTask = (taskId: string) => {
    showLoading('deleteTask', 'apiCall', 'Deleting task...');
    setTimeout(() => {
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      hideLoading('deleteTask');
      showToast('Task deleted successfully', NotificationTypeEnum.SUCCESS);
    }, 1000);
  };

  const handleSaveTask = (taskData: any) => {
    showLoading('saveTask', 'apiCall', taskData.id ? 'Updating task...' : 'Creating task...');

    setTimeout(() => {
      if (currentTask) {
        // Update existing task
        setTasks(prevTasks =>
          prevTasks.map(task =>
            task.id === currentTask.id ? { ...task, ...taskData } : task
          )
        );
        showToast('Task updated successfully', NotificationTypeEnum.SUCCESS);
      } else {
        // Create new task
        const newTask = {
          id: `task-${Date.now()}`,
          ...taskData,
          isCompleted: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setTasks(prevTasks => [newTask, ...prevTasks]);
        showToast('Task created successfully', NotificationTypeEnum.SUCCESS);
      }

      hideLoading('saveTask');
      setIsModalOpen(false);
      setCurrentTask(null);
    }, 1000);
  };

  const handleAddTask = () => {
    setCurrentTask(null);
    setIsModalOpen(true);
  };

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h1
            className="text-3xl font-bold"
            style={{ color: theme.colors.text.primary }}
          >
            Dashboard
          </h1>
          <p
            className="mt-2"
            style={{ color: theme.colors.text.secondary }}
          >
            Manage your tasks efficiently
          </p>
        </div>

        {/* Statistics Cards - Loading animation */}
        {isLoading ? (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8"
            animate={{
              opacity: [0.5, 1, 0.5],
              transition: {
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
          >
            {[...Array(4)].map((_, idx) => (
              <div
                key={idx}
                className="matte-card p-4 sm:p-6 rounded-xl"
                style={{ backgroundColor: theme.colors.surface }}
              >
                <div className="h-4 bg-surface-600 rounded w-3/4 mb-4" style={{ backgroundColor: theme.colors.surface }}></div>
                <div className="h-6 sm:h-8 bg-surface-600 rounded w-1/2" style={{ backgroundColor: theme.colors.surface }}></div>
              </div>
            ))}
          </motion.div>
        ) : (
          <StatisticsCards
            totalTasks={totalTasks}
            completedTasks={completedTasks}
            pendingTasks={pendingTasks}
            overdueTasks={overdueTasks}
          />
        )}

        {/* Progress Bar - Loading animation */}
        <div className="mb-8">
          {isLoading ? (
            <motion.div
              className="matte-card p-6 rounded-xl"
              style={{ backgroundColor: theme.colors.surface }}
              animate={{
                opacity: [0.5, 1, 0.5],
                transition: {
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }
              }}
            >
              <div className="h-4 bg-surface-600 rounded w-1/3 mb-4" style={{ backgroundColor: theme.colors.surface }}></div>
              <div className="h-6 bg-surface-600 rounded" style={{ backgroundColor: theme.colors.surface }}></div>
            </motion.div>
          ) : (
            <ProgressBar
              percentage={completionPercentage}
              label="Overall Progress"
              color={theme.colors.accent}
            />
          )}
        </div>

        {/* Task Management Section */}
        <div
          className="rounded-xl p-6 border"
          style={{
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border
          }}
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2
              className="text-xl font-semibold"
              style={{ color: theme.colors.text.primary }}
            >
              My Tasks
            </h2>

            <div className="flex flex-col sm:flex-row flex-wrap gap-3 w-full sm:w-auto">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="matte-input mb-2 sm:mb-0"
                style={{
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.text.primary,
                  borderColor: theme.colors.border
                }}
              >
                <option value="all">All Tasks</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="matte-input mb-2 sm:mb-0"
                style={{
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.text.primary,
                  borderColor: theme.colors.border
                }}
              >
                <option value="dateCreated">Date Created</option>
                <option value="dueDate">Due Date</option>
                <option value="priority">Priority</option>
                <option value="title">Title</option>
              </select>

              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="matte-input flex-grow min-w-[150px]"
                style={{
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.text.primary,
                  borderColor: theme.colors.border
                }}
              />
            </div>
          </div>

          {/* Task List - Loading animation */}
          {isLoading ? (
            <motion.div
              animate={{
                opacity: [0.5, 1, 0.5],
                transition: {
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }
              }}
            >
              {[...Array(3)].map((_, idx) => (
                <div
                  key={idx}
                  className="matte-card p-4 rounded-lg mb-3"
                  style={{
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border
                  }}
                >
                  <div className="flex items-center">
                    <div className="h-5 w-5 rounded-full bg-surface-600 mr-3" style={{ backgroundColor: theme.colors.surface }}></div>
                    <div className="flex-1">
                      <div className="h-4 bg-surface-600 rounded w-3/4 mb-2" style={{ backgroundColor: theme.colors.surface }}></div>
                      <div className="h-3 bg-surface-600 rounded w-1/2" style={{ backgroundColor: theme.colors.surface }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          ) : (
            <TaskList
              tasks={filteredTasks}
              onToggle={handleToggleTask}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
              showPriorityIndicator={true}
              showDueDate={true}
            />
          )}
        </div>

        {/* Floating Action Button */}
        <FloatingActionButton
          onClick={handleAddTask}
          tooltip="Add new task"
        />

        {/* Task Modal */}
        <EditTaskModal
          isOpen={isModalOpen}
          task={currentTask}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveTask}
        />
      </motion.div>
    </DashboardLayout>
  );
};

export default DashboardPage;