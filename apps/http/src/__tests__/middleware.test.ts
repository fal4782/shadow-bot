import request from 'supertest';
import express from 'express';
import { authMiddleware } from '../middleware/auth';
import jwt from 'jsonwebtoken';

const app = express();
app.use(express.json());

// Test route
app.get('/protected', authMiddleware, (req: any, res) => {
    res.json({ userId: req.userId });
});

describe('Auth Middleware', () => {
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

    it('should allow valid token', async () => {
        const token = jwt.sign(
            { userId: 'user-123', email: 'test@example.com' },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        const response = await request(app)
            .get('/protected')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.userId).toBe('user-123');
    });

    it('should reject missing authorization header', async () => {
        const response = await request(app).get('/protected');

        expect(response.status).toBe(401);
        expect(response.body.error).toBe('Missing or invalid authorization header');
    });

    it('should reject invalid authorization format', async () => {
        const response = await request(app)
            .get('/protected')
            .set('Authorization', 'InvalidFormat token');

        expect(response.status).toBe(401);
        expect(response.body.error).toBe('Missing or invalid authorization header');
    });

    it('should reject missing token', async () => {
        const response = await request(app)
            .get('/protected')
            .set('Authorization', 'Bearer ');

        expect(response.status).toBe(401);
        expect(response.body.error).toBe('Missing or invalid authorization header');
    });

    it('should reject invalid token', async () => {
        const response = await request(app)
            .get('/protected')
            .set('Authorization', 'Bearer invalid-token');

        expect(response.status).toBe(401);
        expect(response.body.error).toBe('Invalid or expired token');
    });

    it('should reject expired token', async () => {
        const token = jwt.sign(
            { userId: 'user-123', email: 'test@example.com' },
            JWT_SECRET,
            { expiresIn: '-1h' } // Expired 1 hour ago
        );

        const response = await request(app)
            .get('/protected')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(401);
        expect(response.body.error).toBe('Invalid or expired token');
    });

    it('should reject token with wrong secret', async () => {
        const token = jwt.sign(
            { userId: 'user-123', email: 'test@example.com' },
            'wrong-secret',
            { expiresIn: '1h' }
        );

        const response = await request(app)
            .get('/protected')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(401);
        expect(response.body.error).toBe('Invalid or expired token');
    });
});
