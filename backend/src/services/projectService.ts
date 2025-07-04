import { eq, and } from 'drizzle-orm';
import db from '../database/connection.ts';
import { projects, tasks } from '../database/schema.ts';
import type { CreateProjectRequest, UpdateProjectRequest, ProjectWithTasks, CreateTaskRequest, UpdateTaskRequest, Task } from '../../../shared/types.ts';

export class ProjectService {
  // Project operations
  static async getUserProjects(userId: number): Promise<ProjectWithTasks[]> {
    const userProjects = await db.select().from(projects).where(eq(projects.userId, userId));

    const projectsWithTasks: ProjectWithTasks[] = await Promise.all(
      userProjects.map(async (project) => {
        const projectTasks = await db.select().from(tasks).where(eq(tasks.projectId, project.id));
        return {
          ...project,
          tasks: projectTasks
        };
      })
    );

    return projectsWithTasks;
  }

  static async createProject(userId: number, data: CreateProjectRequest): Promise<ProjectWithTasks> {
    const [newProject] = await db.insert(projects).values({
      name: data.name,
      description: data.description,
      userId,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();

    return {
      ...newProject,
      tasks: []
    };
  }

  static async updateProject(userId: number, projectId: number, data: UpdateProjectRequest): Promise<ProjectWithTasks> {
    // Check if project exists and belongs to user
    const [existingProject] = await db.select().from(projects)
      .where(and(eq(projects.id, projectId), eq(projects.userId, userId)))
      .limit(1);

    if (!existingProject) {
      throw new Error('Project not found');
    }

    // Update project
    const [updatedProject] = await db.update(projects)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(projects.id, projectId))
      .returning();

    // Get tasks for the updated project
    const projectTasks = await db.select().from(tasks).where(eq(tasks.projectId, projectId));

    return {
      ...updatedProject,
      tasks: projectTasks
    };
  }

  static async deleteProject(userId: number, projectId: number): Promise<void> {
    // Check if project exists and belongs to user
    const [existingProject] = await db.select().from(projects)
      .where(and(eq(projects.id, projectId), eq(projects.userId, userId)))
      .limit(1);

    if (!existingProject) {
      throw new Error('Project not found');
    }

    // Delete project (tasks will be deleted automatically due to cascade)
    await db.delete(projects).where(eq(projects.id, projectId));
  }

  static async verifyProjectOwnership(projectId: number, userId: number): Promise<boolean> {
    const [project] = await db.select()
      .from(projects)
      .where(and(eq(projects.id, projectId), eq(projects.userId, userId)))
      .limit(1);
    return !!project;
  }

  // Task operations
  static async getProjectTasks(projectId: number): Promise<Task[]> {
    return await db.select().from(tasks).where(eq(tasks.projectId, projectId));
  }

  static async createTask(projectId: number, data: CreateTaskRequest): Promise<Task> {
    const [newTask] = await db.insert(tasks).values({
      title: data.title,
      description: data.description,
      finishDate: data.finishDate ? new Date(data.finishDate) : null,
      projectId,
      isCompleted: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();

    return newTask;
  }

  static async updateTask(taskId: number, data: UpdateTaskRequest): Promise<Task> {
    const [updatedTask] = await db.update(tasks)
      .set({
        ...data,
        finishDate: data.finishDate ? new Date(data.finishDate) : undefined,
        updatedAt: new Date()
      })
      .where(eq(tasks.id, taskId))
      .returning();

    return updatedTask;
  }

  static async toggleTaskCompletion(taskId: number, isCompleted: boolean): Promise<Task> {
    const [updatedTask] = await db.update(tasks)
      .set({
        isCompleted,
        updatedAt: new Date()
      })
      .where(eq(tasks.id, taskId))
      .returning();

    return updatedTask;
  }

  static async deleteTask(taskId: number): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, taskId));
  }

  static async verifyTaskOwnership(taskId: number, userId: number): Promise<{ task: Task; project: any } | null> {
    const result = await db.select({
      task: tasks,
      project: projects
    })
    .from(tasks)
    .innerJoin(projects, eq(tasks.projectId, projects.id))
    .where(and(eq(tasks.id, taskId), eq(projects.userId, userId)))
    .limit(1);
    
    return result.length > 0 ? result[0] : null;
  }
} 