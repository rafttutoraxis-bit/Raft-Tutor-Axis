import mongoose, { Schema } from "mongoose";

const timestamps = { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } };

// Dynamic System Settings Schema
const systemSettingsSchema = new Schema(
  {
    siteName: { type: String, default: "Raft Tutor Axis" },
    logoUrl: { type: String, default: "" },
    supportPhone: { type: String, default: "+91 62053 55760" },
    supportEmail: { type: String, default: "support@rafttutoraxis.com" },
    registrationFee: { type: Number, default: 149 },
    upiId: { type: String, default: "6205355760-3@ybl" },
    qrCodeUrl: { type: String, default: "" },
    enableRegistration: { type: Boolean, default: true },
    enableAI: { type: Boolean, default: true },
    enableEmail: { type: Boolean, default: true },
    enableWhatsApp: { type: Boolean, default: true },
  },
  timestamps
);

// Parent Inquiry Schema
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
    status: { type: String, enum: ["Pending", "Mapped", "Closed"], default: "Pending" },
    assignedTeacherId: { type: Schema.Types.ObjectId, ref: "TeacherRegistration", default: null },
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null }
  },
  timestamps,
);

// Teacher Registration Schema
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
    screenshotUrl: { type: String, default: "" }, // UPI payment screenshot receipt
    address: { type: String, required: true, trim: true },
    isApproved: { type: Boolean, default: false },
    paymentStatus: { 
      type: String, 
      enum: ["Pending", "Paid", "Verified", "Rejected"], 
      default: "Pending" 
    },
    txnId: { type: String, default: "" },
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null }
  },
  timestamps,
);

// School Request Schema
const schoolRequestSchema = new Schema(
  {
    orgName: { type: String, required: true, trim: true },
    contactPerson: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    location: { type: String, required: true, trim: true },
    details: { type: String, required: true, trim: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null }
  },
  timestamps,
);

// School Vacancies Schema
const vacancySchema = new Schema(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: "SchoolRequest", required: true },
    schoolName: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    board: { type: String, enum: ["CBSE", "ICSE", "State Board"], default: "CBSE" },
    city: { type: String, required: true, trim: true },
    qualification: { type: String, required: true },
    experience: { type: String, required: true },
    salary: { type: String, default: "" },
    description: { type: String, default: "" },
    status: { type: String, enum: ["Open", "Closed"], default: "Open" },
  },
  timestamps,
);

// Audit Log Schema
const adminLogSchema = new Schema(
  {
    user: { type: String, required: true },
    action: { type: String, required: true },
    ip: { type: String, default: "unknown" },
  },
  { timestamps: { createdAt: "timestamp", updatedAt: false } },
);

// Unified Authentication User Schema
const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: { 
      type: String, 
      enum: ["Super Admin", "Operations Manager", "Teacher", "Parent", "School"], 
      default: "Teacher" 
    },
    isActive: { type: Boolean, default: true },
    refId: { type: Schema.Types.ObjectId, refPath: "refModel", default: null },
    refModel: { 
      type: String, 
      enum: ["TeacherRegistration", "ParentInquiry", "SchoolRequest"], 
      default: null 
    },
    refreshToken: { type: String, default: "" },
    resetPasswordToken: { type: String, default: "" },
    resetPasswordExpires: { type: Date, default: null }
  },
  timestamps,
);

export const SystemSettings = mongoose.model("SystemSettings", systemSettingsSchema);
export const ParentInquiry = mongoose.model("ParentInquiry", parentInquirySchema);
export const TeacherRegistration = mongoose.model("TeacherRegistration", teacherRegistrationSchema);
export const SchoolRequest = mongoose.model("SchoolRequest", schoolRequestSchema);
export const Vacancy = mongoose.model("Vacancy", vacancySchema);
export const AdminLog = mongoose.model("AdminLog", adminLogSchema);
export const User = mongoose.model("User", userSchema);
export const AdminUser = User; // Backward compatibility alias

// OTP Verification Schema (valid for 5 minutes)
const otpSchema = new Schema(
  {
    email: { type: String, required: true, trim: true, lowercase: true },
    otp: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: 300 }
  }
);
export const Otp = mongoose.model("Otp", otpSchema);
