import mongoose, { Schema } from "mongoose";

const timestamps = { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } };

const parentInquirySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    city: { type: String, required: true, trim: true },
    studentClass: { type: String, required: true, trim: true },
    board: { type: String, enum: ["CBSE", "ICSE", "State Board"], default: "CBSE" },
    subjects: { type: String, required: true, trim: true },
    mode: { type: String, enum: ["Home", "Online"], default: "Home" },
    address: { type: String, required: true, trim: true },
    message: { type: String, default: "", trim: true },
  },
  timestamps,
);

const teacherRegistrationSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    gender: { type: String, enum: ["Male", "Female", "Other"], default: "Male" },
    city: { type: String, required: true, trim: true },
    qualification: { type: String, required: true, trim: true },
    experience: { type: String, required: true, trim: true },
    subjects: { type: String, required: true, trim: true },
    classes: { type: String, required: true, trim: true },
    mode: { type: String, enum: ["Home", "Online", "Both"], default: "Both" },
    expectedFees: { type: String, default: "", trim: true },
    resumeUrl: { type: String, required: true, trim: true },
    photoUrl: { type: String, default: "" },
    address: { type: String, required: true, trim: true },
    isApproved: { type: Boolean, default: false },
    paymentStatus: { type: String, enum: ["Pending", "Paid"], default: "Pending" },
    txnId: { type: String, default: "" },
  },
  timestamps,
);

const schoolRequestSchema = new Schema(
  {
    orgName: { type: String, required: true, trim: true },
    contactPerson: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    location: { type: String, required: true, trim: true },
    details: { type: String, required: true, trim: true },
  },
  timestamps,
);

const adminLogSchema = new Schema(
  {
    user: { type: String, required: true },
    action: { type: String, required: true },
    ip: { type: String, default: "unknown" },
  },
  { timestamps: { createdAt: "timestamp", updatedAt: false } },
);

const adminUserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["Super Admin", "Operations Manager"], default: "Operations Manager" },
    isActive: { type: Boolean, default: true },
  },
  timestamps,
);

export const ParentInquiry = mongoose.model("ParentInquiry", parentInquirySchema);
export const TeacherRegistration = mongoose.model("TeacherRegistration", teacherRegistrationSchema);
export const SchoolRequest = mongoose.model("SchoolRequest", schoolRequestSchema);
export const AdminLog = mongoose.model("AdminLog", adminLogSchema);
export const AdminUser = mongoose.model("AdminUser", adminUserSchema);
