import request from 'supertest';
import express from 'express';
import cors from 'cors';
import { v1Router } from '../routes/v1';
import { authMiddleware } from '../middleware/auth';
import { authRouter } from '../routes/v1/auth';
import jwt from 'jsonwebtoken';

// Mock DB and Redis to prevent side effects
jest.mock('@repo/db/client', () => ({
    prisma: {
        user: { findUnique: jest.fn() },
        recording: { findMany: jest.fn() }
    }
}));
jest.mock('redis', () => ({
    createClient: jest.fn(() => ({
        connect: jest.fn(),
        rPush: jest.fn()
    }))
}));

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Recreate a version of the app for integration testing
const app = express();
app.use(express.json());
app.use(cors());

app.use("/health", (_req, res) => {
    res.status(200).send("OK");
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/status", (_req, res) => {
    res.json({ status: "API is running" });
});

app.use("/api/v1", authMiddleware, v1Router);

describe('Integration Tests', () => {
    it('GET /health should return 200 OK', async () => {
        const response = await request(app).get('/health');
        expect(response.status).toBe(200);
        expect(response.text).toBe('OK');
    });

    it('GET /api/v1/status should return 200 and JSON status', async () => {
        const response = await request(app).get('/api/v1/status');
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ status: "API is running" });
    });

    it('GET /api/v1/chat should be protected and return 401 without token', async () => {
        const response = await request(app).get('/api/v1/chat');
        expect(response.status).toBe(401);
    });

    it('GET /api/v1/auth/signup should be public', async () => {
        // We already have detailed tests for this in auth.test.ts
        // Just checking it doesn't hit the authMiddleware
        const response = await request(app)
            .post('/api/v1/auth/signup')
            .send({ email: 'bad-email' }); // Zod will catch this if it's public

        expect(response.status).toBe(400); // Bad request from Zod, not 401 from middleware
        expect(response.body.error).toBe('Invalid input');
    });

    it('GET /api/v1/chat with valid token should pass middleware', async () => {
        const token = jwt.sign({ userId: 'user-123', email: 'test@example.com' }, JWT_SECRET);

        const response = await request(app)
            .get('/api/v1/chat')
            .set('Authorization', `Bearer ${token}`);

        // It might still fail with 500 or 404 depending on mock, but it shouldn't be 401
        expect(response.status).not.toBe(401);
    });
});
