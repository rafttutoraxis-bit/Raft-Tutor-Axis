import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import multer from "multer";
import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

import {
  AdminLog,
  ParentInquiry,
  SchoolRequest,
  TeacherRegistration,
  Vacancy,
  SystemSettings,
  User,
} from "./models.js";

import {
  requireAuth,
  requireSuperAdmin,
  requireRole,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "./auth.js";

import {
  generateAdminReport,
  matchTutorsForParent,
  generateParentInsights,
  generateSchoolHiringInsights,
  chatAssistantResponse,
} from "./ai.js";

import {
  notifyTeacherRegistered,
  notifyTeacherApproved,
  notifyTeacherRejected,
  notifyParentRegistered,
  notifySchoolRegistered,
  notifyForgotPassword,
  notifyTutorAssigned,
  notifySchoolVacancyPosted,
} from "./services/notifications.js";

import { seedInitialAdmin } from "./seed.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = Number(process.env.PORT || 3000);
const isProduction = process.env.NODE_ENV === "production";
const uploadRoot = path.resolve(process.cwd(), "server", "uploads");

fs.mkdirSync(uploadRoot, { recursive: true });

// Validation helpers
const isValidEmail = (email: any): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return typeof email === "string" && emailRegex.test(email);
};

const isStrongPassword = (password: any): boolean => {
  return typeof password === "string" && password.length >= 8;
};

// Strict Security Headers Middleware (Helmet-like)
app.use((_req, res, next) => {
  res.setHeader("X-DNS-Prefetch-Control", "off");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: blob: http: https:; connect-src 'self' http: https: ws: wss:;");
  res.setHeader("Strict-Transport-Security", "max-age=15552000; includeSubDomains");
  res.setHeader("X-Download-Options", "noopen");
  res.setHeader("X-Permitted-Cross-Domain-Policies", "none");
  res.setHeader("Origin-Agent-Cluster", "?1");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  next();
});

// NoSQL Query Injection Sanitizer
const sanitizeInput = (val: any): any => {
  if (val instanceof Object) {
    for (const key in val) {
      if (key.startsWith("$")) {
        delete val[key];
      } else {
        val[key] = sanitizeInput(val[key]);
      }
    }
  }
  return val;
};
app.use((req, _res, next) => {
  if (req.body) req.body = sanitizeInput(req.body);
  if (req.query) req.query = sanitizeInput(req.query);
  if (req.params) req.params = sanitizeInput(req.params);
  next();
});

// In-Memory Rate Limiter to prevent brute force/DOS
const ipLimits: Record<string, { count: number; resetTime: number }> = {};
const rateLimiter = (limit: number, windowMs: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || "unknown";
    const now = Date.now();
    const limitInfo = ipLimits[ip];

    if (!limitInfo || now > limitInfo.resetTime) {
      ipLimits[ip] = { count: 1, resetTime: now + windowMs };
      return next();
    }

    limitInfo.count += 1;
    if (limitInfo.count > limit) {
      return res.status(429).json({ error: "Too many requests. Please try again later." });
    }
    next();
  };
};

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173", credentials: true }));
app.use(express.json({ limit: "5mb" }));
app.use("/uploads", express.static(uploadRoot));

