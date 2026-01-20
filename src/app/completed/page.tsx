'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/layout/DashboardLayout';
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

// Mock data for demonstration - only completed tasks
const mockTasks: Task[] = [
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
    id: '4',
    title: 'Submit quarterly report',
    description: 'Complete and submit the Q4 financial report',
    isCompleted: true,
    priority: 'high',
    dueDate: '2026-01-10',
    createdAt: '2026-01-05',
    updatedAt: '2026-01-11',
    completedAt: '2026-01-11',
  },
  {
    id: '5',
    title: 'Update documentation',
    description: 'Review and update API documentation',
    isCompleted: true,
    priority: 'low',
    dueDate: '2026-01-12',
    createdAt: '2026-01-08',
    updatedAt: '2026-01-13',
    completedAt: '2026-01-13',
  },
];

const CompletedTasksPage: React.FC = () => {
  const { theme } = useTheme();
  const { showLoading, hideLoading } = useLoading();
  const { showToast } = useToast();
  const [tasks, setTasks] = useState(mockTasks);
  const [filteredTasks, setFilteredTasks] = useState(mockTasks);
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

  // Apply filters and sorting - only show completed tasks
  useEffect(() => {
    let result = [...tasks];

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
  }, [tasks, sortBy, searchTerm]);

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
            Completed Tasks
          </h1>
          <p
            className="mt-2"
            style={{ color: theme.colors.text.secondary }}
          >
            Your completed tasks and achievements
          </p>
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
              Completed Tasks
            </h2>

            <div className="flex flex-wrap gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="matte-input"
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
                placeholder="Search completed tasks..."
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

export default CompletedTasksPage;