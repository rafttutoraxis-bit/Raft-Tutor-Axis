import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import multer from "multer";
import {
  AdminLog,
  AdminUser,
  ParentInquiry,
  SchoolRequest,
  TeacherRegistration,
} from "./models.js";
import { requireAuth, requireSuperAdmin, signAdminToken } from "./auth.js";
import { generateAdminReport } from "./ai.js";
import { seedInitialAdmin } from "./seed.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = Number(process.env.PORT || 3000);
const isProduction = process.env.NODE_ENV === "production";
const uploadRoot = path.resolve(process.cwd(), "server", "uploads");

fs.mkdirSync(uploadRoot, { recursive: true });

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173", credentials: true }));
app.use(express.json({ limit: "5mb" }));
app.use("/uploads", express.static(uploadRoot));

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
  limits: { fileSize: 10 * 1024 * 1024 },
});

const normalizeRecord = (record: any) => {
  const object = record.toObject ? record.toObject() : record;
  const { _id, __v, ...rest } = object;
  return { ...rest, id: _id.toString() };
};

const logAction = async (user: string, action: string, ip?: string) => {
  await AdminLog.create({ user, action, ip: ip || "unknown" });
};

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, database: mongoose.connection.readyState === 1 ? "connected" : "disconnected" });
});

app.post("/api/admin/login", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const login = String(email || username || "").trim().toLowerCase();
    const admin = await AdminUser.findOne({ email: login, isActive: true });

    if (!admin || !password || !(await bcrypt.compare(password, admin.passwordHash))) {
      return res.status(401).json({ error: "Invalid admin credentials" });
    }

    const user = {
      id: admin._id.toString(),
      email: admin.email,
      name: admin.name,
      role: admin.role,
    };
    const token = signAdminToken(user);

    await logAction(`${admin.name} (${admin.role})`, "Admin Dashboard Logged In Successfully", req.ip);
    res.json({ success: true, token, user });
  } catch (error) {
    console.error("Admin login failed:", error);
    res.status(500).json({ error: "Admin login failed" });
  }
});

app.get("/api/data", requireAuth, async (_req, res) => {
  try {
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

app.post("/api/parent-registration", async (req, res) => {
  try {
    const record = await ParentInquiry.create(req.body);
    await logAction(
      "Parent / Student Visitor",
      `New Tutor Request submitted by ${record.name} for Class ${record.studentClass}`,
      req.ip,
    );
    res.json({ success: true, record: normalizeRecord(record) });
  } catch (error) {
    console.error("Parent registration failed:", error);
    res.status(400).json({ error: "Failed to log parent inquiry" });
  }
});

app.post(
  "/api/teacher-registration",
  upload.fields([
    { name: "resume", maxCount: 1 },
    { name: "photo", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const files = req.files as Record<string, Express.Multer.File[]> | undefined;
      const resumeUrl = files?.resume?.[0] ? `/uploads/${files.resume[0].filename}` : "";
      const photoUrl = files?.photo?.[0] ? `/uploads/${files.photo[0].filename}` : "";
      const record = await TeacherRegistration.create({
        ...req.body,
        resumeUrl,
        photoUrl,
        isApproved: false,
      });

      await logAction(
        "Teacher Applicant",
        `New Teacher Registration received from ${record.name} (${record.qualification})`,
        req.ip,
      );
      res.json({ success: true, record: normalizeRecord(record) });
    } catch (error) {
      console.error("Teacher registration failed:", error);
      res.status(400).json({ error: "Failed to persist teacher registration" });
    }
  },
);

app.post("/api/school-request", async (req, res) => {
  try {
    const record = await SchoolRequest.create(req.body);
    await logAction(
      "School / Institution",
      `New school solution inquiry submitted by ${record.orgName} (${record.contactPerson})`,
      req.ip,
    );
    res.json({ success: true, record: normalizeRecord(record) });
  } catch (error) {
    console.error("School request failed:", error);
    res.status(400).json({ error: "Failed to submit school solution request" });
  }
});

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
          await TeacherRegistration.findByIdAndDelete(id);
        } else if (entityType === "schools") {
          await SchoolRequest.findByIdAndDelete(id);
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
        await logAction(
          adminUser,
          `${teacher.isApproved ? "Approved" : "Disapproved"} Teacher: ${teacher.name}`,
          req.ip,
        );
        return res.json({ success: true, isApproved: teacher.isApproved });
      }

      res.status(400).json({ error: "Invalid admin action request" });
    } catch (error) {
      console.error("Admin action failed:", error);
      res.status(500).json({ error: "Admin operation failed" });
    }
  },
);

app.post("/api/admin/gemini-report", requireAuth, async (_req, res) => {
  try {
    res.json({ report: await generateAdminReport() });
  } catch (error) {
    console.error("Gemini report generation failed:", error);
    res.status(500).json({ error: "Failed to generate report using Gemini API" });
  }
});

const start = async () => {
  const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/raft-tutor-axis";
  await mongoose.connect(mongoUri);
  await seedInitialAdmin();

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
