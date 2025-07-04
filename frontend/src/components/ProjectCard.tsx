import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { projectsAPI, tasksAPI, extractErrorMessage } from '../utils/api';
import { TaskItem } from './TaskItem';
import { CreateTaskForm } from './CreateTaskForm';
import type { ProjectWithTasks } from '@shared/types';

interface ProjectCardProps {
  project: ProjectWithTasks;
  onUpdate: () => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onUpdate }) => {
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [projectName, setProjectName] = useState(project.name);
  const [projectDescription, setProjectDescription] = useState(project.description || '');
  const [error, setError] = useState<string>('');

  const deleteProjectMutation = useMutation({
    mutationFn: projectsAPI.delete,
    onSuccess: onUpdate,
    onError: (err) => {
      setError(extractErrorMessage(err));
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => projectsAPI.update(id, data),
    onSuccess: onUpdate,
    onError: (err) => {
      setError(extractErrorMessage(err));
    },
  });

  const toggleTaskMutation = useMutation({
    mutationFn: ({ projectId, taskId, isCompleted }: { projectId: number; taskId: number; isCompleted: boolean }) =>
      tasksAPI.toggleCompletion(projectId, taskId, { isCompleted }),
    onSuccess: onUpdate,
    onError: (err) => {
      setError(extractErrorMessage(err));
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: ({ projectId, taskId }: { projectId: number; taskId: number }) =>
      tasksAPI.delete(projectId, taskId),
    onSuccess: onUpdate,
    onError: (err) => {
      setError(extractErrorMessage(err));
    },
  });

  const handleDeleteProject = () => {
    if (window.confirm('Are you sure you want to delete this project? This will also delete all associated tasks.')) {
      deleteProjectMutation.mutate(project.id);
    }
  };

  const handleUpdateProject = () => {
    updateProjectMutation.mutate({
      id: project.id,
      data: {
        name: projectName,
        description: projectDescription,
      },
    });
    setIsEditingProject(false);
  };

  const handleTaskCreated = () => {
    setIsCreatingTask(false);
    onUpdate();
  };

  const completedTasks = project.tasks.filter(task => task.isCompleted).length;
  const totalTasks = project.tasks.length;

  return (
    <div className="card">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm mb-3">
          {error}
        </div>
      )}
      {/* Project Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          {isEditingProject ? (
            <div className="space-y-2">
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="input text-lg font-semibold"
                placeholder="Project name"
              />
              <textarea
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                className="input"
                rows={2}
                placeholder="Project description"
              />
              <div className="flex space-x-2">
                <button onClick={handleUpdateProject} className="btn-primary text-sm">
                  Save
                </button>
                <button
                  onClick={() => setIsEditingProject(false)}
                  className="btn-secondary text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{project.name}</h3>
              {project.description && (
                <p className="text-gray-600 text-sm mb-2">{project.description}</p>
              )}
              <div className="text-sm text-gray-500">
                {completedTasks}/{totalTasks} tasks completed
              </div>
            </div>
          )}
        </div>
        
        {!isEditingProject && (
          <div className="flex space-x-2">
            <button
              onClick={() => setIsEditingProject(true)}
              className="text-gray-400 hover:text-gray-600 p-1"
              title="Edit project"
            >
              ✏️
            </button>
            <button
              onClick={handleDeleteProject}
              className="text-gray-400 hover:text-red-600 p-1"
              title="Delete project"
            >
              🗑️
            </button>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {totalTasks > 0 && (
        <div className="mb-4">
          <div className="bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(completedTasks / totalTasks) * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Tasks List */}
      <div className="space-y-2 mb-4">
        {project.tasks.length === 0 ? (
          <p className="text-gray-500 text-sm italic">No tasks yet</p>
        ) : (
          project.tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              projectId={project.id}
              onToggle={(isCompleted) =>
                toggleTaskMutation.mutate({ projectId: project.id, taskId: task.id, isCompleted })
              }
              onDelete={() => deleteTaskMutation.mutate({ projectId: project.id, taskId: task.id })}
              onUpdate={onUpdate}
            />
          ))
        )}
      </div>

      {/* Create Task Form */}
      {isCreatingTask ? (
        <CreateTaskForm
          projectId={project.id}
          onSuccess={handleTaskCreated}
          onCancel={() => setIsCreatingTask(false)}
        />
      ) : (
        <button
          onClick={() => setIsCreatingTask(true)}
          className="w-full btn-secondary text-sm"
        >
          + Add Task
        </button>
      )}
    </div>
  );
}; 