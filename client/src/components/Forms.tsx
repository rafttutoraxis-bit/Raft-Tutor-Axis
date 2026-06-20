import React, { useState } from "react";
import { User, Phone, Mail, MapPin, GraduationCap, Briefcase, BookOpen, Layers, IndianRupee, FileText, Camera, CheckCircle2, AlertCircle, Sparkles, Building, Send, QrCode, Shield, RefreshCw } from "lucide-react";
import { API_URL } from "../config";

interface FormsProps {
  lang: "en" | "hi";
  onNewRegistration?: () => void;
}

export default function Forms({ lang, onNewRegistration }: FormsProps) {
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
    message: ""
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
    address: ""
  });

  // School form state
  const [schoolData, setSchoolData] = useState({
    orgName: "",
    contactPerson: "",
    phone: "",
    email: "",
    location: "",
    details: ""
  });

  const [status, setStatus] = useState<{ type: "success" | "error" | null; message: string }>({ type: null, message: "" });
  const [loading, setLoading] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  // Payment gateway states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"qr" | "express">("qr");
  const [upiTxnId, setUpiTxnId] = useState("");
  const [isPaying, setIsPaying] = useState(false);
  const [paySuccess, setPaySuccess] = useState(false);

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

  const handleParentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !parentData.name ||
      !parentData.mobile ||
      !parentData.email ||
      !parentData.city ||
      !parentData.studentClass ||
      !parentData.subjects ||
      !parentData.address
    ) {
      setStatus({ type: "error", message: lang === "en" ? "Please fill all required keys." : "कृपया सभी आवश्यक विवरण भरें।" });
      return;
    }
    setLoading(true);
    setStatus({ type: null, message: "" });

    try {
      const response = await fetch(`${API_URL}/api/parent-registration`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parentData)
      });
      if (response.ok) {
        setStatus({
          type: "success",
          message: lang === "en" 
            ? "Your request has been filed successfully! We sent a simulation email. We will map a tutor in 24 hrs." 
            : "आपका अनुरोध सफलतापूर्वक दर्ज कर लिया गया है! आपको एक पुष्टिकरण ईमेल भी भेजा गया है।"
        });
        setParentData({
          name: "",
          mobile: "",
          email: "",
          city: "",
          studentClass: "",
          board: "CBSE",
          subjects: "",
          mode: "Home",
          address: "",
          message: ""
        });
        if (onNewRegistration) onNewRegistration();
      } else {
        throw new Error();
      }
    } catch {
      setStatus({ type: "error", message: "Failed to connect to primary server. Try again shortly." });
    } finally {
      setLoading(false);
    }
  };

  const handleTeacherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
      !resumeFile
    ) {
      setStatus({ type: "error", message: "Required fields missing. Please fill out all fields and upload your Resume/Biodata." });
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
        const mockTxnId = "TXN" + Math.floor(100000000000 + Math.random() * 900000000000);
        executeTeacherSubmit(true, mockTxnId);
      }, 1500);
    }, 1500);
  };

  const executeTeacherSubmit = async (isPaid: boolean, txnIdToSave: string = "") => {
    setLoading(true);
    setStatus({ type: null, message: "" });

    try {
      const formData = new FormData();
      Object.entries(teacherData).forEach(([key, value]) => {
        if (key !== "resumeUrl" && key !== "photoUrl") {
          formData.append(key, String(value));
        }
      });
      if (resumeFile) formData.append("resume", resumeFile);
      if (photoFile) formData.append("photo", photoFile);

      formData.append("paymentStatus", isPaid ? "Paid" : "Pending");
      formData.append("txnId", txnIdToSave);

      const response = await fetch(`${API_URL}/api/teacher-registration`, {
        method: "POST",
        body: formData
      });
      if (response.ok) {
        setStatus({
          type: "success",
          message: isPaid
            ? `Payment verified! Registered successfully under Transaction ID ${txnIdToSave}. Our Academic Operations Head will contact you for verification shortly.`
            : "Registered successfully (Registration Fee ₹149 Pending)! Our Academic Operations Head will contact you for verification shortly."
        });
        setTeacherData({
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
          address: ""
        });
        setResumeFile(null);
        setPhotoFile(null);
        setUpiTxnId("");
        if (onNewRegistration) onNewRegistration();
      } else {
        throw new Error();
      }
    } catch {
      setStatus({ type: "error", message: "Failed to reach registration engine." });
    } finally {
      setLoading(false);
      setShowPaymentModal(false);
      setPaySuccess(false);
    }
  };

  const handleSchoolSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !schoolData.orgName ||
      !schoolData.contactPerson ||
      !schoolData.phone ||
      !schoolData.email ||
      !schoolData.location ||
      !schoolData.details
    ) {
      setStatus({ type: "error", message: "Organization name and phone details are mandatory." });
      return;
    }
    setLoading(true);
    setStatus({ type: null, message: "" });

    try {
      const response = await fetch(`${API_URL}/api/school-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(schoolData)
      });
      if (response.ok) {
        setStatus({
          type: "success",
          message: "School solutions request registered! Our Institutional Placement Coordinator will map candidates tomorrow."
        });
        setSchoolData({
          orgName: "",
          contactPerson: "",
          phone: "",
          email: "",
          location: "",
          details: ""
        });
        if (onNewRegistration) onNewRegistration();
      } else {
        throw new Error();
      }
    } catch {
      setStatus({ type: "error", message: "Failed to store school solutions catalog." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 bg-[#110d22] transition-colors duration-300" id="inquiry-forms-section">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Navigation Selector */}
        <div className="text-center mb-10">
          <div className="inline-flex bg-brand-logo-dark p-1 rounded-xl shadow-inner border border-[#9bfc07]/15">
            <button
              onClick={() => { setActiveForm("parent"); setStatus({ type: null, message: "" }); }}
              className={`px-5 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                activeForm === "parent"
                  ? "bg-[#9bfc07] text-[#1b1631] shadow-md shadow-[#9bfc07]/20 scale-102 font-bold"
                  : "text-gray-300 hover:text-[#9bfc07]"
              }`}
            >
              👩‍👦 {lang === "en" ? "Find Tutor (Parents)" : "ट्यूटर खोजें (अभिभावक)"}
            </button>
            <button
              onClick={() => { setActiveForm("teacher"); setStatus({ type: null, message: "" }); }}
              className={`px-5 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                activeForm === "teacher"
                  ? "bg-[#9bfc07] text-[#1b1631] shadow-md shadow-[#9bfc07]/20 scale-102 font-bold"
                  : "text-gray-300 hover:text-[#9bfc07]"
              }`}
            >
              👨‍🏫 {lang === "en" ? "Join as Teacher" : "शिक्षक बनें"}
            </button>
            <button
              onClick={() => { setActiveForm("school"); setStatus({ type: null, message: "" }); }}
              className={`px-5 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                activeForm === "school"
                  ? "bg-[#9bfc07] text-[#1b1631] shadow-md shadow-[#9bfc07]/20 scale-102 font-bold"
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
              ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900" 
              : "bg-rose-50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-400 border-rose-200 dark:border-rose-900"
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
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-[#9bfc07]" />
                <h3 className="font-display font-semibold text-lg text-white">
                  {lang === "en" ? "Home Tuition Request Wizard" : "ट्यूटर अनुरोध केंद्र"}
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-widest mb-1.5">{lang === "en" ? "Parent Name" : "अभिभावक का नाम"} <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={parentData.name}
                      onChange={e => setParentData({ ...parentData, name: e.target.value })}
                      placeholder="e.g. Ramesh Singh"
                      className="w-full bg-white dark:bg-[#0c121a] text-xs text-gray-800 dark:text-white pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-850 outline-none focus:border-brand-primary transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-widest mb-1.5">{lang === "en" ? "Mobile Number" : "मोबाइल नंबर"} <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      value={parentData.mobile}
                      onChange={e => setParentData({ ...parentData, mobile: e.target.value })}
                      placeholder="10 digit number"
                      className="w-full bg-white dark:bg-[#0c121a] text-xs text-gray-800 dark:text-white pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-850 outline-none focus:border-brand-primary transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-widest mb-1.5">{lang === "en" ? "Email Address" : "ईमेल खाता"} <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={parentData.email}
                      onChange={e => setParentData({ ...parentData, email: e.target.value })}
                      placeholder="e.g. parent@gmail.com"
                      className="w-full bg-white dark:bg-[#0c121a] text-xs text-gray-800 dark:text-white pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-850 outline-none focus:border-brand-primary transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-widest mb-1.5">{lang === "en" ? "City Location" : "शहर का नाम"} <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={parentData.city}
                      onChange={e => setParentData({ ...parentData, city: e.target.value })}
                      placeholder="e.g. Vadodara or Surat"
                      className="w-full bg-white dark:bg-[#0c121a] text-xs text-gray-800 dark:text-white pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-850 outline-none focus:border-brand-primary transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-widest mb-1.5">{lang === "en" ? "Student Class" : "कक्षा"} <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Layers className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={parentData.studentClass}
                      onChange={e => setParentData({ ...parentData, studentClass: e.target.value })}
                      placeholder="e.g. Class 10th or Class 12th"
                      className="w-full bg-white dark:bg-[#0c121a] text-xs text-gray-800 dark:text-white pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-850 outline-none focus:border-brand-primary transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-widest mb-1.5">{lang === "en" ? "Educational Board" : "बोर्ड"}</label>
                  <select
                    value={parentData.board}
                    onChange={e => setParentData({ ...parentData, board: e.target.value as any })}
                    className="w-full bg-white dark:bg-[#0c121a] text-xs text-gray-800 dark:text-white px-3.5 py-3 rounded-xl border border-gray-200 dark:border-gray-850 outline-none focus:border-brand-primary transition-all"
                  >
                    <option value="CBSE">CBSE Board</option>
                    <option value="ICSE">ICSE Board</option>
                    <option value="State Board">State Board (Bihar & Others)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-widest mb-1.5">{lang === "en" ? "Subjects Required" : "आवश्यक विषय"} <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <BookOpen className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={parentData.subjects}
                      onChange={e => setParentData({ ...parentData, subjects: e.target.value })}
                      placeholder="e.g. Physics, Chemistry, Maths"
                      className="w-full bg-white dark:bg-[#0c121a] text-xs text-gray-800 dark:text-white pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-850 outline-none focus:border-brand-primary transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-widest mb-1.5">{lang === "en" ? "Tuition Mode" : "ट्यूशन मोड"}</label>
                  <select
                    value={parentData.mode}
                    onChange={e => setParentData({ ...parentData, mode: e.target.value as any })}
                    className="w-full bg-white dark:bg-[#0c121a] text-xs text-gray-800 dark:text-white px-3.5 py-3 rounded-xl border border-gray-200 dark:border-gray-850 outline-none focus:border-brand-primary transition-all"
                  >
                    <option value="Home">{lang === "en" ? "Home Tuition (Offline)" : "होम ट्यूशन (ऑफलाइन)"}</option>
                    <option value="Online">{lang === "en" ? "Online Live Class" : "ऑनलाइन लाइव क्लास"}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-widest mb-1.5">{lang === "en" ? "Full Physical Address" : "पूरा पता"} <span className="text-red-500">*</span></label>
                <textarea
                  value={parentData.address}
                  onChange={e => setParentData({ ...parentData, address: e.target.value })}
                  placeholder="e.g. Vrindavan Chokdi near DMart, House No. 25, Vadodara"
                  className="w-full bg-white dark:bg-[#0c121a] text-xs text-gray-800 dark:text-white p-3.5 rounded-xl border border-gray-200 dark:border-gray-850 outline-none focus:border-brand-primary transition-all h-20 resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-widest mb-1.5">{lang === "en" ? "Additional Instruction / Messages" : "अन्य विवरण"}</label>
                <textarea
                  value={parentData.message}
                  onChange={e => setParentData({ ...parentData, message: e.target.value })}
                  placeholder="Tell us student weak areas or teacher timing preferences..."
                  className="w-full bg-white dark:bg-[#0c121a] text-xs text-gray-800 dark:text-white p-3.5 rounded-xl border border-gray-200 dark:border-gray-850 outline-none focus:border-brand-primary transition-all h-20 resize-none"
                />
              </div>

              <div className="flex items-center gap-1.5 p-3.5 bg-[#9bfc07]/10 rounded-xl border border-[#9bfc07]/20 text-xs text-[#9bfc07]">
                <Sparkles className="w-4 h-4 animate-pulse shrink-0" />
                <span><strong>2 DAYS FREE DEMO:</strong> We will map a verified tutor for a two-day trial completely free. No advance fees required!</span>
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
            <form onSubmit={handleTeacherSubmit} className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap className="w-5 h-5 text-brand-primary" />
                <h3 className="font-display font-semibold text-lg text-gray-900 dark:text-white">
                  Join India's Vetted Educator Network
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-widest mb-1.5">Teacher Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={teacherData.name}
                      onChange={e => setTeacherData({ ...teacherData, name: e.target.value })}
                      placeholder="e.g. Dr. PK Singh"
                      className="w-full bg-white dark:bg-[#0c121a] text-xs text-gray-800 dark:text-white pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-850 outline-none focus:border-brand-primary"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-widest mb-1.5">Contact Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      value={teacherData.mobile}
                      onChange={e => setTeacherData({ ...teacherData, mobile: e.target.value })}
                      placeholder="e.g. 98765 43210"
                      className="w-full bg-white dark:bg-[#0c121a] text-xs text-gray-800 dark:text-white pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-850 outline-none focus:border-brand-primary"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-widest mb-1.5">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={teacherData.email}
                      onChange={e => setTeacherData({ ...teacherData, email: e.target.value })}
                      placeholder="email@domain.com"
                      className="w-full bg-white dark:bg-[#0c121a] text-xs text-gray-800 dark:text-white pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-850 outline-none focus:border-brand-primary"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-widest mb-1.5">Gender Selection</label>
                  <select
                    value={teacherData.gender}
                    onChange={e => setTeacherData({ ...teacherData, gender: e.target.value as any })}
                    className="w-full bg-white dark:bg-[#0c121a] text-xs text-gray-800 dark:text-white px-3.5 py-3 rounded-xl border border-gray-200 dark:border-gray-850 outline-none focus:border-brand-primary"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-widest mb-1.5">Highest Qualification *</label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={teacherData.qualification}
                      onChange={e => setTeacherData({ ...teacherData, qualification: e.target.value })}
                      placeholder="e.g. M.Sc Chemistry or B.Ed / B.Tech"
                      className="w-full bg-white dark:bg-[#0c121a] text-xs text-gray-800 dark:text-white pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-850 outline-none focus:border-brand-primary"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-widest mb-1.5">Teaching Experience *</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={teacherData.experience}
                      onChange={e => setTeacherData({ ...teacherData, experience: e.target.value })}
                      placeholder="e.g. 5 Years / 3 Years in coaching"
                      className="w-full bg-white dark:bg-[#0c121a] text-xs text-gray-800 dark:text-white pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-850 outline-none focus:border-brand-primary"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-widest mb-1.5">City Availability *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={teacherData.city}
                      onChange={e => setTeacherData({ ...teacherData, city: e.target.value })}
                      placeholder="e.g. Vadodara, Surat, etc."
                      className="w-full bg-white dark:bg-[#0c121a] text-xs text-gray-800 dark:text-white pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-850 outline-none focus:border-brand-primary"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-widest mb-1.5">Expected Monthly Fees / Salary</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={teacherData.expectedFees}
                      onChange={e => setTeacherData({ ...teacherData, expectedFees: e.target.value })}
                      placeholder="e.g. 5,000 / month"
                      className="w-full bg-white dark:bg-[#0c121a] text-xs text-gray-800 dark:text-white pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-850 outline-none focus:border-brand-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-widest mb-1.5">Specialist Subjects *</label>
                  <div className="relative">
                    <BookOpen className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={teacherData.subjects}
                      onChange={e => setTeacherData({ ...teacherData, subjects: e.target.value })}
                      placeholder="e.g. Mathematics, JEE Physics"
                      className="w-full bg-white dark:bg-[#0c121a] text-xs text-gray-800 dark:text-white pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-850 outline-none focus:border-brand-primary"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-widest mb-1.5">Classes you teach *</label>
                  <div className="relative">
                    <Layers className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={teacherData.classes}
                      onChange={e => setTeacherData({ ...teacherData, classes: e.target.value })}
                      placeholder="e.g. Class 9 to 12, PGT level"
                      className="w-full bg-white dark:bg-[#0c121a] text-xs text-gray-800 dark:text-white pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-850 outline-none focus:border-brand-primary"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-widest mb-1.5">Preferred Mode</label>
                  <select
                    value={teacherData.mode}
                    onChange={e => setTeacherData({ ...teacherData, mode: e.target.value as any })}
                    className="w-full bg-white dark:bg-[#0c121a] text-xs text-gray-800 dark:text-white px-3.5 py-3 rounded-xl border border-gray-200 dark:border-gray-850 outline-none focus:border-brand-primary"
                  >
                    <option value="Home">Home Tuition (Physical)</option>
                    <option value="Online">Online Sessions only</option>
                    <option value="Both">Both Modes Comfortable</option>
                  </select>
                </div>

                <div>
                  {/* CV Loader */}
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-widest mb-1.5">Upload Biodata / Resume *</label>
                  <div className="flex items-center gap-3">
                    <label className="cursor-pointer bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:border-brand-primary px-3 py-2.5 rounded-lg flex items-center gap-1.5 text-[11px] text-gray-600 dark:text-gray-300 font-medium select-none">
                      <FileText className="w-3.5 h-3.5 text-brand-primary" />
                      <span>Choose PDF/DOC</span>
                      <input type="file" accept=".pdf,.doc,.docx" onChange={handleResumeLoad} className="hidden" />
                    </label>
                    <span className="text-[10px] text-gray-500 truncate max-w-[120px]">
                      {teacherData.resumeUrl ? "✓ Loaded Successfully" : "No file selected"}
                    </span>
                  </div>
                </div>

                <div>
                  {/* Photo Loader */}
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-widest mb-1.5">Professional Headshot</label>
                  <div className="flex items-center gap-3">
                    <label className="cursor-pointer bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:border-brand-primary px-3 py-2.5 rounded-lg flex items-center gap-1.5 text-[11px] text-gray-600 dark:text-gray-300 font-medium select-none">
                      <Camera className="w-3.5 h-3.5 text-brand-primary" />
                      <span>Choose JPEG/PNG</span>
                      <input type="file" accept="image/*" onChange={handlePhotoLoad} className="hidden" />
                    </label>
                    {teacherData.photoUrl ? (
                      <img src={teacherData.photoUrl} className="w-9 h-9 rounded-full object-cover border border-gray-200 shrink-0" />
                    ) : (
                      <span className="text-[10px] text-gray-500">No image loaded</span>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-widest mb-1.5">Address *</label>
                <textarea
                  value={teacherData.address}
                  onChange={e => setTeacherData({ ...teacherData, address: e.target.value })}
                  placeholder="Street name, Sector, Landmark, Town details"
                  className="w-full bg-white dark:bg-[#0c121a] text-xs text-gray-800 dark:text-white p-3.5 rounded-xl border border-gray-200 dark:border-gray-850 outline-none focus:border-brand-primary h-20 resize-none"
                  required
                />
              </div>

              <div className="flex items-center gap-1.5 p-3.5 bg-[#9bfc07]/10 rounded-xl border border-[#9bfc07]/20 text-xs text-[#9bfc07]">
                <Sparkles className="w-4 h-4 animate-pulse shrink-0" />
                <span>
                  <strong>{lang === "en" ? "REGISTRATION FEE:" : "पंजीकरण शुल्क:"}</strong>{" "}
                  {lang === "en" 
                    ? "A one-time verification and registration fee of ₹149 applies to join India's Vetted Educator Network." 
                    : "शिक्षक नेटवर्क में शामिल होने के लिए ₹149 का एकमुश्त सत्यापन और पंजीकरण शुल्क लागू होता है।"}
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
            <form onSubmit={handleSchoolSubmit} className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Building className="w-5 h-5 text-[#9bfc07]" />
                <h3 className="font-display font-semibold text-lg text-white">
                  School & Coaching Institute Faculty Inquiries
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-widest mb-1.5">Organization / School Name *</label>
                  <div className="relative">
                    <Building className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={schoolData.orgName}
                      onChange={e => setSchoolData({ ...schoolData, orgName: e.target.value })}
                      placeholder="e.g. Gyan Niketan Senior School"
                      className="w-full bg-white dark:bg-[#0c121a] text-xs text-gray-800 dark:text-white pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-850 outline-none focus:border-brand-primary"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-widest mb-1.5">Contact Person *</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={schoolData.contactPerson}
                      onChange={e => setSchoolData({ ...schoolData, contactPerson: e.target.value })}
                      placeholder="e.g. Ramesh Prasad (Principal)"
                      className="w-full bg-white dark:bg-[#0c121a] text-xs text-gray-800 dark:text-white pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-850 outline-none focus:border-brand-primary"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-widest mb-1.5">Inquiry Phone *</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      value={schoolData.phone}
                      onChange={e => setSchoolData({ ...schoolData, phone: e.target.value })}
                      placeholder="Contact number"
                      className="w-full bg-white dark:bg-[#0c121a] text-xs text-gray-800 dark:text-white pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-850 outline-none focus:border-brand-primary"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-widest mb-1.5">Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={schoolData.email}
                      onChange={e => setSchoolData({ ...schoolData, email: e.target.value })}
                      placeholder="e.g. contact@school.edu"
                      className="w-full bg-white dark:bg-[#0c121a] text-xs text-gray-800 dark:text-white pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-850 outline-none focus:border-brand-primary"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-widest mb-1.5">Physical Location / Town *</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={schoolData.location}
                    onChange={e => setSchoolData({ ...schoolData, location: e.target.value })}
                    placeholder="e.g. Vadodara, Gujarat"
                    className="w-full bg-white dark:bg-[#0c121a] text-xs text-gray-800 dark:text-white pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-850 outline-none focus:border-brand-primary"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-widest mb-1.5">Faculty Requirement Specifications *</label>
                <textarea
                  value={schoolData.details}
                  onChange={e => setSchoolData({ ...schoolData, details: e.target.value })}
                  placeholder="Identify PGT/TGT subject vacancies, salary slabs, teacher eligibility criteria..."
                  className="w-full bg-white dark:bg-[#0c121a] text-xs text-gray-800 dark:text-white p-3.5 rounded-xl border border-gray-200 dark:border-gray-850 outline-none focus:border-brand-primary h-24 resize-none"
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
          <aside className="lg:col-span-4 space-y-6 flex flex-col">
            
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
                +91 62053 55760
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-[#1b1631] border border-[#9bfc07]/25 max-w-md w-full rounded-2xl shadow-2xl overflow-hidden relative p-6 sm:p-8 text-white space-y-6">
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

            <div className="bg-[#110d22] border border-[#9bfc07]/10 p-4 rounded-xl space-y-2">
              <div className="flex justify-between text-xs text-zinc-400">
                <span>Account Tier</span>
                <span className="font-bold text-white">Vetted Network Member</span>
              </div>
              <div className="flex justify-between text-xs text-zinc-400">
                <span>Verification & Registration Fee</span>
                <span className="font-bold text-white">₹149.00</span>
              </div>
              <div className="border-t border-[#9bfc07]/10 pt-2 flex justify-between text-sm font-semibold">
                <span className="text-[#9bfc07]">Total Due Amount</span>
                <span className="text-[#9bfc07]">₹149.00</span>
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
                  Scan this QR code using any UPI app (GPay, PhonePe, Paytm, BHIM) to make the ₹149 payment.
                </p>
                
                {/* Simulated QR Code CSS mockup */}
                <div className="mx-auto w-36 h-36 bg-white p-2.5 rounded-xl flex flex-col items-center justify-center relative overflow-hidden border-2 border-[#9bfc07]/20 select-none shadow-md">
                  <div className="w-full h-full bg-[#110d22] rounded flex flex-col items-center justify-center text-[10px] font-mono text-[#9bfc07] font-bold gap-1 border border-[#9bfc07]/30">
                    <QrCode className="w-10 h-10 stroke-1" />
                    <span>RTA-PAY-₹149</span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#9bfc07]/10 to-transparent w-full h-full pointer-events-none animate-scan" style={{ animationDuration: '3s', animationIterationCount: 'infinite' }} />
                </div>

                <div className="text-[10px] font-mono text-zinc-400">
                  UPI ID: <span className="text-[#9bfc07] font-bold select-all font-mono">rafttutoraxis@upi</span>
                </div>

                <div className="space-y-2 text-left">
                  <label className="block text-[10px] uppercase font-bold tracking-widest text-zinc-400">UPI Transaction ID (12 digits) *</label>
                  <input
                    type="text"
                    maxLength={12}
                    value={upiTxnId}
                    onChange={(e) => setUpiTxnId(e.target.value.replace(/\D/g, ""))}
                    placeholder="e.g. 620535576012"
                    className="w-full bg-[#110d22] border border-[#9bfc07]/20 focus:border-[#9bfc07] outline-none px-3.5 py-2.5 rounded-xl text-xs text-white placeholder-zinc-500 font-mono tracking-widest"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (upiTxnId.length !== 12) {
                      alert("Please enter a valid 12-digit UPI Transaction ID.");
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
                  Select your UPI app for instant automated checkout and approval.
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
                      className="py-3 px-4 border border-zinc-700 hover:border-[#9bfc07] bg-[#110d22]/50 hover:bg-[#110d22] rounded-xl text-xs font-semibold flex flex-col items-center gap-2 cursor-pointer transition-all hover:scale-103 text-center"
                    >
                      <span className="text-sm">🔵</span>
                      <span>Google Pay</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExpressPay("PhonePe")}
                      className="py-3 px-4 border border-zinc-700 hover:border-[#9bfc07] bg-[#110d22]/50 hover:bg-[#110d22] rounded-xl text-xs font-semibold flex flex-col items-center gap-2 cursor-pointer transition-all hover:scale-103 text-center"
                    >
                      <span className="text-sm">🟣</span>
                      <span>PhonePe</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExpressPay("Paytm")}
                      className="py-3 px-4 border border-zinc-700 hover:border-[#9bfc07] bg-[#110d22]/50 hover:bg-[#110d22] rounded-xl text-xs font-semibold flex flex-col items-center gap-2 cursor-pointer transition-all hover:scale-103 text-center"
                    >
                      <span className="text-sm">🔷</span>
                      <span>Paytm UPI</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExpressPay("BHIM")}
                      className="py-3 px-4 border border-zinc-700 hover:border-[#9bfc07] bg-[#110d22]/50 hover:bg-[#110d22] rounded-xl text-xs font-semibold flex flex-col items-center gap-2 cursor-pointer transition-all hover:scale-103 text-center"
                    >
                      <span className="text-sm">🇮🇳</span>
                      <span>BHIM UPI</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {!isPaying && !paySuccess && (
              <div className="flex gap-3.5 pt-3 border-t border-[#9bfc07]/10">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 py-3 border border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl text-xs font-semibold uppercase tracking-wider cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => executeTeacherSubmit(false)}
                  className="flex-1 py-3 bg-zinc-850 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-300 rounded-xl text-[10px] font-bold uppercase tracking-wider cursor-pointer text-center"
                  title="Registers your profile but keeps verification status pending payment"
                >
                  Pay Later
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </section>
  );
}