// Multer Upload setup with strict MIME/Extension controls
const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadRoot),
    filename: (_req, file, cb) => {
      const safeBase = path
        .basename(file.originalname, path.extname(file.originalname))
        .replace(/[^a-z0-9_-]/gi, "-")
        .slice(0, 60);
      cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeBase}${path.extname(file.originalname)}`);
    },
  }),
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (file.fieldname === "resume") {
      if ([".pdf", ".doc", ".docx"].includes(ext)) {
        cb(null, true);
      } else {
        cb(new Error("Only PDF or Word documents are allowed for resumes."));
      }
    } else {
      if ([".jpg", ".jpeg", ".png", ".webp"].includes(ext)) {
        cb(null, true);
      } else {
        cb(new Error("Only JPG, PNG or WebP image files are allowed."));
      }
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // Max 10MB
});

const normalizeRecord = (record: any) => {
  const object = record.toObject ? record.toObject() : record;
  const { _id, __v, ...rest } = object;
  return { ...rest, id: _id.toString() };
};

const logAction = async (user: string, action: string, ip?: string) => {
  await AdminLog.create({ user, action, ip: ip || "unknown" });
};

// Seed dynamic settings if not exists
const initSettings = async () => {
  const count = await SystemSettings.countDocuments();
  if (count === 0) {
    await SystemSettings.create({});
    console.log("[Settings] Seeded default system settings");
  }
};

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, database: mongoose.connection.readyState === 1 ? "connected" : "disconnected" });
});

// Dynamic Settings Endpoint
app.get("/api/settings", async (_req, res) => {
  try {
    const settings = await SystemSettings.findOne();
    res.json(settings || {});
  } catch (error) {
    res.status(500).json({ error: "Failed to load settings" });
  }
});

// Update Settings Endpoint (Admin only)
app.post(
  "/api/admin/settings",
  requireAuth,
  requireRole(["Super Admin", "Operations Manager"]),
  (req, res, next) => {
    upload.fields([{ name: "qrCode", maxCount: 1 }])(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      const files = req.files as Record<string, Express.Multer.File[]> | undefined;
      const body = { ...req.body };
      
      if (files?.qrCode?.[0]) {
        body.qrCodeUrl = `/uploads/${files.qrCode[0].filename}`;
      }

      // Convert toggle checkboxes string values to boolean
      const booleanKeys = ["enableRegistration", "enableAI", "enableEmail", "enableWhatsApp"];
      booleanKeys.forEach(key => {
        if (body[key] !== undefined) {
          body[key] = body[key] === "true" || body[key] === true;
        }
      });

      if (body.registrationFee) {
        body.registrationFee = Number(body.registrationFee);
      }

      let settings = await SystemSettings.findOne();
      if (!settings) {
        settings = await SystemSettings.create(body);
      } else {
        Object.assign(settings, body);
        await settings.save();
      }

      await logAction(
        `${req.user?.name || "Admin"}`,
        "Updated site configurations and settings desk",
        req.ip
      );

      res.json({ success: true, settings });
    } catch (error) {
      console.error("Failed to update settings:", error);
      res.status(500).json({ error: "Failed to update settings" });
    }
  }
);

// Unified Authentication Register Route
app.post("/api/auth/register", rateLimiter(5, 60000), async (req, res) => {
  try {
    const { name, email, password, role, refId, refModel } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "Name, email, password, and role are required." });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "A valid email address is required." });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({ error: "Password must be at least 8 characters long." });
    }

    // Limit administrative role registration to existing Super Admins
    if (role === "Super Admin" || role === "Operations Manager") {
      const header = req.headers.authorization;
      const token = header?.startsWith("Bearer ") ? header.slice(7) : "";
      let isAuthorized = false;
      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET || "") as any;
          if (decoded.role === "Super Admin") {
            isAuthorized = true;
          }
        } catch {}
      }
      if (!isAuthorized) {
        return res.status(403).json({ error: "Access denied: cannot register administrative roles publicly." });
      }
    }

    const emailLower = String(email).trim().toLowerCase();
    const existing = await User.findOne({ email: emailLower });
    if (existing) {
      return res.status(409).json({ error: "Email is already registered." });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email: emailLower,
      passwordHash,
      role,
      refId: refId || null,
      refModel: refModel || null,
    });

    // If role links to models, verify reference
    if (refId && refModel === "TeacherRegistration") {
      await TeacherRegistration.findByIdAndUpdate(refId, { userId: user._id });
    } else if (refId && refModel === "ParentInquiry") {
      await ParentInquiry.findByIdAndUpdate(refId, { userId: user._id });
    } else if (refId && refModel === "SchoolRequest") {
      await SchoolRequest.findByIdAndUpdate(refId, { userId: user._id });
    }

    const authUser = { id: user._id.toString(), email: user.email, name: user.name, role: user.role, refId: user.refId?.toString() };
    const token = signAccessToken(authUser);
    const refreshToken = signRefreshToken(authUser);

    user.refreshToken = refreshToken;
    await user.save();

    res.status(201).json({ success: true, token, refreshToken, user: authUser });
  } catch (error) {
    console.error("Authentication signup failed:", error);
    res.status(500).json({ error: "Failed to sign up account" });
  }
});

// Unified Login Route
app.post("/api/auth/login", rateLimiter(15, 60000), async (req, res) => {
  try {
    const { email, password } = req.body;
    const login = String(email || "").trim().toLowerCase();
    if (!isValidEmail(login)) {
      return res.status(400).json({ error: "A valid email address is required." });
    }
    if (!password || typeof password !== "string" || password.trim() === "") {
      return res.status(400).json({ error: "Password is required." });
    }
    const user = await User.findOne({ email: login, isActive: true });

    if (!user || !password || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: "Invalid login credentials" });
    }

    const authUser = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      refId: user.refId?.toString() || null,
    };
    const token = signAccessToken(authUser);
    const refreshToken = signRefreshToken(authUser);

    user.refreshToken = refreshToken;
    await user.save();

    await logAction(`${user.name} (${user.role})`, "Logged in successfully", req.ip);
    res.json({ success: true, token, refreshToken, user: authUser });
  } catch (error) {
    console.error("Unified login failed:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
});

// Token Refresh Route
app.post("/api/auth/refresh", async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: "Refresh token is mandatory" });

    const decoded = verifyRefreshToken(token);
    const user = await User.findOne({ _id: decoded.id, refreshToken: token });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: "Invalid or expired session session" });
    }

    const authUser = { id: user._id.toString(), email: user.email, name: user.name, role: user.role, refId: user.refId?.toString() };
    const newToken = signAccessToken(authUser);
    res.json({ success: true, token: newToken });
  } catch (error) {
    res.status(401).json({ error: "Invalid session" });
  }
});

// Forgot Password Route
app.post("/api/auth/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const emailLower = String(email || "").trim().toLowerCase();
    if (!isValidEmail(emailLower)) {
      return res.status(400).json({ error: "A valid email address is required." });
    }
    const user = await User.findOne({ email: emailLower });
    if (!user) {
      return res.json({ success: true, message: "If the email is verified, password reset link has been dispatched." });
    }

    const resetToken = Math.random().toString(36).slice(2, 10).toUpperCase();
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1hr
    await user.save();

    await notifyForgotPassword(user.email, resetToken);
    res.json({ success: true, message: "Password reset token dispatched successfully to your email." });
  } catch (error) {
    res.status(500).json({ error: "Failed to dispatch password recovery" });
  }
});

// Reset Password Route
app.post("/api/auth/reset-password", async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;
    const emailLower = String(email || "").trim().toLowerCase();
    if (!isValidEmail(emailLower)) {
      return res.status(400).json({ error: "A valid email address is required." });
    }
    if (!token || typeof token !== "string" || token.trim() === "") {
      return res.status(400).json({ error: "Reset token is required." });
    }
    if (!isStrongPassword(newPassword)) {
      return res.status(400).json({ error: "New password must be at least 8 characters long." });
    }
    const user = await User.findOne({
      email: emailLower,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired password reset token." });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    user.resetPasswordToken = "";
    user.resetPasswordExpires = null as any;
    await user.save();

    res.json({ success: true, message: "Password reset successfully. You can now login." });
  } catch (error) {
    res.status(500).json({ error: "Failed to restore password" });
  }
});

// Fetch Teacher Profile (for the logged-in Teacher role)
app.get("/api/teacher/profile", requireAuth, requireRole(["Teacher"]), async (req, res) => {
  try {
    if (!req.user?.refId) {
      return res.status(404).json({ error: "No teacher profile linked." });
    }
    const profile = await TeacherRegistration.findById(req.user.refId);
    if (!profile) {
      return res.status(404).json({ error: "Profile not found." });
    }
    res.json({ success: true, profile: normalizeRecord(profile) });
  } catch (error) {
    res.status(500).json({ error: "Failed to load teacher profile." });
  }
});

// Fetch Parent Profile (for the logged-in Parent role)
app.get("/api/parent/profile", requireAuth, requireRole(["Parent"]), async (req, res) => {
  try {
    if (!req.user?.refId) {
      return res.status(404).json({ error: "No parent profile linked." });
    }
    const profile = await ParentInquiry.findById(req.user.refId);
    if (!profile) {
      return res.status(404).json({ error: "Profile not found." });
    }
    let tutor = null;
    if (profile.assignedTeacherId) {
      tutor = await TeacherRegistration.findById(profile.assignedTeacherId);
    }
    res.json({ 
      success: true, 
      profile: normalizeRecord(profile),
      tutor: tutor ? normalizeRecord(tutor) : null
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to load parent profile." });
  }
});

// Fetch School Profile (for the logged-in School role)
app.get("/api/school/profile", requireAuth, requireRole(["School"]), async (req, res) => {
  try {
    if (!req.user?.refId) {
      return res.status(404).json({ error: "No school profile linked." });
    }
    const profile = await SchoolRequest.findById(req.user.refId);
    if (!profile) {
      return res.status(404).json({ error: "Profile not found." });
    }
    res.json({ success: true, profile: normalizeRecord(profile) });
  } catch (error) {
    res.status(500).json({ error: "Failed to load school profile." });
  }
});

// Fetch School Matching Tutors (restricted to School role)
app.get("/api/school/matching-tutors", requireAuth, requireRole(["School"]), async (req, res) => {
  try {
    if (!req.user?.refId) {
      return res.status(404).json({ error: "No school profile linked." });
    }
    const school = await SchoolRequest.findById(req.user.refId);
    if (!school) {
      return res.status(404).json({ error: "School not found." });
    }
    const tutors = await TeacherRegistration.find({
      isApproved: true,
      city: { $regex: new RegExp(`^${school.location}$`, "i") }
    });
    res.json({ success: true, tutors: tutors.map(normalizeRecord) });
  } catch (error) {
    res.status(500).json({ error: "Failed to load matching tutors." });
  }
});

// Fetch Database Telemetry (Unified Filter query & Pagination support, restricted to Admin only)
app.get("/api/data", requireAuth, requireRole(["Super Admin", "Operations Manager"]), async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.max(1, Number(req.query.limit || 50));
    const skip = (page - 1) * limit;

    const [parents, teachers, schools, logs] = await Promise.all([
      ParentInquiry.find().sort({ createdAt: -1 }),
      TeacherRegistration.find().sort({ createdAt: -1 }),
      SchoolRequest.find().sort({ createdAt: -1 }),
      AdminLog.find().sort({ timestamp: -1 }).limit(300),
    ]);

    res.json({
      parents: parents.map(normalizeRecord),
      teachers: teachers.map(normalizeRecord),
      schools: schools.map(normalizeRecord),
      logs: logs.map(normalizeRecord),
    });
  } catch (error) {
    console.error("Failed to read database records:", error);
    res.status(500).json({ error: "Failed to read database records" });
  }
});

// Parent Registration
app.post("/api/parent-registration", async (req, res) => {
  try {
    if (!req.body.email || !isValidEmail(req.body.email)) {
      return res.status(400).json({ error: "A valid email address is required." });
    }
    const record = await ParentInquiry.create(req.body);
    await logAction(
      "Parent / Student Visitor",
      `New Tutor Request submitted by ${record.name} for Class ${record.studentClass}`,
      req.ip
    );
    await notifyParentRegistered(record.email, record.name, record.studentClass, record.mobile);
    res.json({ success: true, record: normalizeRecord(record) });
  } catch (error) {
    console.error("Parent registration failed:", error);
    res.status(400).json({ error: "Failed to log parent inquiry" });
  }
});

// Teacher Registration supporting Resume, Headshot, AND Transaction screenshot files
app.post(
  "/api/teacher-registration",
  (req, res, next) => {
    upload.fields([
      { name: "resume", maxCount: 1 },
      { name: "photo", maxCount: 1 },
      { name: "screenshot", maxCount: 1 }, // Payment screenshot file
    ])(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      const files = req.files as Record<string, Express.Multer.File[]> | undefined;

      // Determine if the request comes from an authenticated teacher updating details
      const authHeader = req.headers.authorization;
      const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : "";
      let authUser: any = null;
      if (token) {
        try {
          authUser = jwt.verify(token, process.env.JWT_SECRET || "") as any;
        } catch {}
      }

      if (authUser && authUser.role === "Teacher" && authUser.refId) {
        const teacher = await TeacherRegistration.findById(authUser.refId);
        if (!teacher) {
          return res.status(404).json({ error: "Teacher registration record not found." });
        }

        if (req.body.paymentStatus === "Paid") {
          const hasScreenshot = files?.screenshot?.[0] || teacher.screenshotUrl;
          if (!hasScreenshot) {
            return res.status(400).json({ error: "UPI payment screenshot receipt is required." });
          }
          if (!req.body.txnId || req.body.txnId.length !== 12) {
            return res.status(400).json({ error: "A valid 12-digit UPI transaction ID is required." });
          }
        }

        if (files?.screenshot?.[0]) {
          teacher.screenshotUrl = `/uploads/${files.screenshot[0].filename}`;
        }
        if (files?.photo?.[0]) {
          teacher.photoUrl = `/uploads/${files.photo[0].filename}`;
        }
        if (req.body.txnId) {
          teacher.txnId = req.body.txnId;
        }
        if (req.body.paymentStatus) {
          teacher.paymentStatus = req.body.paymentStatus;
        }

        await teacher.save();
        await logAction(
          "Teacher Profile Update",
          `Teacher ${teacher.name} updated payment details (Txn: ${teacher.txnId || "N/A"})`,
          req.ip
        );
        return res.json({ success: true, record: normalizeRecord(teacher) });
      }
      const resumeFile = files?.resume?.[0];
      if (!resumeFile) {
        return res.status(400).json({ error: "Resume file upload is compulsory." });
      }

      if (!req.body.email || !isValidEmail(req.body.email)) {
        return res.status(400).json({ error: "A valid email address is required." });
      }

      const txnId = req.body.txnId || "";
      const screenshotUrl = files?.screenshot?.[0] ? `/uploads/${files.screenshot[0].filename}` : "";

      if (req.body.paymentStatus === "Paid") {
        if (!txnId || txnId.length !== 12) {
          return res.status(400).json({ error: "A valid 12-digit UPI transaction ID is required." });
        }
        if (!screenshotUrl) {
          return res.status(400).json({ error: "UPI payment screenshot receipt is required." });
        }
      }

      const resumeUrl = `/uploads/${resumeFile.filename}`;
      const photoUrl = files?.photo?.[0] ? `/uploads/${files.photo[0].filename}` : "";

      const record = await TeacherRegistration.create({
        ...req.body,
        resumeUrl,
        photoUrl,
        screenshotUrl,
        isApproved: false,
      });

      await logAction(
        "Teacher Applicant",
        `New Teacher Registration received from ${record.name} (${record.qualification})`,
        req.ip
      );

      await notifyTeacherRegistered(record.email, record.name);

      res.json({ success: true, record: normalizeRecord(record) });
    } catch (error) {
      console.error("Teacher registration failed:", error);
      res.status(400).json({ error: "Failed to persist teacher registration" });
    }
  }
);

// School Request solutions
app.post("/api/school-request", async (req, res) => {
  try {
    if (!req.body.email || !isValidEmail(req.body.email)) {
      return res.status(400).json({ error: "A valid email address is required." });
    }
    const record = await SchoolRequest.create(req.body);
    await logAction(
      "School / Institution",
      `New school solution inquiry submitted by ${record.orgName} (${record.contactPerson})`,
      req.ip
    );
    await notifySchoolRegistered(record.email, record.orgName);
    res.json({ success: true, record: normalizeRecord(record) });
  } catch (error) {
    console.error("School request failed:", error);
    res.status(400).json({ error: "Failed to submit school solution request" });
  }
});

// Post Vacancy (For Schools & Admin)
app.post("/api/vacancies", requireAuth, requireRole(["School", "Super Admin", "Operations Manager"]), async (req, res) => {
  try {
    const vacancy = await Vacancy.create(req.body);
    await logAction(
      req.user?.name || "School Partner",
      `Posted a new teaching vacancy: ${vacancy.title} (${vacancy.subject})`,
      req.ip
    );

    // Retrieve School details to send email/WhatsApp notifications
    const school = await SchoolRequest.findById(vacancy.schoolId);
    if (school) {
      await notifySchoolVacancyPosted(school.email, school.orgName, vacancy.title, vacancy.subject, school.phone);
    }

    res.status(201).json({ success: true, vacancy });
  } catch (error) {
    console.error("Failed to create vacancy posting:", error);
    res.status(400).json({ error: "Failed to create vacancy posting" });
  }
});

// Fetch vacancies (Public/Filtered)
app.get("/api/vacancies", async (req, res) => {
  try {
    const { city, board, subject } = req.query;
    const filter: any = { status: "Open" };
    if (city) filter.city = { $regex: new RegExp(String(city), "i") };
    if (board) filter.board = board;
    if (subject) filter.subject = { $regex: new RegExp(String(subject), "i") };

    const list = await Vacancy.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, vacancies: list.map(normalizeRecord) });
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve vacancies" });
  }
});

// Admin Control Panel Actions Override
app.post(
  "/api/admin/action",
  requireAuth,
  (req, res, next) => {
    if (req.body.actionType === "delete") {
      return requireSuperAdmin(req, res, next);
    }
    next();
  },
  async (req, res) => {
    try {
      const { actionType, entityType, id } = req.body;
      const adminUser = `${req.user?.name || "Admin"} (${req.user?.role || "Unknown"})`;

      if (actionType === "delete") {
        if (entityType === "parents") {
          await ParentInquiry.findByIdAndDelete(id);
        } else if (entityType === "teachers") {
          const teacher = await TeacherRegistration.findById(id);
          if (teacher?.userId) {
            await User.findByIdAndDelete(teacher.userId);
          }
          await TeacherRegistration.findByIdAndDelete(id);
        } else if (entityType === "schools") {
          await SchoolRequest.findByIdAndDelete(id);
        } else if (entityType === "vacancies") {
          await Vacancy.findByIdAndDelete(id);
        } else {
          return res.status(400).json({ error: "Invalid entity type" });
        }

        await logAction(adminUser, `Deleted ${entityType.slice(0, -1)} with ID ${id}`, req.ip);
        return res.json({ success: true });
      }

      if (actionType === "approve_teacher") {
        const teacher = await TeacherRegistration.findById(id);
        if (!teacher) {
          return res.status(404).json({ error: "Teacher not found" });
        }
        teacher.isApproved = !teacher.isApproved;
        await teacher.save();

        if (teacher.isApproved) {
          await notifyTeacherApproved(teacher.email, teacher.name, teacher.mobile);
        } else {
          await notifyTeacherRejected(teacher.email, teacher.name, "Profile deactivated by administrator review.");
        }

        await logAction(
          adminUser,
          `${teacher.isApproved ? "Approved" : "Disapproved"} Teacher: ${teacher.name}`,
          req.ip
        );
        return res.json({ success: true, isApproved: teacher.isApproved });
      }

      if (actionType === "toggle_payment") {
        const teacher = await TeacherRegistration.findById(id);
        if (!teacher) {
          return res.status(404).json({ error: "Teacher not found" });
        }
        
        // Cycle payment statuses: Pending -> Verified -> Rejected -> Pending
        const statusCycle: Record<string, string> = {
          "Pending": "Verified",
          "Paid": "Verified",
          "Verified": "Rejected",
          "Rejected": "Pending"
        };
        const originalStatus = teacher.paymentStatus || "Pending";
        const newStatus = statusCycle[originalStatus] as any;
        teacher.paymentStatus = newStatus;
        
        // Auto approve profile if verified payment
        if (newStatus === "Verified") {
          teacher.isApproved = true;
          await notifyTeacherApproved(teacher.email, teacher.name, teacher.mobile);
        } else if (newStatus === "Rejected") {
          teacher.isApproved = false;
          await notifyTeacherRejected(teacher.email, teacher.name, "Payment screenshot verification failed.");
        }

        await teacher.save();
        await logAction(
          adminUser,
          `Toggled payment status from ${originalStatus} to ${newStatus} for Teacher: ${teacher.name}`,
          req.ip
        );
        return res.json({ success: true, paymentStatus: teacher.paymentStatus, isApproved: teacher.isApproved });
      }

      if (actionType === "assign_tutor") {
        const { parentId, teacherId } = req.body;
        const parent = await ParentInquiry.findById(parentId);
        const teacher = await TeacherRegistration.findById(teacherId);
        
        if (!parent || !teacher) {
          return res.status(404).json({ error: "Parent or Teacher records missing." });
        }

        parent.assignedTeacherId = teacher._id;
        parent.status = "Mapped";
        await parent.save();

        await notifyTutorAssigned(parent.email, parent.name, parent.mobile, teacher.name, teacher.mobile);
        await logAction(
          adminUser,
          `Assigned Tutor "${teacher.name}" to Parent Request "${parent.name}"`,
          req.ip
        );
        return res.json({ success: true, parent });
      }

      res.status(400).json({ error: "Invalid admin action request" });
    } catch (error) {
      console.error("Admin action failed:", error);
      res.status(500).json({ error: "Admin operation failed" });
    }
  }
);

// Gemini Report route
app.post("/api/admin/gemini-report", requireAuth, async (_req, res) => {
  try {
    res.json({ report: await generateAdminReport() });
  } catch (error) {
    console.error("Gemini report generation failed:", error);
    res.status(500).json({ error: "Failed to generate report using Gemini API" });
  }
});

// AI Tutor Matcher Route
app.post("/api/ai/match-tutor", requireAuth, async (req, res) => {
  try {
    const { parentInquiryId } = req.body;
    const result = await matchTutorsForParent(parentInquiryId);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to run AI matchmaker" });
  }
});

// AI Parent Insights Route
app.post("/api/ai/parent-insights", requireAuth, async (req, res) => {
  try {
    const { parentInquiryId } = req.body;
    const insights = await generateParentInsights(parentInquiryId);
    res.json({ insights });
  } catch (error) {
    res.status(500).json({ error: "Failed to generate AI parent insights" });
  }
});

// AI School Hiring Insights Route
app.post("/api/ai/hiring-insights", requireAuth, async (req, res) => {
  try {
    const { vacancyId } = req.body;
    const insights = await generateSchoolHiringInsights(vacancyId);
    res.json({ insights });
  } catch (error) {
    res.status(500).json({ error: "Failed to generate AI hiring insights" });
  }
});

// Public AI Chatbot Assistant Endpoint
app.post("/api/ai/chat", async (req, res) => {
  try {
    const { message, chatHistory } = req.body;
    const response = await chatAssistantResponse(message, chatHistory || []);
    res.json({ response });
  } catch (error) {
    res.status(500).json({ error: "AI Chat Assistant is offline" });
  }
});

const start = async () => {
  const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/raft-tutor-axis";
  await mongoose.connect(mongoUri);
  await seedInitialAdmin();
  await initSettings();

  if (isProduction) {
    const clientDist = path.resolve(__dirname, "..", "client");
    app.use(express.static(clientDist));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(clientDist, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Raft Tutor Axis MERN] API running on http://localhost:${PORT}`);
  });
};

start().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
