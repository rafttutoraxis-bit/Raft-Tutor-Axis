export interface ParentRegistration {
  id: string;
  name: string;
  mobile: string;
  email: string;
  city: string;
  studentClass: string;
  board: 'CBSE' | 'ICSE' | 'State Board';
  subjects: string;
  mode: 'Home' | 'Online';
  address: string;
  message: string;
  createdAt: string;
}

export interface TeacherRegistration {
  id: string;
  name: string;
  mobile: string;
  email: string;
  gender: 'Male' | 'Female' | 'Other';
  city: string;
  qualification: string;
  experience: string;
  subjects: string;
  classes: string;
  mode: 'Home' | 'Online' | 'Both';
  expectedFees: string;
  resumeUrl: string; // Base64 data-URI or placeholder
  photoUrl: string;  // Base64 data-URI or placeholder
  address: string;
  isApproved: boolean;
  paymentStatus?: 'Pending' | 'Paid';
  txnId?: string;
  createdAt: string;
}

export interface SchoolRequest {
  id: string;
  orgName: string;
  contactPerson: string;
  phone: string;
  email: string;
  location: string;
  details: string;
  createdAt: string;
}

export interface AdminLog {
  id: string;
  user: string;
  action: string;
  timestamp: string;
  ip: string;
}

export type Language = 'en' | 'hi';

export interface TranslationSet {
  brandName: string;
  heroTitle: string;
  heroSub: string;
  heroHindiText: string;
  heroBadge: string;
  ctaBookDemo: string;
  ctaFindTutor: string;
  ctaBecomeTeacher: string;
  ctaSchoolSol: string;
  navHome: string;
  navAbout: string;
  navServices: string;
  navContact: string;
  navAdmin: string;
}
