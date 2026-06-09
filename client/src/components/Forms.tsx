import React, { useState } from "react";
import { User, Phone, Mail, MapPin, GraduationCap, Briefcase, BookOpen, Layers, IndianRupee, FileText, Camera, CheckCircle2, AlertCircle, Sparkles, Building, Send } from "lucide-react";
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
    if (!parentData.name || !parentData.mobile || !parentData.email || !parentData.city) {
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

  const handleTeacherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherData.name || !teacherData.mobile || !teacherData.email || !teacherData.city || !teacherData.qualification) {
      setStatus({ type: "error", message: "Required coordinates missing." });
      return;
    }
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

      const response = await fetch(`${API_URL}/api/teacher-registration`, {
        method: "POST",
        body: formData
      });
      if (response.ok) {
        setStatus({
          type: "success",
          message: "Registered successfully! Our Academic Operations Head (Bhushan Gaurav) will contact you for verification shortly."
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
        if (onNewRegistration) onNewRegistration();
      } else {
        throw new Error();
      }
    } catch {
      setStatus({ type: "error", message: "Failed to reach registration engine." });
    } finally {
      setLoading(false);
    }
  };

  const handleSchoolSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolData.orgName || !schoolData.contactPerson || !schoolData.phone) {
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
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-widest mb-1.5">Upload Biodata / Resume</label>
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
    </section>
  );
}
