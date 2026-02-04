import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export interface AuthRequest extends Request {
    userId?: string;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ error: "Missing or invalid authorization header" });
        return;
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        res.status(401).json({ error: "Missing token" });
        return;
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
        req.userId = decoded.userId as string;
        next();
    } catch (error) {
        res.status(401).json({ error: "Invalid or expired token" });
    }
}

