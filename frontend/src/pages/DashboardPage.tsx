import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { projectsAPI, extractErrorMessage } from '../utils/api';
import { ProjectCard } from '../components/ProjectCard';
import { CreateProjectForm } from '../components/CreateProjectForm';
import type { ProjectWithTasks } from '@shared/types';

export const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [isCreatingProject, setIsCreatingProject] = useState(false);

  const {
    data: projects = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['projects'],
    queryFn: projectsAPI.getAll,
    staleTime: 30000, // 30 seconds
  });

  const handleCreateProject = () => {
    setIsCreatingProject(false);
    refetch();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your projects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{extractErrorMessage(error)}</p>
          <button onClick={() => refetch()} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Task Manager</h1>
              <p className="text-gray-600">Welcome back, {user?.name}!</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsCreatingProject(true)}
                className="btn-primary"
              >
                New Project
              </button>
              <button
                onClick={logout}
                className="btn-secondary"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Create Project Form */}
        {isCreatingProject && (
          <div className="mb-8">
            <CreateProjectForm
              onSuccess={handleCreateProject}
              onCancel={() => setIsCreatingProject(false)}
            />
          </div>
        )}

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No projects yet</h3>
            <p className="text-gray-600 mb-6">Create your first project to get started!</p>
            <button
              onClick={() => setIsCreatingProject(true)}
              className="btn-primary"
            >
              Create Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {projects.map((project: ProjectWithTasks) => (
              <ProjectCard
                key={project.id}
                project={project}
                onUpdate={refetch}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}; 