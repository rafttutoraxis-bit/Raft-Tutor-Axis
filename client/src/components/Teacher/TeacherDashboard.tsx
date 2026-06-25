import React, { useState, useEffect } from "react";
import { User, Phone, Mail, MapPin, GraduationCap, Briefcase, BookOpen, Layers, CheckCircle2, AlertCircle, FileText, Camera, Upload, QrCode } from "lucide-react";
import { api } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import { useSettings } from "../../contexts/SettingsContext";
import Card from "../UI/Card";
import Button from "../UI/Button";
import { API_URL } from "../../config";

export default function TeacherDashboard() {
  const { user } = useAuth();
  const { settings } = useSettings();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<{ type: "success" | "error" | null; message: string }>({ type: null, message: "" });
  
  // Payment states
  const [txnId, setTxnId] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState("");
  const [paying, setPaying] = useState(false);

  const getFullUrl = (path: string) => {
    if (!path) return "";
    if (path.startsWith("http") || path.startsWith("data:")) return path;
    return `${API_URL}${path}`;
  };

  const fetchProfile = async () => {
    try {
      const data = await api.get(`/api/teacher/profile`);
      if (data.success && data.profile) {
        setProfile(data.profile);
        setTxnId(data.profile.txnId || "");
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScreenshot(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txnId || txnId.length !== 12) {
      setStatus({ type: "error", message: "Please enter a valid 12-digit UPI Transaction ID." });
      return;
    }
    if (!screenshot && (!profile || !profile.screenshotUrl)) {
      setStatus({ type: "error", message: "Please upload your UPI payment screenshot receipt." });
      return;
    }
    setPaying(true);
    setStatus({ type: null, message: "" });

    try {
      const formData = new FormData();
      formData.append("txnId", txnId);
      formData.append("paymentStatus", "Paid");
      if (screenshot) {
        formData.append("screenshot", screenshot);
      }

      // Re-upload/update details using public signup parameters or custom handler
      // We will make a post payload updating the payment receipt
      // Since our POST /api/teacher-registration supports updating, let's post here:
      const updated = await api.post(`/api/teacher-registration`, formData);
      if (updated.success) {
        setStatus({ type: "success", message: "Receipt submitted successfully! Admin will verify and activate your profile shortly." });
        fetchProfile();
      }
    } catch (err: any) {
      setStatus({ type: "error", message: err.message || "Failed to submit transaction details." });
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-white">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#9bfc07] mb-4" />
        <p className="text-xs font-mono">Syncing Profile Data...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="py-20 text-center text-white max-w-md mx-auto space-y-4">
        <AlertCircle className="w-12 h-12 text-[#9bfc07] mx-auto animate-bounce" />
        <h3 className="font-display font-bold text-lg">No Linked Educator Profile</h3>
        <p className="text-zinc-400 text-xs">
          Please register as a teacher using the public form first, then link your account.
        </p>
      </div>
    );
  }

  const isVerified = profile.paymentStatus === "Verified";
  const isPending = profile.paymentStatus === "Pending";
  const isRejected = profile.paymentStatus === "Rejected";

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-4">
      {/* Verification Warning Alert */}
      {!profile.isApproved && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-2xl text-xs flex items-start gap-3 select-none animate-pulse">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="space-y-1 text-left">
            <h4 className="font-bold uppercase tracking-wider text-[10px]">Verification In Progress</h4>
            <p className="leading-relaxed">
              Your profile is under verification. You cannot receive student requests until approved.
            </p>
          </div>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="p-8 rounded-2xl bg-gradient-to-r from-[#1b1631] via-[#110d22] to-black border border-[#9bfc07]/15 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="flex items-center gap-4">
          <img 
            src={profile.photoUrl ? getFullUrl(profile.photoUrl) : "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150"} 
            className="w-16 h-16 rounded-full object-cover border-2 border-[#9bfc07]/20"
            alt="Teacher"
          />
          <div>
            <h2 className="font-display font-bold text-lg text-white">{profile.name}</h2>
            <p className="text-[10px] font-mono text-zinc-400">{profile.email} | {profile.mobile}</p>
            <span className="text-[9px] uppercase tracking-wider text-[#9bfc07] font-bold">EDUCATOR ID: {profile.id}</span>
          </div>
        </div>

        <div>
          <span className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider inline-block ${
            isVerified 
              ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400" 
              : isRejected 
                ? "bg-rose-500/10 border border-rose-500/30 text-rose-400"
                : "bg-amber-500/10 border border-amber-500/30 text-amber-400"
          }`}>
            Status: {profile.paymentStatus || "Pending"} Verification
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Profile details */}
        <div className="lg:col-span-7 space-y-6">
          <Card variant="glass" hoverable={false}>
            <h3 className="font-display font-bold text-sm uppercase tracking-wider text-[#9bfc07] mb-6 border-b border-[#9bfc07]/10 pb-3">
              Profile Summary
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
              <div className="space-y-1">
                <span className="text-zinc-500 block uppercase font-mono text-[9px] tracking-wider">Qualification</span>
                <span className="text-white font-semibold flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-[#9bfc07]" />
                  {profile.qualification}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-zinc-500 block uppercase font-mono text-[9px] tracking-wider">Experience</span>
                <span className="text-white font-semibold flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-[#9bfc07]" />
                  {profile.experience}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-zinc-500 block uppercase font-mono text-[9px] tracking-wider">Target Subjects</span>
                <span className="text-white font-semibold flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#9bfc07]" />
                  {profile.subjects}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-zinc-500 block uppercase font-mono text-[9px] tracking-wider">Target Classes</span>
                <span className="text-white font-semibold flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#9bfc07]" />
                  {profile.classes}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-zinc-500 block uppercase font-mono text-[9px] tracking-wider">Service Mode</span>
                <span className="text-white font-semibold">{profile.mode} Mode</span>
              </div>

              <div className="space-y-1">
                <span className="text-zinc-500 block uppercase font-mono text-[9px] tracking-wider">Expected Fees / Salary</span>
                <span className="text-white font-semibold">{profile.expectedFees || "N/A"}</span>
              </div>

              <div className="sm:col-span-2 space-y-1">
                <span className="text-zinc-500 block uppercase font-mono text-[9px] tracking-wider">Physical Address</span>
                <span className="text-white flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  {profile.address}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Paygate screen */}
        <div className="lg:col-span-5 space-y-6">
          <Card variant="gradient" hoverable={false}>
            <h3 className="font-display font-bold text-sm uppercase tracking-wider text-[#9bfc07] mb-4 border-b border-[#9bfc07]/10 pb-3">
              UPI Paygate Security
            </h3>

            {status.type && (
              <div className={`p-4 rounded-xl mb-4 flex items-start gap-2.5 border ${
                status.type === "success" 
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                  : "bg-rose-500/10 border-rose-500/30 text-rose-400"
              }`}>
                {status.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
                <span className="text-[10px] font-medium leading-normal">{status.message}</span>
              </div>
            )}

            {isVerified ? (
              <div className="text-center py-6 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                <h4 className="font-display font-semibold text-white">Payment Verified successfully!</h4>
                <p className="text-zinc-400 text-[10px]">
                  Your profile has been vetted and is active on the Raft Tutor Axis platform.
                </p>
              </div>
            ) : (
              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                <div className="bg-[#110d22] border border-[#9bfc07]/10 p-4 rounded-xl space-y-2.5 text-xs text-zinc-400">
                  <div className="flex justify-between">
                    <span>One-Time Fee</span>
                    <span className="text-white font-bold">₹{settings.registrationFee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>UPI ID</span>
                    <span className="text-[#9bfc07] font-bold select-all font-mono">{settings.upiId}</span>
                  </div>
                </div>

                 {/* Display dynamic QR code if uploaded */}
                 <div className="text-center">
                   <p className="text-[10px] text-zinc-500 mb-2">Scan QR below to execute transaction</p>
                   <div className="mx-auto w-32 h-32 bg-white p-2 rounded-xl flex items-center justify-center border border-[#9bfc07]/15">
                     <img
                       src={settings.qrCodeUrl ? getFullUrl(settings.qrCodeUrl) : `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`upi://pay?pa=${settings.upiId || "6205355760-3@ybl"}&pn=Raft%20Tutor%20Axis&am=${settings.registrationFee || 149}&cu=INR`)}`}
                       className="w-full h-full object-contain"
                       alt="Payment QR"
                     />
                   </div>
                 </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase font-bold tracking-widest text-zinc-400">UPI Transaction ID (12 digits) *</label>
                  <input
                    type="text"
                    maxLength={12}
                    value={txnId}
                    onChange={e => setTxnId(e.target.value.replace(/\D/g, ""))}
                    placeholder="e.g. 620535576012"
                    className="w-full bg-[#110d22] border border-[#9bfc07]/15 focus:border-[#9bfc07] outline-none px-3.5 py-2.5 rounded-xl text-xs text-white placeholder-zinc-600 font-mono tracking-widest"
                    required
                  />
                </div>

                 <div className="space-y-1.5">
                   <label className="block text-[10px] uppercase font-bold tracking-widest text-zinc-400">Upload Receipt Screenshot *</label>
                  <div className="flex items-center gap-3">
                    <label className="cursor-pointer bg-[#110d22] border border-[#9bfc07]/15 hover:border-[#9bfc07] px-3.5 py-2.5 rounded-xl flex items-center gap-2 text-[10px] text-zinc-400 font-medium select-none">
                      <Upload className="w-3.5 h-3.5 text-[#9bfc07]" />
                      <span>Choose Image</span>
                      <input type="file" accept="image/*" onChange={handleScreenshotChange} className="hidden" />
                    </label>
                    {screenshotPreview ? (
                      <img src={screenshotPreview} className="w-10 h-10 rounded object-cover border border-[#9bfc07]/20 shrink-0" />
                    ) : (
                      <span className="text-[10px] text-zinc-500">No receipt selected</span>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  loading={paying}
                  className="w-full"
                >
                  Submit Payment Screenshot
                </Button>
              </form>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
