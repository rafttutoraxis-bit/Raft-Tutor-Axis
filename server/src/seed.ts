import bcrypt from "bcryptjs";
import { AdminLog, AdminUser } from "./models.js";
import type { AdminRole } from "./auth.js";

export const seedInitialAdmin = async () => {
  const email = (process.env.ADMIN_EMAIL || "admin@rafttutoraxis.com").toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!password) {
    console.warn("[seed] ADMIN_PASSWORD is not set; skipping admin seed.");
    return;
  }

  const existing = await AdminUser.findOne({ email });
  if (existing) {
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const role = (process.env.ADMIN_ROLE || "Super Admin") as AdminRole;
  const name = process.env.ADMIN_NAME || "Raft Tutor Axis Admin";

  await AdminUser.create({ name, email, passwordHash, role });
  await AdminLog.create({
    user: "System",
    action: `Seeded initial ${role} account for ${email}`,
    ip: "127.0.0.1",
  });
};
