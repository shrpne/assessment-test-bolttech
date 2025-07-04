import { Router } from "express";
import type { Request, Response } from "express";
import { z } from "zod";
import { authenticateToken } from "../middleware/auth.ts";
import { isTaskFinished } from "../../../shared/utils.ts";
import { ProjectService } from "../services/projectService.ts";
import type { CreateProjectRequest, UpdateProjectRequest, ApiResponse, ProjectWithTasks, CreateTaskRequest, UpdateTaskRequest, ToggleTaskCompletionRequest, Task } from "../../../shared/types.ts";

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Validation schemas
const createProjectSchema = z.object({
    name: z.string().min(1).max(255),
    description: z.string().optional(),
});

const updateProjectSchema = z.object({
    name: z.string().min(1).max(255).optional(),
    description: z.string().optional(),
});

// GET /projects - List user's projects with tasks
router.get("/projects", async (req: Request, res: Response<ApiResponse<ProjectWithTasks[]>>) => {
    try {
        const userId = req.user!.userId;
        const projectsWithTasks = await ProjectService.getUserProjects(userId);
        res.json({ data: projectsWithTasks });
    } catch (error) {
        console.error("Error fetching projects:", error);
        res.status(500).json({
            error: { message: "Internal server error" },
        });
    }
});

// POST /projects - Create new project
router.post("/projects", async (req: Request, res: Response<ApiResponse<ProjectWithTasks>>) => {
    try {
        const userId = req.user!.userId;
        const { name, description }: CreateProjectRequest = createProjectSchema.parse(req.body);

        const projectWithTasks = await ProjectService.createProject(userId, { name, description });
        res.status(201).json({ data: projectWithTasks });
    } catch (error) {
        console.error("Error creating project:", error);
        if (error instanceof z.ZodError) {
            res.status(400).json({
                error: { message: "Invalid input data", code: "VALIDATION_ERROR" },
            });
            return;
        }
        res.status(500).json({
            error: { message: "Internal server error" },
        });
    }
});

// PUT /projects/:id - Update project
router.put("/projects/:id", async (req: Request, res: Response<ApiResponse<ProjectWithTasks>>) => {
    try {
        const userId = req.user!.userId;
        const projectId = parseInt(req.params.id);
        const updateData: UpdateProjectRequest = updateProjectSchema.parse(req.body);

        if (isNaN(projectId)) {
            res.status(400).json({
                error: { message: "Invalid project ID" },
            });
            return;
        }

        const projectWithTasks = await ProjectService.updateProject(userId, projectId, updateData);
        res.json({ data: projectWithTasks });
    } catch (error) {
        console.error("Error updating project:", error);
        if (error instanceof z.ZodError) {
            res.status(400).json({
                error: { message: "Invalid input data", code: "VALIDATION_ERROR" },
            });
            return;
        }
        if (error instanceof Error && error.message === "Project not found") {
            res.status(404).json({
                error: { message: "Project not found" },
            });
            return;
        }
        res.status(500).json({
            error: { message: "Internal server error" },
        });
    }
});

// DELETE /projects/:id - Delete project
router.delete("/projects/:id", async (req: Request, res: Response<ApiResponse<null>>) => {
    try {
        const userId = req.user!.userId;
        const projectId = parseInt(req.params.id);

        if (isNaN(projectId)) {
            res.status(400).json({
                error: { message: "Invalid project ID" },
            });
            return;
        }

        await ProjectService.deleteProject(userId, projectId);
        res.json({ data: null });
    } catch (error) {
        console.error("Error deleting project:", error);
        if (error instanceof Error && error.message === "Project not found") {
            res.status(404).json({
                error: { message: "Project not found" },
            });
            return;
        }
        res.status(500).json({
            error: { message: "Internal server error" },
        });
    }
});

// Task routes nested under projects
// Validation schemas for tasks
const createTaskSchema = z.object({
    title: z.string().min(1).max(255),
    description: z.string().min(1).optional(),
    finishDate: z.string().date().optional(),
});

const updateTaskSchema = z.object({
    title: z.string().min(1).max(255).optional(),
    description: z.string().min(1).optional(),
    finishDate: z.string().date().optional(),
});

const toggleCompletionSchema = z.object({
    isCompleted: z.boolean(),
});

// GET /projects/:projectId/tasks - List tasks for a specific project
router.get("/projects/:projectId/tasks", async (req: Request, res: Response<ApiResponse<Task[]>>) => {
    try {
        const userId = req.user!.userId;
        const projectId = parseInt(req.params.projectId);

        if (isNaN(projectId)) {
            res.status(400).json({
                error: { message: "Invalid project ID" },
            });
            return;
        }

        // Verify project ownership
        const hasOwnership = await ProjectService.verifyProjectOwnership(projectId, userId);
        if (!hasOwnership) {
            res.status(404).json({
                error: { message: "Project not found" },
            });
            return;
        }

        const projectTasks = await ProjectService.getProjectTasks(projectId);
        res.json({ data: projectTasks });
    } catch (error) {
        console.error("Error fetching tasks:", error);
        res.status(500).json({
            error: { message: "Internal server error" },
        });
    }
});

