import React, { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import { tasksAPI, extractErrorMessage } from '../utils/api';

interface CreateTaskFormProps {
  projectId: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export const CreateTaskForm: React.FC<CreateTaskFormProps> = ({ projectId, onSuccess, onCancel }) => {
  const [error, setError] = useState<string>('');

  const createTaskMutation = useMutation({
    mutationFn: ({ projectId, data }: { projectId: number; data: any }) => tasksAPI.create(projectId, data),
    onSuccess: () => {
      onSuccess();
    },
    onError: (err) => {
      setError(extractErrorMessage(err));
    },
  });

  const form = useForm({
    defaultValues: {
      title: '',
      description: '',
      finishDate: '',
    },
    onSubmit: async ({ value }) => {
      try {
        setError('');
        await createTaskMutation.mutateAsync({
          projectId,
          data: {
            title: value.title,
            description: value.description || undefined,
            finishDate: value.finishDate || undefined,
          },
        });
      } catch (err) {
        // Error is handled by the mutation onError
      }
    },
  });

  return (
    <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
      <h3 className="text-sm font-medium text-gray-900 mb-3">Add New Task</h3>

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
              if (!value) return 'Task title is required';
              if (value.length < 2) return 'Task title must be at least 2 characters';
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
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Due Date (Optional)
              </label>
              <input
                name={field.name}
                type="date"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="input text-sm"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          )}
        </form.Field>

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onCancel}
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
                disabled={!canSubmit || isSubmitting || createTaskMutation.isPending}
                className="btn-primary text-xs"
              >
                {isSubmitting || createTaskMutation.isPending ? 'Adding...' : 'Add Task'}
              </button>
            )}
          </form.Subscribe>
        </div>
      </form>
    </div>
  );
};
