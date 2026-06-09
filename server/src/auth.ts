import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";

export type AdminRole = "Super Admin" | "Operations Manager";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is required");
  }
  return secret;
};

export const signAdminToken = (user: AuthUser) => {
  const expiresIn = (process.env.JWT_EXPIRES_IN || "8h") as SignOptions["expiresIn"];
  return jwt.sign(user, getJwtSecret(), {
    expiresIn,
  });
};

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : "";

  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    req.user = jwt.verify(token, getJwtSecret()) as AuthUser;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired session" });
  }
};

export const requireSuperAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== "Super Admin") {
    return res.status(403).json({ error: "Super Admin permission required" });
  }
  next();
};