// POST /projects/:projectId/tasks - Create new task
router.post("/projects/:projectId/tasks", async (req: Request, res: Response<ApiResponse<Task>>) => {
    try {
        const userId = req.user!.userId;
        const projectId = parseInt(req.params.projectId);
        const { title, description, finishDate }: CreateTaskRequest = createTaskSchema.parse(req.body);

        if (isNaN(projectId)) {
            res.status(400).json({
                error: { message: "Invalid project ID" },
            });
            return;
        }

        // Verify project ownership
        const hasOwnership = await ProjectService.verifyProjectOwnership(projectId, userId);
        if (!hasOwnership) {
            res.status(404).json({
                error: { message: "Project not found" },
            });
            return;
        }

        const newTask = await ProjectService.createTask(projectId, { title, description, finishDate });
        res.status(201).json({ data: newTask });
    } catch (error) {
        console.error("Error creating task:", error);
        if (error instanceof z.ZodError) {
            res.status(400).json({
                error: { message: "Invalid input data", code: "VALIDATION_ERROR" },
            });
            return;
        }
        res.status(500).json({
            error: { message: "Internal server error" },
        });
    }
});

// PUT /projects/:projectId/tasks/:taskId - Update task
router.put("/projects/:projectId/tasks/:taskId", async (req: Request, res: Response<ApiResponse<Task>>) => {
    try {
        const userId = req.user!.userId;
        const projectId = parseInt(req.params.projectId);
        const taskId = parseInt(req.params.taskId);
        const updateData: UpdateTaskRequest = updateTaskSchema.parse(req.body);

        if (isNaN(projectId) || isNaN(taskId)) {
            res.status(400).json({
                error: { message: "Invalid project or task ID" },
            });
            return;
        }

        // Verify task ownership
        const taskOwnership = await ProjectService.verifyTaskOwnership(taskId, userId);
        if (!taskOwnership) {
            res.status(404).json({
                error: { message: "Task not found" },
            });
            return;
        }

        // Check if task is finished (past finish date)
        if (isTaskFinished(taskOwnership.task.finishDate)) {
            res.status(400).json({
                error: { message: "Cannot edit finished tasks" },
            });
            return;
        }

        const updatedTask = await ProjectService.updateTask(taskId, updateData);
        res.json({ data: updatedTask });
    } catch (error) {
        console.error("Error updating task:", error);
        if (error instanceof z.ZodError) {
            res.status(400).json({
                error: { message: "Invalid input data", code: "VALIDATION_ERROR" },
            });
            return;
        }
        res.status(500).json({
            error: { message: "Internal server error" },
        });
    }
});

// PATCH /projects/:projectId/tasks/:taskId/toggle - Toggle task completion status
router.patch("/projects/:projectId/tasks/:taskId/toggle", async (req: Request, res: Response<ApiResponse<Task>>) => {
    try {
        const userId = req.user!.userId;
        const projectId = parseInt(req.params.projectId);
        const taskId = parseInt(req.params.taskId);
        const { isCompleted }: ToggleTaskCompletionRequest = toggleCompletionSchema.parse(req.body);

        if (isNaN(projectId) || isNaN(taskId)) {
            res.status(400).json({
                error: { message: "Invalid project or task ID" },
            });
            return;
        }

        // Verify task ownership
        const taskOwnership = await ProjectService.verifyTaskOwnership(taskId, userId);
        if (!taskOwnership) {
            res.status(404).json({
                error: { message: "Task not found" },
            });
            return;
        }

        // Check if task is finished (past finish date)
        if (isTaskFinished(taskOwnership.task.finishDate)) {
            res.status(400).json({
                error: { message: "Cannot toggle finished tasks" },
            });
            return;
        }

        const updatedTask = await ProjectService.toggleTaskCompletion(taskId, isCompleted);
        res.json({ data: updatedTask });
    } catch (error) {
        console.error("Error toggling task completion:", error);
        if (error instanceof z.ZodError) {
            res.status(400).json({
                error: { message: "Invalid input data", code: "VALIDATION_ERROR" },
            });
            return;
        }
        res.status(500).json({
            error: { message: "Internal server error" },
        });
    }
});

// DELETE /projects/:projectId/tasks/:taskId - Delete task
router.delete("/projects/:projectId/tasks/:taskId", async (req: Request, res: Response<ApiResponse<null>>) => {
    try {
        const userId = req.user!.userId;
        const projectId = parseInt(req.params.projectId);
        const taskId = parseInt(req.params.taskId);

        if (isNaN(projectId) || isNaN(taskId)) {
            res.status(400).json({
                error: { message: "Invalid project or task ID" },
            });
            return;
        }

        // Verify task ownership
        const taskOwnership = await ProjectService.verifyTaskOwnership(taskId, userId);
        if (!taskOwnership) {
            res.status(404).json({
                error: { message: "Task not found" },
            });
            return;
        }

        // Check if task is finished (past finish date)
        if (isTaskFinished(taskOwnership.task.finishDate)) {
            res.status(400).json({
                error: { message: "Cannot delete finished tasks" },
            });
            return;
        }

        await ProjectService.deleteTask(taskId);
        res.json({ data: null });
    } catch (error) {
        console.error("Error deleting task:", error);
        res.status(500).json({
            error: { message: "Internal server error" },
        });
    }
});

export default router;
