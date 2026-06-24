import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";

export type AdminRole = "Super Admin" | "Operations Manager";
export type UserRole = AdminRole | "Teacher" | "Parent" | "School";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  refId?: string | null;
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

const getJwtRefreshSecret = () => {
  return process.env.JWT_REFRESH_SECRET || "RTA_SUPER_SECRET_REFRESH_KEY_2026";
};

export const signAdminToken = (user: AuthUser) => {
  return signAccessToken(user);
};

export const signAccessToken = (user: AuthUser) => {
  const expiresIn = (process.env.JWT_EXPIRES_IN || "8h") as SignOptions["expiresIn"];
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role, refId: user.refId },
    getJwtSecret(),
    { expiresIn }
  );
};

export const signRefreshToken = (user: AuthUser) => {
  const expiresIn = "7d";
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role, refId: user.refId },
    getJwtRefreshSecret(),
    { expiresIn }
  );
};

export const verifyRefreshToken = (token: string): AuthUser => {
  return jwt.verify(token, getJwtRefreshSecret()) as AuthUser;
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

export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Access denied: insufficient permissions" });
    }
    next();
  };
};
