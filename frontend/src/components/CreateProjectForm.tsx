import React, { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import { projectsAPI, extractErrorMessage } from '../utils/api';

interface CreateProjectFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const CreateProjectForm: React.FC<CreateProjectFormProps> = ({ onSuccess, onCancel }) => {
  const [error, setError] = useState<string>('');

  const createProjectMutation = useMutation({
    mutationFn: projectsAPI.create,
    onSuccess: () => {
      onSuccess();
    },
    onError: (err) => {
      setError(extractErrorMessage(err));
    },
  });

  const form = useForm({
    defaultValues: {
      name: '',
      description: '',
    },
    onSubmit: async ({ value }) => {
      try {
        setError('');
        await createProjectMutation.mutateAsync(value);
      } catch (err) {
        // Error is handled by the mutation onError
      }
    },
  });

  // Field validation functions
  const validateName = ({ value }: { value: string }) => {
    if (!value) return 'Project name is required';
    if (value.length < 2) return 'Project name must be at least 2 characters';
    return undefined;
  };

  return (
    <div className="card">
      <h2 className="text-xl font-bold mb-6">Create New Project</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-4"
      >
        <form.Field
          name="name"
          validators={{ onChange: validateName }}
        >
          {(field) => (
            <div>
              <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-1">
                Project Name
              </label>
              <input
                id={field.name}
                name={field.name}
                type="text"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="input"
                placeholder="Enter project name"
              />
              {field.state.meta.errors.length > 0 && field.state.meta.isTouched ? (
                <div className="text-red-600 text-sm mt-1">{field.state.meta.errors[0]}</div>
              ) : null}
            </div>
          )}
        </form.Field>

        <form.Field name="description">
          {(field) => (
            <div>
              <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <textarea
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="input"
                rows={3}
                placeholder="Enter project description"
              />
            </div>
          )}
        </form.Field>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
          >
            Cancel
          </button>
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <button
                type="submit"
                disabled={!canSubmit || isSubmitting || createProjectMutation.isPending}
                className="btn-primary"
              >
                {isSubmitting || createProjectMutation.isPending ? 'Creating...' : 'Create Project'}
              </button>
            )}
          </form.Subscribe>
        </div>
      </form>
    </div>
  );
};
