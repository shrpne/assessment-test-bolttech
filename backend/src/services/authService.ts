import { eq } from 'drizzle-orm';
import db from '../database/connection.ts';
import { users } from '../database/schema.ts';
import { hashPassword, verifyPassword } from '../utils/password.ts';
import { generateToken } from '../utils/jwt.ts';
import type { RegisterRequest, LoginRequest, AuthResponse } from '../../../shared/types.ts';

export class AuthService {
  static async registerUser(data: RegisterRequest): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.email, data.email)).limit(1);
    if (existingUser.length > 0) {
      throw new Error('User with this email already exists');
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(data.password);
    const [newUser] = await db.insert(users).values({
      email: data.email,
      password: hashedPassword,
      name: data.name,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning({
      id: users.id,
      email: users.email,
      name: users.name,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt
    });

    // Generate token
    const token = generateToken({ userId: newUser.id, email: newUser.email });

    return {
      user: newUser,
      token
    };
  }

  static async loginUser(data: LoginRequest): Promise<AuthResponse> {
    // Find user by email
    const [user] = await db.select().from(users).where(eq(users.email, data.email)).limit(1);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isValidPassword = await verifyPassword(data.password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // Generate token
    const token = generateToken({ userId: user.id, email: user.email });

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token
    };
  }

  static async getUserById(userId: number) {
    const [user] = await db.select({
      id: users.id,
      email: users.email,
      name: users.name,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt
    }).from(users).where(eq(users.id, userId)).limit(1);
    
    return user || null;
  }

  static async getUserByEmail(email: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return user || null;
  }
} 