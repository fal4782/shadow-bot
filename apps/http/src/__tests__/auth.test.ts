import request from 'supertest';
import express from 'express';
import { authRouter } from '../routes/v1/auth';
import { prisma } from '@repo/db/client';
import bcrypt from 'bcryptjs';

// Mock Prisma
jest.mock('@repo/db/client', () => ({
    prisma: {
        user: {
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
        },
    },
}));

const app = express();
app.use(express.json());
app.use('/auth', authRouter);

describe('Auth Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /auth/signup', () => {
        it('should create a new user with valid data', async () => {
            const mockUser = {
                id: 'user-123',
                email: 'test@example.com',
                name: 'Test User',
                password: 'hashed_password',
            };

            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
            (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);

            const response = await request(app)
                .post('/auth/signup')
                .send({
                    email: 'test@example.com',
                    password: 'password123',
                    name: 'Test User',
                });

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('token');
            expect(response.body.user).toMatchObject({
                id: 'user-123',
                email: 'test@example.com',
                name: 'Test User',
            });
        });

        it('should reject signup with existing email', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue({
                id: 'existing-user',
                email: 'test@example.com',
            });

            const response = await request(app)
                .post('/auth/signup')
                .send({
                    email: 'test@example.com',
                    password: 'password123',
                    name: 'Test User',
                });

            expect(response.status).toBe(409);
            expect(response.body.error).toBe('User already exists');
        });

        it('should reject invalid email format', async () => {
            const response = await request(app)
                .post('/auth/signup')
                .send({
                    email: 'invalid-email',
                    password: 'password123',
                    name: 'Test User',
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Invalid input');
        });

        it('should reject short password', async () => {
            const response = await request(app)
                .post('/auth/signup')
                .send({
                    email: 'test@example.com',
                    password: '123',
                    name: 'Test User',
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Invalid input');
        });

        it('should reject missing name', async () => {
            const response = await request(app)
                .post('/auth/signup')
                .send({
                    email: 'test@example.com',
                    password: 'password123',
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Invalid input');
        });
    });

    describe('POST /auth/login', () => {
        it('should login with valid credentials', async () => {
            const hashedPassword = await bcrypt.hash('password123', 10);
            const mockUser = {
                id: 'user-123',
                email: 'test@example.com',
                name: 'Test User',
                password: hashedPassword,
                provider: null,
            };

            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

            const response = await request(app)
                .post('/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'password123',
                });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('token');
            expect(response.body.user.email).toBe('test@example.com');
        });

        it('should reject invalid credentials', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

            const response = await request(app)
                .post('/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'password123',
                });

            expect(response.status).toBe(401);
            expect(response.body.error).toBe('Invalid credentials');
        });

        it('should reject wrong password', async () => {
            const hashedPassword = await bcrypt.hash('correctpassword', 10);
            const mockUser = {
                id: 'user-123',
                email: 'test@example.com',
                password: hashedPassword,
                provider: null,
            };

            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

            const response = await request(app)
                .post('/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'wrongpassword',
                });

            expect(response.status).toBe(401);
            expect(response.body.error).toBe('Invalid credentials');
        });

        it('should reject OAuth users trying to login with password', async () => {
            const mockUser = {
                id: 'user-123',
                email: 'test@example.com',
                password: '',
                provider: 'google',
            };

            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

            const response = await request(app)
                .post('/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'password123',
                });

            expect(response.status).toBe(401);
            expect(response.body.error).toContain('Please sign in with google');
        });
    });

    describe('POST /auth/google-auth', () => {
        it('should create new user for Google OAuth', async () => {
            const mockUser = {
                id: 'user-123',
                email: 'test@example.com',
                name: 'Test User',
                provider: 'google',
                providerAccountId: 'google-123',
            };

            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
            (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);

            const response = await request(app)
                .post('/auth/google-auth')
                .send({
                    email: 'test@example.com',
                    name: 'Test User',
                    providerId: 'google-123',
                });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('token');
            expect(response.body.user.email).toBe('test@example.com');
        });

        it('should link Google account to existing user', async () => {
            const existingUser = {
                id: 'user-123',
                email: 'test@example.com',
                name: 'Test User',
                provider: null,
            };

            const updatedUser = {
                ...existingUser,
                provider: 'google',
                providerAccountId: 'google-123',
            };

            (prisma.user.findUnique as jest.Mock).mockResolvedValue(existingUser);
            (prisma.user.update as jest.Mock).mockResolvedValue(updatedUser);

            const response = await request(app)
                .post('/auth/google-auth')
                .send({
                    email: 'test@example.com',
                    name: 'Test User',
                    providerId: 'google-123',
                });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('token');
        });

        it('should reject missing providerId', async () => {
            const response = await request(app)
                .post('/auth/google-auth')
                .send({
                    email: 'test@example.com',
                    name: 'Test User',
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Invalid input');
        });
    });
});
