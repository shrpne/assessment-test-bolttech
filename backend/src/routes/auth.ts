import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { AuthService } from '../services/authService.ts';
import type { RegisterRequest, LoginRequest, AuthResponse, ApiResponse } from '../../../shared/types.ts';

const router = Router();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

// Register endpoint
router.post('/auth/register', async (req: Request, res: Response<ApiResponse<AuthResponse>>) => {
  try {
    const { email, password, name }: RegisterRequest = registerSchema.parse(req.body);

    const authResponse = await AuthService.registerUser({ email, password, name });

    res.status(201).json({
      data: authResponse
    });
  } catch (error) {
    console.error('Registration error:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: { message: 'Invalid input data', code: 'VALIDATION_ERROR' }
      });
      return;
    }
    if (error instanceof Error && error.message === 'User with this email already exists') {
      res.status(400).json({
        error: { message: 'User with this email already exists' }
      });
      return;
    }
    res.status(500).json({
      error: { message: 'Internal server error' }
    });
  }
});

// Login endpoint
router.post('/auth/login', async (req: Request, res: Response<ApiResponse<AuthResponse>>) => {
  try {
    const { email, password }: LoginRequest = loginSchema.parse(req.body);

    const authResponse = await AuthService.loginUser({ email, password });

    res.json({
      data: authResponse
    });
  } catch (error) {
    console.error('Login error:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: { message: 'Invalid input data', code: 'VALIDATION_ERROR' }
      });
      return;
    }
    if (error instanceof Error && error.message === 'Invalid email or password') {
      res.status(401).json({
        error: { message: 'Invalid email or password' }
      });
      return;
    }
    res.status(500).json({
      error: { message: 'Internal server error' }
    });
  }
});

export default router;
