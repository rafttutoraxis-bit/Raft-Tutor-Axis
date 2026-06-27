import React, { useState } from "react";
import { User, Phone, Mail, MapPin, GraduationCap, Briefcase, BookOpen, Layers, IndianRupee, FileText, Camera, CheckCircle2, AlertCircle, Sparkles, Building, Send, QrCode, Shield, RefreshCw, Eye, EyeOff } from "lucide-react";
import { API_URL } from "../config";
import { useSettings } from "../contexts/SettingsContext";
import Card from "./UI/Card";
import Button from "./UI/Button";

interface FormsProps {
  lang: "en" | "hi";
  onNewRegistration?: () => void;
}

export default function Forms({ lang, onNewRegistration }: FormsProps) {
  const { settings } = useSettings();
  const [activeForm, setActiveForm] = useState<"parent" | "teacher" | "school">("parent");

  // Parent form state
  const [parentData, setParentData] = useState({
    name: "",
    mobile: "",
    email: "",
    city: "",
    studentClass: "",
    board: "CBSE",
    subjects: "",
    mode: "Home",
    address: "",
    message: "",
    password: ""
  });

  // Teacher form state
  const [teacherData, setTeacherData] = useState({
    name: "",
    mobile: "",
    email: "",
    gender: "Male",
    city: "",
    qualification: "",
    experience: "",
    subjects: "",
    classes: "",
    mode: "Both",
    expectedFees: "",
    resumeUrl: "",
    photoUrl: "",
    address: "",
    password: ""
  });

  // School form state
  const [schoolData, setSchoolData] = useState({
    orgName: "",
    contactPerson: "",
    phone: "",
    email: "",
    location: "",
    details: "",
    password: ""
  });

  const [status, setStatus] = useState<{ type: "success" | "error" | null; message: string }>({ type: null, message: "" });
  const [loading, setLoading] = useState(false);
  
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState("");

  // Payment gateway states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"qr" | "express">("qr");
  const [upiTxnId, setUpiTxnId] = useState("");
  const [isPaying, setIsPaying] = useState(false);
  const [paySuccess, setPaySuccess] = useState(false);

  // OTP Verification States
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpEmail, setOtpEmail] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpResendSuccess, setOtpResendSuccess] = useState(false);
  const [showParentPassword, setShowParentPassword] = useState(false);
  const [showTeacherPassword, setShowTeacherPassword] = useState(false);
  const [showSchoolPassword, setShowSchoolPassword] = useState(false);

  const renderPasswordStrength = (password: string) => {
    if (!password) return null;

    const requirements = [
      { id: "length", label: lang === "en" ? "Minimum 8 characters" : "कम से कम 8 अक्षर", met: password.length >= 8 },
      { id: "uppercase", label: lang === "en" ? "1 uppercase letter" : "1 बड़ा अक्षर (uppercase)", met: /[A-Z]/.test(password) },
      { id: "lowercase", label: lang === "en" ? "1 lowercase letter" : "1 छोटा अक्षर (lowercase)", met: /[a-z]/.test(password) },
      { id: "number", label: lang === "en" ? "1 number" : "1 संख्या (0-9)", met: /[0-9]/.test(password) },
      { id: "special", label: lang === "en" ? "1 special character" : "1 विशेष वर्ण (!@#$ etc)", met: /[^A-Za-z0-9]/.test(password) },
    ];

    const score = requirements.filter(r => r.met).length;
    let strengthColor = "bg-rose-500";
    let strengthText = lang === "en" ? "Weak" : "कमजोर";
    if (score >= 5) {
      strengthColor = "bg-[#9bfc07]";
      strengthText = lang === "en" ? "Strong" : "मजबूत";
    } else if (score >= 3) {
      strengthColor = "bg-amber-500";
      strengthText = lang === "en" ? "Medium" : "मध्यम";
    }

    return (
      <div className="mt-3.5 space-y-3.5 bg-[#110d22]/50 p-4 rounded-xl border border-zinc-800/80 animate-fade-in select-none">
        <div className="flex justify-between items-center text-[10px] font-mono">
          <span className="text-zinc-400">{lang === "en" ? "Password Strength:" : "पासवर्ड की ताकत:"}</span>
          <span className={`font-bold uppercase tracking-wider ${score >= 5 ? "text-[#9bfc07]" : score >= 3 ? "text-amber-400" : "text-rose-400"}`}>{strengthText}</span>
        </div>
        <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden flex gap-0.5">
          <div className={`h-full transition-all duration-300 ${strengthColor}`} style={{ width: `${(score / 5) * 100}%` }} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] font-mono mt-2">
          {requirements.map((req, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${req.met ? "bg-[#9bfc07] shadow-sm shadow-[#9bfc07]/50" : "bg-zinc-650"}`} />
              <span className={req.met ? "text-white font-medium" : "text-zinc-400"}>{req.label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };
  const startOtpFlow = async (email: string) => {
    setOtpError("");
    setOtpResendSuccess(false);
    setOtpLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      if (response.ok) {
        setOtpEmail(email);
        setShowOtpModal(true);
      } else {
        setStatus({ type: "error", message: data.error || "Failed to trigger OTP verification code." });
      }
    } catch {
      setStatus({ type: "error", message: "Failed to dispatch verification email. Verify connectivity." });
    } finally {
      setOtpLoading(false);
    }
  };

  const executeTeacherSubmit = (paid: boolean, txnId?: string) => {
    if (!paid) {
      alert("Payment is required to complete registration.");
      return;
    }
    if (!screenshotFile) {
      alert("Please upload your payment screenshot receipt.");
      return;
    }
    if (!txnId || txnId.length !== 12) {
      alert("Please enter a valid 12-digit transaction ID.");
      return;
    }
    setShowPaymentModal(false);
    startOtpFlow(teacherData.email);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length !== 6) {
      setOtpError("Please enter a valid 6-digit OTP code.");
      return;
    }

    setOtpLoading(true);
    setOtpError("");
    try {
      let response;
      let data;
      
      if (activeForm === "parent") {
        response = await fetch(`${API_URL}/api/parent-registration`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...parentData, otp: otpCode })
        });
        data = await response.json();
      } else if (activeForm === "teacher") {
        const formData = new FormData();
        Object.entries(teacherData).forEach(([key, val]) => {
          formData.append(key, val as string);
        });
        formData.append("otp", otpCode);
        formData.append("paymentStatus", "Paid");
        formData.append("txnId", upiTxnId);
        
        if (resumeFile) formData.append("resume", resumeFile);
        if (photoFile) formData.append("photo", photoFile);
        if (screenshotFile) formData.append("screenshot", screenshotFile);

        response = await fetch(`${API_URL}/api/teacher-registration`, {
          method: "POST",
          body: formData
        });
        data = await response.json();
      } else if (activeForm === "school") {
        response = await fetch(`${API_URL}/api/school-request`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...schoolData, otp: otpCode })
        });
        data = await response.json();
      }

      if (response && response.ok && data.success) {
        localStorage.setItem("rta_token", data.token);
        localStorage.setItem("rta_admin_token", data.token);
        localStorage.setItem("rta_refresh_token", data.refreshToken);
        localStorage.setItem("rta_user", JSON.stringify(data.user));
        
        window.dispatchEvent(new Event("auth-changed"));
        setShowOtpModal(false);
        setOtpCode("");

        if (onNewRegistration) {
          onNewRegistration();
        }

        setStatus({
          type: "success",
          message: activeForm === "teacher"
            ? "Registration submitted successfully! Your profile is pending verification."
            : "Registration completed successfully! Welcome to Raft Tutor Axis."
        });

        setTimeout(() => {
          const workspace = document.getElementById("portal-workspace-console");
          if (workspace) {
            workspace.scrollIntoView({ behavior: "smooth", block: "start" });
          } else {
            window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
          }
        }, 800);
      } else {
        setOtpError(data?.error || "OTP verification failed. Please try again.");
      }
    } catch (err: any) {
      setOtpError("Network error. Failed to complete registration.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setOtpLoading(true);
    setOtpError("");
    setOtpResendSuccess(false);
    try {
      const response = await fetch(`${API_URL}/api/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: otpEmail })
      });
      const data = await response.json();
      if (response.ok) {
        setOtpResendSuccess(true);
      } else {
        setOtpError(data.error || "Failed to resend OTP code.");
      }
    } catch {
      setOtpError("Failed to resend OTP. Verify connectivity.");
    } finally {
      setOtpLoading(false);
    }
  };

  const getFullUrl = (path: string) => {
    if (!path) return "";
    if (path.startsWith("http") || path.startsWith("data:")) return path;
    return `${API_URL}${path}`;
  };

  // File processors
  const handlePhotoLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setTeacherData(prev => ({ ...prev, photoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResumeLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setResumeFile(file);
      setTeacherData(prev => ({ ...prev, resumeUrl: file.name }));
    }
  };

  const handleScreenshotLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScreenshotFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleParentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check dynamic setting toggles
    if (!settings.enableRegistration) {
      setStatus({ type: "error", message: "Registrations are currently closed." });
      return;
    }

    if (
      !parentData.name ||
      !parentData.mobile ||
      !parentData.email ||
      !parentData.city ||
      !parentData.studentClass ||
      !parentData.subjects ||
      !parentData.address ||
      !parentData.password
    ) {
      setStatus({ type: "error", message: lang === "en" ? "Please fill all required keys." : "कृपया सभी आवश्यक विवरण भरें।" });
      return;
    }

    if (parentData.password.length < 8) {
      setStatus({ type: "error", message: "Password must be at least 8 characters long." });
      return;
    }

    await startOtpFlow(parentData.email);
  };

  const handleTeacherSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!settings.enableRegistration) {
      setStatus({ type: "error", message: "Registrations are currently closed." });
      return;
    }

    if (
      !teacherData.name ||
      !teacherData.mobile ||
      !teacherData.email ||
      !teacherData.city ||
      !teacherData.qualification ||
      !teacherData.experience ||
      !teacherData.subjects ||
      !teacherData.classes ||
      !teacherData.address ||
      !teacherData.password ||
      !resumeFile
    ) {
      setStatus({ type: "error", message: "Required fields missing. Please fill out all fields and upload your Resume/Biodata." });
      return;
    }

    if (teacherData.password.length < 8) {
      setStatus({ type: "error", message: "Password must be at least 8 characters long." });
      return;
    }

    setStatus({ type: null, message: "" });
    setShowPaymentModal(true);
  };

  const handleExpressPay = (provider: string) => {
    setIsPaying(true);
    setTimeout(() => {
      setIsPaying(false);
      setPaySuccess(true);
      setTimeout(() => {
        const mockTxnId = Math.floor(100000000000 + Math.random() * 900000000000).toString();
        setUpiTxnId(mockTxnId);
        const mockBlob = new Blob(["express payment receipt"], { type: "image/png" });
        const mockFile = new File([mockBlob], `receipt_${provider.toLowerCase()}.png`, { type: "image/png" });
        setScreenshotFile(mockFile);
        setPaySuccess(false);
        startOtpFlow(teacherData.email);
      }, 1500);
    }, 1500);
  };

  const handleSchoolSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!settings.enableRegistration) {
      setStatus({ type: "error", message: "Registrations are currently closed." });
      return;
    }

    if (
      !schoolData.orgName ||
      !schoolData.contactPerson ||
      !schoolData.phone ||
      !schoolData.email ||
      !schoolData.location ||
      !schoolData.details ||
      !schoolData.password
    ) {
      setStatus({ type: "error", message: "All fields including password are required." });
      return;
    }

    if (schoolData.password.length < 8) {
      setStatus({ type: "error", message: "Password must be at least 8 characters long." });
      return;
    }

    await startOtpFlow(schoolData.email);
  };

  return (
    <section className="py-16 bg-[#110d22] transition-colors duration-300" id="inquiry-forms-section">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Navigation Selector */}
        <div className="text-center mb-10 select-none">
          <div className="inline-flex bg-[#1b1631] p-1.5 rounded-xl shadow-inner border border-[#9bfc07]/15">
            <button
              onClick={() => { setActiveForm("parent"); setStatus({ type: null, message: "" }); }}
              className={`px-5 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                activeForm === "parent"
                  ? "bg-[#9bfc07] text-[#1b1631] shadow-md shadow-[#9bfc07]/20 font-bold"
                  : "text-gray-300 hover:text-[#9bfc07]"
              }`}
            >
              👩‍👦 {lang === "en" ? "Find Tutor (Parents)" : "ट्यूटर खोजें (अभिभावक)"}
            </button>
            <button
              onClick={() => { setActiveForm("teacher"); setStatus({ type: null, message: "" }); }}
              className={`px-5 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                activeForm === "teacher"
                  ? "bg-[#9bfc07] text-[#1b1631] shadow-md shadow-[#9bfc07]/20 font-bold"
                  : "text-gray-300 hover:text-[#9bfc07]"
              }`}
            >
              👨‍🏫 {lang === "en" ? "Join as Teacher" : "शिक्षक बनें"}
            </button>
            <button
              onClick={() => { setActiveForm("school"); setStatus({ type: null, message: "" }); }}
              className={`px-5 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                activeForm === "school"
                  ? "bg-[#9bfc07] text-[#1b1631] shadow-md shadow-[#9bfc07]/20 font-bold"
                  : "text-gray-300 hover:text-[#9bfc07]"
              }`}
            >
              🏫 {lang === "en" ? "School Solutions" : "स्कूल समाधान"}
            </button>
          </div>
        </div>

        {/* Status Warnings */}
        {status.type && (
          <div className={`p-4 rounded-xl mb-8 flex items-start gap-3 border animate-fade-in ${
            status.type === "success" 
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" 
              : "bg-rose-500/10 text-rose-400 border-rose-500/30"
          }`}>
            {status.type === "success" ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
            <span className="text-xs font-medium leading-normal">{status.message}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-8">
            {/* Form Elements Container */}
            <div className="bg-[#1b1631] border border-[#9bfc07]/15 rounded-2xl shadow-xl p-6 sm:p-10 transition-all duration-300">
          
          {/* Parent Registration Form */}
          {activeForm === "parent" && (
            <form onSubmit={handleParentSubmit} className="space-y-6">
              <div className="flex items-center gap-2 mb-4 select-none">
                <Sparkles className="w-5 h-5 text-[#9bfc07] animate-pulse" />
                <h3 className="font-display font-semibold text-lg text-white uppercase tracking-wider">
                  {lang === "en" ? "Home Tuition Request Wizard" : "ट्यूटर अनुरोध केंद्र"}
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-white text-xs">
                <div className="space-y-1.5">
                  <label htmlFor="parent-name" className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{lang === "en" ? "Parent Name" : "अभिभावक का नाम"}<span className="text-red-500 ml-1">*</span></label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                    <input
                      id="parent-name"
                      type="text"
                      value={parentData.name}
                      onChange={e => setParentData({ ...parentData, name: e.target.value })}
                      placeholder="e.g. Ramesh Singh"
                      className="w-full bg-[#110d22] pl-10 pr-4 py-3 rounded-xl border border-zinc-800 focus:border-[#9bfc07] outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="parent-mobile" className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{lang === "en" ? "Mobile Number" : "मोबाइल नंबर"}<span className="text-red-500 ml-1">*</span></label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                    <input
                      id="parent-mobile"
                      type="tel"
                      value={parentData.mobile}
                      onChange={e => setParentData({ ...parentData, mobile: e.target.value })}
                      placeholder="10 digit number"
                      className="w-full bg-[#110d22] pl-10 pr-4 py-3 rounded-xl border border-zinc-800 focus:border-[#9bfc07] outline-none font-mono"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="parent-email" className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{lang === "en" ? "Email Address" : "ईमेल खाता"}<span className="text-red-500 ml-1">*</span></label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                    <input
                      id="parent-email"
                      type="email"
                      value={parentData.email}
                      onChange={e => setParentData({ ...parentData, email: e.target.value })}
                      placeholder="e.g. parent@gmail.com"
                      className="w-full bg-[#110d22] pl-10 pr-4 py-3 rounded-xl border border-zinc-800 focus:border-[#9bfc07] outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="parent-city" className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{lang === "en" ? "City Location" : "शहर का नाम"}<span className="text-red-500 ml-1">*</span></label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                    <input
                      id="parent-city"
                      type="text"
                      value={parentData.city}
                      onChange={e => setParentData({ ...parentData, city: e.target.value })}
                      placeholder="e.g. Vadodara or Surat"
                      className="w-full bg-[#110d22] pl-10 pr-4 py-3 rounded-xl border border-zinc-800 focus:border-[#9bfc07] outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="parent-student-class" className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{lang === "en" ? "Student Class" : "कक्षा"}<span className="text-red-500 ml-1">*</span></label>
                  <div className="relative">
                    <Layers className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                    <input
                      id="parent-student-class"
                      type="text"
                      value={parentData.studentClass}
                      onChange={e => setParentData({ ...parentData, studentClass: e.target.value })}
                      placeholder="e.g. Class 10th or Class 12th"
                      className="w-full bg-[#110d22] pl-10 pr-4 py-3 rounded-xl border border-zinc-800 focus:border-[#9bfc07] outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="parent-board" className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{lang === "en" ? "Educational Board" : "बोर्ड"}<span className="text-red-500 ml-1">*</span></label>
                  <select
                    id="parent-board"
                    value={parentData.board}
                    onChange={e => setParentData({ ...parentData, board: e.target.value as any })}
                    className="w-full bg-[#110d22] px-3.5 py-3 rounded-xl border border-zinc-800 focus:border-[#9bfc07] outline-none"
                  >
                    <option value="CBSE">CBSE Board</option>
                    <option value="ICSE">ICSE Board</option>
                    <option value="State Board">State Board</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="parent-subjects" className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{lang === "en" ? "Subjects Required" : "आवश्यक विषय"}<span className="text-red-500 ml-1">*</span></label>
                  <div className="relative">
                    <BookOpen className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                    <input
                      id="parent-subjects"
                      type="text"
                      value={parentData.subjects}
                      onChange={e => setParentData({ ...parentData, subjects: e.target.value })}
                      placeholder="e.g. Physics, Chemistry, Maths"
                      className="w-full bg-[#110d22] pl-10 pr-4 py-3 rounded-xl border border-zinc-800 focus:border-[#9bfc07] outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="parent-mode" className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{lang === "en" ? "Tuition Mode" : "ट्यूशन मोड"}<span className="text-red-500 ml-1">*</span></label>
                  <select
                    id="parent-mode"
                    value={parentData.mode}
                    onChange={e => setParentData({ ...parentData, mode: e.target.value as any })}
                    className="w-full bg-[#110d22] px-3.5 py-3 rounded-xl border border-zinc-800 focus:border-[#9bfc07] outline-none"
                  >
                    <option value="Home">{lang === "en" ? "Home Tuition (Offline)" : "होम ट्यूशन (ऑफलाइन)"}</option>
                    <option value="Online">{lang === "en" ? "Online Live Class" : "ऑनलाइन लाइव क्लास"}</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5 text-white text-xs">
                <label htmlFor="parent-password" className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                  {lang === "en" ? "Create Password" : "पासवर्ड बनाएं"}<span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <input
                    id="parent-password"
                    type={showParentPassword ? "text" : "password"}
                    value={parentData.password}
                    onChange={e => setParentData({ ...parentData, password: e.target.value })}
                    placeholder="Minimum 8 characters"
                    className="w-full bg-[#110d22] pl-4 pr-11 py-3 rounded-xl border border-zinc-800 focus:border-[#9bfc07] outline-none text-xs text-white transition-all duration-200"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowParentPassword(!showParentPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-zinc-450 hover:text-[#9bfc07] transition-all duration-200 focus:outline-none cursor-pointer flex items-center justify-center"
                    aria-label={showParentPassword ? "Hide password" : "Show password"}
                  >
                    {showParentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {renderPasswordStrength(parentData.password)}
              </div>

              <div className="space-y-1.5 text-white text-xs">
                <label htmlFor="parent-address" className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{lang === "en" ? "Full Physical Address" : "पूरा पता"}<span className="text-red-500 ml-1">*</span></label>
                <textarea
                  id="parent-address"
                  value={parentData.address}
                  onChange={e => setParentData({ ...parentData, address: e.target.value })}
                  placeholder="e.g. Vrindavan Chokdi, House No. 25, Vadodara"
                  className="w-full bg-[#110d22] p-3.5 rounded-xl border border-zinc-800 focus:border-[#9bfc07] outline-none h-20 resize-none"
                  required
                />
              </div>

              <div className="space-y-1.5 text-white text-xs">
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{lang === "en" ? "Additional Messages" : "अन्य विवरण"}</label>
                <textarea
                  value={parentData.message}
                  onChange={e => setParentData({ ...parentData, message: e.target.value })}
                  placeholder="Tell us student weak areas or teacher timing preferences..."
                  className="w-full bg-[#110d22] p-3.5 rounded-xl border border-zinc-800 focus:border-[#9bfc07] outline-none h-20 resize-none"
                />
              </div>

              <div className="flex items-center gap-1.5 p-3.5 bg-[#9bfc07]/10 rounded-xl border border-[#9bfc07]/20 text-xs text-[#9bfc07] font-mono select-none">
                <Sparkles className="w-4 h-4 animate-pulse shrink-0" />
                <span><strong>{settings.freeDemoBadge || "2 DAYS FREE DEMO"}:</strong> We will map a verified tutor for a two-day trial completely free. No advance fees required!</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#9bfc07] hover:bg-white text-[#1b1631] font-display font-semibold transition-all shadow-lg hover:shadow-[#9bfc07]/20 rounded-xl cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? "Registering Inquiries..." : (lang === "en" ? "Request a Free Demo Tutor" : "मुफ्त डेमो ट्यूटर का अनुरोध करें")}
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Teacher Applicant Form */}
          {activeForm === "teacher" && (
            <form onSubmit={handleTeacherSubmit} className="space-y-6 text-white text-xs">
              <div className="flex items-center gap-2 mb-4 select-none">
                <GraduationCap className="w-5 h-5 text-[#9bfc07]" />
                <h3 className="font-display font-semibold text-lg text-white uppercase tracking-wider">
                  Join India's Vetted Educator Network
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label htmlFor="teacher-name" className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Teacher Full Name<span className="text-red-500 ml-1">*</span></label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                    <input
                      id="teacher-name"
                      type="text"
                      value={teacherData.name}
                      onChange={e => setTeacherData({ ...teacherData, name: e.target.value })}
                      placeholder="e.g. Dr. PK Singh"
                      className="w-full bg-[#110d22] pl-10 pr-4 py-3 rounded-xl border border-zinc-800 focus:border-[#9bfc07] outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="teacher-mobile" className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Contact Number<span className="text-red-500 ml-1">*</span></label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                    <input
                      id="teacher-mobile"
                      type="tel"
                      value={teacherData.mobile}
                      onChange={e => setTeacherData({ ...teacherData, mobile: e.target.value })}
                      placeholder="e.g. 98765 43210"
                      className="w-full bg-[#110d22] pl-10 pr-4 py-3 rounded-xl border border-zinc-800 focus:border-[#9bfc07] outline-none font-mono"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="teacher-email" className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Email Address<span className="text-red-500 ml-1">*</span></label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                    <input
                      id="teacher-email"
                      type="email"
                      value={teacherData.email}
                      onChange={e => setTeacherData({ ...teacherData, email: e.target.value })}
                      placeholder="email@domain.com"
                      className="w-full bg-[#110d22] pl-10 pr-4 py-3 rounded-xl border border-zinc-800 focus:border-[#9bfc07] outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="teacher-gender" className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Gender Selection<span className="text-red-500 ml-1">*</span></label>
                  <select
                    id="teacher-gender"
                    value={teacherData.gender}
                    onChange={e => setTeacherData({ ...teacherData, gender: e.target.value as any })}
                    className="w-full bg-[#110d22] px-3.5 py-3 rounded-xl border border-zinc-800 focus:border-[#9bfc07] outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="teacher-qualification" className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Highest Qualification<span className="text-red-500 ml-1">*</span></label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                    <input
                      id="teacher-qualification"
                      type="text"
                      value={teacherData.qualification}
                      onChange={e => setTeacherData({ ...teacherData, qualification: e.target.value })}
                      placeholder="e.g. M.Sc Chemistry"
                      className="w-full bg-[#110d22] pl-10 pr-4 py-3 rounded-xl border border-zinc-800 focus:border-[#9bfc07] outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="teacher-experience" className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Teaching Experience<span className="text-red-500 ml-1">*</span></label>
                  <div className="relative">
                    <Briefcase className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                    <input
                      id="teacher-experience"
                      type="text"
                      value={teacherData.experience}
                      onChange={e => setTeacherData({ ...teacherData, experience: e.target.value })}
                      placeholder="e.g. 5 Years in CBSE School"
                      className="w-full bg-[#110d22] pl-10 pr-4 py-3 rounded-xl border border-zinc-800 focus:border-[#9bfc07] outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="teacher-city" className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">City Availability<span className="text-red-500 ml-1">*</span></label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                    <input
                      id="teacher-city"
                      type="text"
                      value={teacherData.city}
                      onChange={e => setTeacherData({ ...teacherData, city: e.target.value })}
                      placeholder="e.g. Vadodara"
                      className="w-full bg-[#110d22] pl-10 pr-4 py-3 rounded-xl border border-zinc-800 focus:border-[#9bfc07] outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Expected Monthly Salary</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={teacherData.expectedFees}
                      onChange={e => setTeacherData({ ...teacherData, expectedFees: e.target.value })}
                      placeholder="e.g. 15,000 / month"
                      className="w-full bg-[#110d22] pl-10 pr-4 py-3 rounded-xl border border-zinc-800 focus:border-[#9bfc07] outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="teacher-subjects" className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Specialist Subjects<span className="text-red-500 ml-1">*</span></label>
                  <div className="relative">
                    <BookOpen className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                    <input
                      id="teacher-subjects"
                      type="text"
                      value={teacherData.subjects}
                      onChange={e => setTeacherData({ ...teacherData, subjects: e.target.value })}
                      placeholder="e.g. Mathematics, Physics"
                      className="w-full bg-[#110d22] pl-10 pr-4 py-3 rounded-xl border border-zinc-800 focus:border-[#9bfc07] outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="teacher-classes" className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Classes you teach<span className="text-red-500 ml-1">*</span></label>
                  <div className="relative">
                    <Layers className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                    <input
                      id="teacher-classes"
                      type="text"
                      value={teacherData.classes}
                      onChange={e => setTeacherData({ ...teacherData, classes: e.target.value })}
                      placeholder="e.g. Class 9 to 12"
                      className="w-full bg-[#110d22] pl-10 pr-4 py-3 rounded-xl border border-zinc-800 focus:border-[#9bfc07] outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Preferred Mode</label>
                  <select
                    value={teacherData.mode}
                    onChange={e => setTeacherData({ ...teacherData, mode: e.target.value as any })}
                    className="w-full bg-[#110d22] px-3.5 py-3 rounded-xl border border-zinc-800 focus:border-[#9bfc07] outline-none"
                  >
                    <option value="Home">Home Tuition (Physical)</option>
                    <option value="Online">Online Sessions only</option>
                    <option value="Both">Both Modes Comfortable</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="teacher-resume" className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Upload Biodata / Resume<span className="text-red-500 ml-1">*</span></label>
                  <div className="flex items-center gap-3">
                    <label htmlFor="teacher-resume" className="cursor-pointer bg-[#110d22] border border-zinc-800 hover:border-[#9bfc07] px-3 py-2.5 rounded-xl flex items-center gap-1.5 text-[10px] text-zinc-400 font-medium select-none">
                      <FileText className="w-3.5 h-3.5 text-[#9bfc07]" />
                      <span>Choose PDF/DOC</span>
                      <input id="teacher-resume" type="file" accept=".pdf,.doc,.docx" onChange={handleResumeLoad} className="hidden" />
                    </label>
                    <span className="text-[9px] text-zinc-500 truncate max-w-[125px]">
                      {resumeFile ? `✓ ${resumeFile.name}` : "No CV uploaded"}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Professional Headshot</label>
                  <div className="flex items-center gap-3">
                    <label className="cursor-pointer bg-[#110d22] border border-zinc-800 hover:border-[#9bfc07] px-3 py-2.5 rounded-xl flex items-center gap-1.5 text-[10px] text-zinc-400 font-medium select-none">
                      <Camera className="w-3.5 h-3.5 text-[#9bfc07]" />
                      <span>Choose Image</span>
                      <input type="file" accept="image/*" onChange={handlePhotoLoad} className="hidden" />
                    </label>
                    {photoFile ? (
                      <img src={teacherData.photoUrl} className="w-9 h-9 rounded-full object-cover border border-[#9bfc07]/25 shrink-0" alt="Professional Headshot Preview" loading="lazy" width={36} height={36} />
                    ) : (
                      <span className="text-[9px] text-zinc-500">No image loaded</span>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Payment screenshot receipt</label>
                  <div className="flex items-center gap-3">
                    <label className="cursor-pointer bg-[#110d22] border border-zinc-800 hover:border-[#9bfc07] px-3 py-2.5 rounded-xl flex items-center gap-1.5 text-[10px] text-zinc-400 font-medium select-none">
                      <Camera className="w-3.5 h-3.5 text-[#9bfc07]" />
                      <span>Choose Image</span>
                      <input type="file" accept="image/*" onChange={handleScreenshotLoad} className="hidden" />
                    </label>
                    {screenshotFile ? (
                      <img src={screenshotPreview} className="w-9 h-9 rounded object-cover border border-[#9bfc07]/25 shrink-0" alt="Payment Screenshot Preview" loading="lazy" width={36} height={36} />
                    ) : (
                      <span className="text-[9px] text-zinc-500">No screenshot loaded</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 text-white text-xs">
                <label htmlFor="teacher-password" className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Create Password<span className="text-red-500 ml-1">*</span></label>
                <div className="relative">
                  <input
                    id="teacher-password"
                    type={showTeacherPassword ? "text" : "password"}
                    value={teacherData.password}
                    onChange={e => setTeacherData({ ...teacherData, password: e.target.value })}
                    placeholder="Minimum 8 characters"
                    className="w-full bg-[#110d22] pl-4 pr-11 py-3 rounded-xl border border-zinc-800 focus:border-[#9bfc07] outline-none text-xs text-white transition-all duration-200"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowTeacherPassword(!showTeacherPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-zinc-450 hover:text-[#9bfc07] transition-all duration-200 focus:outline-none cursor-pointer flex items-center justify-center"
                    aria-label={showTeacherPassword ? "Hide password" : "Show password"}
                  >
                    {showTeacherPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {renderPasswordStrength(teacherData.password)}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="teacher-address" className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Physical Address<span className="text-red-500 ml-1">*</span></label>
                <textarea
                  id="teacher-address"
                  value={teacherData.address}
                  onChange={e => setTeacherData({ ...teacherData, address: e.target.value })}
                  placeholder="Street name, Sector, Landmark, Town details"
                  className="w-full bg-[#110d22] p-3.5 rounded-xl border border-zinc-800 focus:border-[#9bfc07] outline-none h-20 resize-none"
                  required
                />
              </div>

              <div className="flex items-center gap-1.5 p-3.5 bg-[#9bfc07]/10 rounded-xl border border-[#9bfc07]/20 text-xs text-[#9bfc07] font-mono select-none">
                <Sparkles className="w-4 h-4 animate-pulse shrink-0" />
                <span>
                  <strong>ONE-TIME REGISTRATION FEE:</strong> A verified member fee of ₹{settings.registrationFee} applies to activate your RTA profile on the platform.
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#9bfc07] hover:bg-white text-[#1b1631] font-display font-semibold transition-all rounded-xl shadow-lg hover:shadow-[#9bfc07]/20 cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? "Saving Profile..." : "Register as Teacher"}
                <GraduationCap className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* School Solutions Form */}
          {activeForm === "school" && (
            <form onSubmit={handleSchoolSubmit} className="space-y-6 text-white text-xs">
              <div className="flex items-center gap-2 mb-4 select-none">
                <Building className="w-5 h-5 text-[#9bfc07]" />
                <h3 className="font-display font-semibold text-lg text-white uppercase tracking-wider">
                  School & Coaching Institute Faculty Inquiries
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label htmlFor="school-org-name" className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Organization / School Name<span className="text-red-500 ml-1">*</span></label>
                  <div className="relative">
                    <Building className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                    <input
                      id="school-org-name"
                      type="text"
                      value={schoolData.orgName}
                      onChange={e => setSchoolData({ ...schoolData, orgName: e.target.value })}
                      placeholder="e.g. Gyan Niketan Senior School"
                      className="w-full bg-[#110d22] pl-10 pr-4 py-3 rounded-xl border border-zinc-800 focus:border-[#9bfc07] outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="school-contact-person" className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Contact Person<span className="text-red-500 ml-1">*</span></label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                    <input
                      id="school-contact-person"
                      type="text"
                      value={schoolData.contactPerson}
                      onChange={e => setSchoolData({ ...schoolData, contactPerson: e.target.value })}
                      placeholder="e.g. Ramesh Prasad (Principal)"
                      className="w-full bg-[#110d22] pl-10 pr-4 py-3 rounded-xl border border-zinc-800 focus:border-[#9bfc07] outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="school-phone" className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Inquiry Phone<span className="text-red-500 ml-1">*</span></label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                    <input
                      id="school-phone"
                      type="tel"
                      value={schoolData.phone}
                      onChange={e => setSchoolData({ ...schoolData, phone: e.target.value })}
                      placeholder="Contact number"
                      className="w-full bg-[#110d22] pl-10 pr-4 py-3 rounded-xl border border-zinc-800 focus:border-[#9bfc07] outline-none font-mono"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="school-email" className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Email<span className="text-red-500 ml-1">*</span></label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                    <input
                      id="school-email"
                      type="email"
                      value={schoolData.email}
                      onChange={e => setSchoolData({ ...schoolData, email: e.target.value })}
                      placeholder="e.g. contact@school.edu"
                      className="w-full bg-[#110d22] pl-10 pr-4 py-3 rounded-xl border border-zinc-800 focus:border-[#9bfc07] outline-none"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="school-location" className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Physical Location / Town<span className="text-red-500 ml-1">*</span></label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                  <input
                    id="school-location"
                    type="text"
                    value={schoolData.location}
                    onChange={e => setSchoolData({ ...schoolData, location: e.target.value })}
                    placeholder="e.g. Vadodara, Gujarat"
                    className="w-full bg-[#110d22] pl-10 pr-4 py-3 rounded-xl border border-zinc-800 focus:border-[#9bfc07] outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5 text-white text-xs">
                <label htmlFor="school-password" className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Create Password<span className="text-red-500 ml-1">*</span></label>
                <div className="relative">
                  <input
                    id="school-password"
                    type={showSchoolPassword ? "text" : "password"}
                    value={schoolData.password}
                    onChange={e => setSchoolData({ ...schoolData, password: e.target.value })}
                    placeholder="Minimum 8 characters"
                    className="w-full bg-[#110d22] pl-4 pr-11 py-3 rounded-xl border border-zinc-800 focus:border-[#9bfc07] outline-none text-xs text-white transition-all duration-200"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSchoolPassword(!showSchoolPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-zinc-450 hover:text-[#9bfc07] transition-all duration-200 focus:outline-none cursor-pointer flex items-center justify-center"
                    aria-label={showSchoolPassword ? "Hide password" : "Show password"}
                  >
                    {showSchoolPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {renderPasswordStrength(schoolData.password)}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="school-details" className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Faculty Requirement Specifications<span className="text-red-500 ml-1">*</span></label>
                <textarea
                  id="school-details"
                  value={schoolData.details}
                  onChange={e => setSchoolData({ ...schoolData, details: e.target.value })}
                  placeholder="Identify PGT/TGT subject vacancies, salary slabs, teacher eligibility criteria..."
                  className="w-full bg-[#110d22] p-3.5 rounded-xl border border-zinc-800 focus:border-[#9bfc07] outline-none h-24 resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#9bfc07] hover:bg-white text-[#1b1631] font-display font-semibold transition-all rounded-xl shadow-lg hover:shadow-[#9bfc07]/20 cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? "Matching Talent Database..." : "Request School Teachers"}
                <Building className="w-4 h-4" />
              </button>
            </form>
          )}

            </div>
          </div>

          {/* Sidebar Column */}
          <aside className="lg:col-span-4 space-y-6 flex flex-col select-none">
            
            {/* Guarantee Callout */}
            <div className="bg-[#1b1631] border border-[#9bfc07]/15 p-6 rounded-2xl shadow-sm space-y-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-[#9bfc07]">
                {lang === "en" ? "RTA Professional Process" : "आरटीए व्यावसायिक प्रक्रिया"}
              </h4>
              <p className="text-xs text-gray-300 leading-relaxed font-semibold">
                {lang === "en" 
                  ? "Get matched with leading verified academic specialists within 24 hours of form filing."
                  : "फॉर्म जमा करने के केवल २४ घंटे के भीतर भारत के विशिष्ट और सत्यापित ट्यूटर्स के साथ जुड़ें।"}
              </p>
              
              <div className="pt-2 border-t border-[#9bfc07]/10 text-[11px] font-mono space-y-2 text-gray-400">
                <div className="flex items-center gap-2">
                  <span className="text-[#9bfc07] font-bold">✓</span>
                  <span>{lang === "en" ? "Verified & Certified Educators" : "केवल सत्यापित और विश्वसनीय शिक्षक"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#9bfc07] font-bold">✓</span>
                  <span>{lang === "en" ? "Affordable Tuition Bracket Fees" : "सस्ती और पारदर्शी ट्यूशन फीस"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#9bfc07] font-bold">✓</span>
                  <span>{lang === "en" ? "No Placement Surcharges" : "कोई अतिरिक्त सर्विस चार्ज नहीं"}</span>
                </div>
              </div>
            </div>

            {/* Quick Helpline Hotline Box */}
            <div className="bg-[#9bfc07]/5 border border-[#9bfc07]/20 p-5 rounded-2xl relative overflow-hidden">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{lang === "en" ? "RTA Operational Desk" : "समर्पित समन्वयक डेस्क"}</p>
              <p className="text-base font-black text-[#9bfc07] mt-1">
                {settings.supportPhone}
              </p>
              <p className="text-[9px] text-gray-400 italic mt-1 leading-none">
                {lang === "en" ? "* Call us for instant tutor mapping assistance" : "* तत्काल ट्यूटर सहायता और सिफारिश के लिए कॉल करें"}
              </p>
            </div>

          </aside>

        </div>
      </div>

      {/* Premium secure payment overlay modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in text-white font-sans">
          <Card variant="gradient" hoverable={false} className="max-w-md w-full p-6 sm:p-8 space-y-6">
            <div className="text-center relative">
              <div className="mx-auto w-12 h-12 bg-[#9bfc07]/10 border border-[#9bfc07]/30 rounded-full flex items-center justify-center text-[#9bfc07] mb-3.5">
                <Shield className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="font-display font-bold text-lg leading-tight uppercase tracking-wider">
                RTA Pay-Gate Security
              </h3>
              <p className="text-[10px] text-zinc-400 font-mono tracking-widest mt-1">
                SECURE UPI TRANSACTIONS DESK
              </p>
            </div>

            <div className="bg-[#110d22] border border-[#9bfc07]/10 p-4 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between text-zinc-450">
                <span>Account Tier</span>
                <span className="font-bold text-white">Vetted Network Member</span>
              </div>
              <div className="flex justify-between text-zinc-450">
                <span>Verification Fee</span>
                <span className="font-bold text-white">₹{settings.registrationFee}.00</span>
              </div>
              <div className="border-t border-[#9bfc07]/10 pt-2 flex justify-between text-sm font-semibold">
                <span className="text-[#9bfc07]">Total Due Amount</span>
                <span className="text-[#9bfc07]">₹{settings.registrationFee}.00</span>
              </div>
            </div>

            <div className="flex bg-[#110d22] p-1 rounded-lg border border-[#9bfc07]/10">
              <button
                type="button"
                onClick={() => setPaymentMethod("qr")}
                className={`flex-1 py-2 text-center text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  paymentMethod === "qr"
                    ? "bg-[#9bfc07] text-[#1b1631]"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Scan QR Code
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("express")}
                className={`flex-1 py-2 text-center text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  paymentMethod === "express"
                    ? "bg-[#9bfc07] text-[#1b1631]"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Express Apps
              </button>
            </div>

            {paymentMethod === "qr" && (
              <div className="space-y-4 text-center">
                <p className="text-[10px] text-zinc-400">
                  Scan this QR code using GPay, PhonePe, Paytm, or BHIM to pay ₹{settings.registrationFee}.
                </p>
                
                {/* Dynamically uploaded settings QR Code support */}
                <div className="mx-auto w-36 h-36 bg-white p-2.5 rounded-xl flex flex-col items-center justify-center relative overflow-hidden border-2 border-[#9bfc07]/20 select-none shadow-md">
                  <img
                    src={settings.qrCodeUrl ? getFullUrl(settings.qrCodeUrl) : `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`upi://pay?pa=${settings.upiId || "6205355760-3@ybl"}&pn=Raft%20Tutor%20Axis&am=${settings.registrationFee || 149}&cu=INR`)}`}
                    className="w-full h-full object-contain"
                    alt="Payment QR Code for UPI Transaction"
                    loading="lazy"
                    width={144}
                    height={144}
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#9bfc07]/10 to-transparent w-full h-full pointer-events-none animate-scan" style={{ animationDuration: '3s', animationIterationCount: 'infinite' }} />
                </div>

                <div className="text-[10px] font-mono text-zinc-400">
                  UPI ID: <span className="text-[#9bfc07] font-bold select-all font-mono">{settings.upiId}</span>
                </div>

                <div className="space-y-2 text-left">
                  <label className="block text-[10px] uppercase font-bold tracking-widest text-zinc-400">UPI Transaction ID (12 digits)<span className="text-red-500 ml-1">*</span></label>
                  <input
                    type="text"
                    maxLength={12}
                    value={upiTxnId}
                    onChange={(e) => setUpiTxnId(e.target.value.replace(/\D/g, ""))}
                    placeholder="e.g. 620535576012"
                    className="w-full bg-[#110d22] border border-[#9bfc07]/20 focus:border-[#9bfc07] outline-none px-3.5 py-2.5 rounded-xl text-xs text-white placeholder-zinc-500 font-mono tracking-widest"
                  />
                </div>

                {screenshotFile ? (
                  <p className="text-[10px] text-emerald-400 font-mono text-left">
                    ✓ Payment screenshot receipt loaded: {screenshotFile.name}
                  </p>
                ) : (
                  <div className="space-y-1.5 text-left">
                    <label className="block text-[10px] uppercase font-bold tracking-widest text-zinc-400">Payment Screenshot Receipt<span className="text-red-500 ml-1">*</span></label>
                    <div className="flex items-center gap-3">
                      <label className="cursor-pointer bg-[#110d22] border border-zinc-800 hover:border-[#9bfc07] px-3.5 py-2 rounded-xl flex items-center gap-1.5 text-[10px] text-zinc-400 font-medium select-none">
                        <Camera className="w-3.5 h-3.5 text-[#9bfc07]" />
                        <span>Upload Screenshot</span>
                        <input type="file" accept="image/*" onChange={handleScreenshotLoad} className="hidden" />
                      </label>
                      <span className="text-[9px] text-zinc-500">Compulsory screenshot receipt</span>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    if (upiTxnId.length !== 12) {
                      alert("Please enter a valid 12-digit UPI Transaction ID.");
                      return;
                    }
                    if (!screenshotFile) {
                      alert("Please upload your UPI payment screenshot receipt.");
                      return;
                    }
                    executeTeacherSubmit(true, upiTxnId);
                  }}
                  disabled={loading}
                  className="w-full py-3.5 bg-[#9bfc07] hover:bg-white text-[#1b1631] font-display font-semibold transition-all rounded-xl text-xs uppercase tracking-wider cursor-pointer shadow-md shadow-[#9bfc07]/10 flex items-center justify-center gap-1.5"
                >
                  {loading ? "Verifying Transaction ID..." : "Submit Verification ID"}
                </button>
              </div>
            )}

            {paymentMethod === "express" && (
              <div className="space-y-4">
                <p className="text-[10px] text-zinc-400 text-center">
                  Select your UPI app for automated checkout.
                </p>

                {isPaying ? (
                  <div className="py-8 text-center flex flex-col items-center justify-center gap-4">
                    <RefreshCw className="w-10 h-10 text-[#9bfc07] animate-spin" />
                    <p className="text-xs font-semibold">Simulating UPI secure gateway connection...</p>
                    <p className="text-[10px] text-zinc-400 font-mono">DO NOT CLOSE THIS MODAL</p>
                  </div>
                ) : paySuccess ? (
                  <div className="py-8 text-center flex flex-col items-center justify-center gap-4">
                    <CheckCircle2 className="w-12 h-12 text-[#9bfc07] animate-bounce" />
                    <p className="text-sm font-semibold text-[#9bfc07]">UPI Payment Authorized Successfully! 🎉</p>
                    <p className="text-[10px] text-zinc-400">Finalizing teacher registration profile...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3.5">
                    <button
                      type="button"
                      onClick={() => handleExpressPay("GPay")}
                      className="py-3 px-4 border border-zinc-800 hover:border-[#9bfc07] bg-[#110d22]/50 hover:bg-[#110d22] rounded-xl text-xs font-semibold flex flex-col items-center gap-2 cursor-pointer transition-all hover:scale-103 text-center"
                    >
                      <span className="text-sm">🔵</span>
                      <span>Google Pay</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExpressPay("PhonePe")}
                      className="py-3 px-4 border border-zinc-800 hover:border-[#9bfc07] bg-[#110d22]/50 hover:bg-[#110d22] rounded-xl text-xs font-semibold flex flex-col items-center gap-2 cursor-pointer transition-all hover:scale-103 text-center"
                    >
                      <span className="text-sm">🟣</span>
                      <span>PhonePe</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExpressPay("Paytm")}
                      className="py-3 px-4 border border-zinc-800 hover:border-[#9bfc07] bg-[#110d22]/50 hover:bg-[#110d22] rounded-xl text-xs font-semibold flex flex-col items-center gap-2 cursor-pointer transition-all hover:scale-103 text-center"
                    >
                      <span className="text-sm">🔷</span>
                      <span>Paytm UPI</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExpressPay("BHIM")}
                      className="py-3 px-4 border border-zinc-800 hover:border-[#9bfc07] bg-[#110d22]/50 hover:bg-[#110d22] rounded-xl text-xs font-semibold flex flex-col items-center gap-2 cursor-pointer transition-all hover:scale-103 text-center"
                    >
                      <span className="text-sm">🇮🇳</span>
                      <span>BHIM UPI</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {!isPaying && !paySuccess && (
              <div className="flex gap-3.5 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="w-full py-3 border border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl text-xs font-semibold uppercase tracking-wider cursor-pointer text-center"
                >
                  Cancel
                </button>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* OTP verification overlay modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-55 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in text-white font-sans">
          <Card variant="gradient" hoverable={false} className="max-w-md w-full p-6 sm:p-8 space-y-6">
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-[#9bfc07]/10 border border-[#9bfc07]/30 rounded-full flex items-center justify-center text-[#9bfc07] mb-3.5">
                <Shield className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="font-display font-bold text-lg leading-tight uppercase tracking-wider">
                Email Verification
              </h3>
              <p className="text-[10px] text-zinc-400 font-mono tracking-widest mt-1">
                ENTER THE OTP SENT TO YOUR INBOX
              </p>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="bg-[#110d22] border border-[#9bfc07]/10 p-4 rounded-xl text-center text-xs space-y-2">
                <p className="text-zinc-400">
                  We've sent a 6-digit verification code to:
                </p>
                <p className="font-bold text-white select-all">{otpEmail}</p>
              </div>

              {otpError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-450 rounded-xl text-[10px] flex items-start gap-2 text-left">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{otpError}</span>
                </div>
              )}

              {otpResendSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-[#9bfc07] rounded-xl text-[10px] flex items-start gap-2 text-left">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>OTP code has been resent successfully.</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-bold tracking-widest text-zinc-400">Verification Code</label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="e.g. 123456"
                  className="w-full text-center bg-[#110d22] border border-[#9bfc07]/20 focus:border-[#9bfc07] outline-none px-3.5 py-3 rounded-xl text-lg font-bold text-white tracking-widest font-mono"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={otpLoading || otpCode.length !== 6}
                className="w-full py-3.5 bg-[#9bfc07] hover:bg-white text-[#1b1631] font-display font-semibold transition-all rounded-xl text-xs uppercase tracking-wider cursor-pointer shadow-md shadow-[#9bfc07]/10 flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {otpLoading ? "Verifying Code..." : "Verify & Complete Signup"}
              </button>

              <div className="flex justify-between items-center text-[10px] px-1 font-mono">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={otpLoading}
                  className="text-[#9bfc07] hover:underline"
                >
                  Resend OTP Code
                </button>
                <button
                  type="button"
                  onClick={() => setShowOtpModal(false)}
                  className="text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </section>
  );
}
