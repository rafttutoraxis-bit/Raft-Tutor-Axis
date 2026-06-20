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

  const passwordHash = await bcrypt.hash(password, 12);
  const role = (process.env.ADMIN_ROLE || "Super Admin") as AdminRole;
  const name = process.env.ADMIN_NAME || "Raft Tutor Axis Admin";

  const existing = await AdminUser.findOne({ email });
  if (existing) {
    const matches = await bcrypt.compare(password, existing.passwordHash);
    if (!matches || existing.name !== name || existing.role !== role) {
      existing.passwordHash = passwordHash;
      existing.role = role;
      existing.name = name;
      await existing.save();
      await AdminLog.create({
        user: "System",
        action: `Updated credentials/profile for ${email}`,
        ip: "127.0.0.1",
      });
      console.log(`[seed] Updated existing admin account for ${email} with latest config.`);
    }
    return;
  }

  await AdminUser.create({ name, email, passwordHash, role });
  await AdminLog.create({
    user: "System",
    action: `Seeded initial ${role} account for ${email}`,
    ip: "127.0.0.1",
  });
};
