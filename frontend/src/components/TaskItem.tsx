import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from '@tanstack/react-form';
import { tasksAPI, extractErrorMessage } from '../utils/api';
import { isTaskFinished as _isTaskFinished } from "@shared/utils.ts";
import type { Task } from '@shared/types.ts';

interface TaskItemProps {
  task: Task;
  projectId: number;
  onToggle: (isCompleted: boolean) => void;
  onDelete: () => void;
  onUpdate: () => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, projectId, onToggle, onDelete, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string>('');

  const updateTaskMutation = useMutation({
    mutationFn: ({ projectId, taskId, data }: { projectId: number; taskId: number; data: any }) => tasksAPI.update(projectId, taskId, data),
    onSuccess: () => {
      setIsEditing(false);
      onUpdate();
    },
    onError: (err) => {
      setError(extractErrorMessage(err));
    },
  });

  const form = useForm({
    defaultValues: {
      title: task.title,
      description: task.description || '',
      finishDate: task.finishDate ? new Date(task.finishDate).toISOString().split('T')[0] : '',
    },
    onSubmit: async ({ value }) => {
      try {
        setError('');
        await updateTaskMutation.mutateAsync({
          projectId,
          taskId: task.id,
          data: {
            title: value.title,
            description: value.description || undefined,
            finishDate: value.finishDate || undefined,
          },
        });
      } catch (err) {
        // Error is handled by mutation onError
      }
    },
  });

  const handleToggle = () => {
    onToggle(!task.isCompleted);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      onDelete();
    }
  };

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Check if task is finished (past finish date)
  const isTaskFinished = _isTaskFinished(task.finishDate);
  const isOverdue = isTaskFinished && !task.isCompleted;

  if (isEditing) {
    return (
      <div className="p-3 border border-gray-200 rounded-md bg-gray-50">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm mb-3">
            {error}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-3"
        >
          <form.Field
            name="title"
            validators={{
              onChange: ({ value }) => {
                if (!value) return 'Title is required';
                return undefined;
              },
            }}
          >
            {(field) => (
              <div>
                <input
                  name={field.name}
                  type="text"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="input text-sm"
                  placeholder="Task title"
                />
                {field.state.meta.errors.length > 0 && field.state.meta.isTouched ? (
                  <div className="text-red-600 text-xs mt-1">{field.state.meta.errors[0]}</div>
                ) : null}
              </div>
            )}
          </form.Field>

          <form.Field name="description">
            {(field) => (
              <div>
                <textarea
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="input text-sm"
                  rows={2}
                  placeholder="Task description (optional)"
                />
              </div>
            )}
          </form.Field>

          <form.Field name="finishDate">
            {(field) => (
              <div>
                <input
                  name={field.name}
                  type="date"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="input text-sm"
                />
              </div>
            )}
          </form.Field>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="btn-secondary text-xs"
            >
              Cancel
            </button>
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
            >
              {([canSubmit, isSubmitting]) => (
                <button
                  type="submit"
                  disabled={!canSubmit || isSubmitting || updateTaskMutation.isPending}
                  className="btn-primary text-xs"
                >
                  {isSubmitting || updateTaskMutation.isPending ? 'Saving...' : 'Save'}
                </button>
              )}
            </form.Subscribe>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className={`p-3 border rounded-md transition-colors ${
      task.isCompleted ? 'task-completed' : 'task-pending'
    } ${isOverdue ? 'border-red-300 bg-red-50' : ''}`}>
      <div className="flex items-start space-x-3">
        <input
          type="checkbox"
          checked={task.isCompleted}
          onChange={handleToggle}
          disabled={isTaskFinished || false}
          className={`mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
            isTaskFinished ? 'cursor-not-allowed' : ''
          }`}
        />

        <div className="flex-1 min-w-0">
          <h4 className={`text-sm font-medium ${
            task.isCompleted ? 'line-through text-gray-500' : 'text-gray-900'
          }`}>
            {task.title}
          </h4>
          {task.description && (
            <p className={`text-xs mt-1 ${
              task.isCompleted ? 'line-through text-gray-400' : 'text-gray-600'
            }`}>
              {task.description}
            </p>
          )}

          {task.finishDate && (
            <div className="mt-2">
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  isOverdue
                    ? 'bg-red-100 text-red-800'
                    : task.isCompleted
                    ? 'bg-green-100 text-green-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
                title={`Due date: ${formatDate(task.finishDate)}`}
              >
                📅 {formatDate(task.finishDate)}
                {isOverdue && ' (Overdue)'}
              </span>
            </div>
          )}
        </div>

        {!task.isCompleted && !isTaskFinished && (
          <div className="flex space-x-1">
            <button
              onClick={() => setIsEditing(true)}
              className="text-gray-400 hover:text-gray-600 p-1"
              title="Edit task"
            >
              ✏️
            </button>
            <button
              onClick={handleDelete}
              className="text-gray-400 hover:text-red-600 p-1"
              title="Delete task"
            >
              🗑️
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
