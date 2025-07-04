import React, { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { useAuth } from '../context/AuthContext';
import { extractErrorMessage } from '../utils/api';

interface RegisterFormProps {
  onToggleMode: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onToggleMode }) => {
  const { register, isLoading } = useAuth();
  const [error, setError] = useState<string>('');

  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    onSubmit: async ({ value }) => {
      try {
        setError('');
        if (value.password !== value.confirmPassword) {
          setError('Passwords do not match');
          return;
        }
        await register(value.email, value.password, value.name);
      } catch (err) {
        setError(extractErrorMessage(err));
      }
    },
  });

  return (
    <div className="card max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6">Sign Up</h2>
      
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
          validators={{
            onChange: ({ value }) => {
              if (!value) return 'Name is required';
              if (value.length < 2) return 'Name must be at least 2 characters';
              return undefined;
            },
          }}
        >
          {(field) => (
            <div>
              <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                id={field.name}
                name={field.name}
                type="text"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="input"
                placeholder="Enter your full name"
              />
              {field.state.meta.errors.length > 0 && field.state.meta.isTouched ? (
                <div className="text-red-600 text-sm mt-1">{field.state.meta.errors[0]}</div>
              ) : null}
            </div>
          )}
        </form.Field>

        <form.Field
          name="email"
          validators={{
            onChange: ({ value }) => {
              if (!value) return 'Email is required';
              if (!/\S+@\S+\.\S+/.test(value)) return 'Email is invalid';
              return undefined;
            },
          }}
        >
          {(field) => (
            <div>
              <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id={field.name}
                name={field.name}
                type="email"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="input"
                placeholder="Enter your email"
              />
              {field.state.meta.errors.length > 0 && field.state.meta.isTouched ? (
                <div className="text-red-600 text-sm mt-1">{field.state.meta.errors[0]}</div>
              ) : null}
            </div>
          )}
        </form.Field>

        <form.Field
          name="password"
          validators={{
            onChange: ({ value }) => {
              if (!value) return 'Password is required';
              if (value.length < 6) return 'Password must be at least 6 characters';
              return undefined;
            },
          }}
        >
          {(field) => (
            <div>
              <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id={field.name}
                name={field.name}
                type="password"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="input"
                placeholder="Enter your password"
              />
              {field.state.meta.errors.length > 0 && field.state.meta.isTouched ? (
                <div className="text-red-600 text-sm mt-1">{field.state.meta.errors[0]}</div>
              ) : null}
            </div>
          )}
        </form.Field>

        <form.Field
          name="confirmPassword"
          validators={{
            onChange: ({ value }) => {
              if (!value) return 'Please confirm your password';
              return undefined;
            },
          }}
        >
          {(field) => (
            <div>
              <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                id={field.name}
                name={field.name}
                type="password"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="input"
                placeholder="Confirm your password"
              />
              {field.state.meta.errors.length > 0 && field.state.meta.isTouched ? (
                <div className="text-red-600 text-sm mt-1">{field.state.meta.errors[0]}</div>
              ) : null}
            </div>
          )}
        </form.Field>

        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
        >
          {([canSubmit, isSubmitting]) => (
            <button
              type="submit"
              disabled={!canSubmit || isSubmitting || isLoading}
              className="btn-primary w-full"
            >
              {isSubmitting || isLoading ? 'Creating account...' : 'Sign Up'}
            </button>
          )}
        </form.Subscribe>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Already have an account?{' '}
          <button
            onClick={onToggleMode}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}; 