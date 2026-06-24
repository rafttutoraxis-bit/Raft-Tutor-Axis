import React, { useState, useEffect } from "react";
import { Sparkles, MapPin, Phone, User, Calendar, BookOpen, Layers, CheckCircle2, AlertCircle } from "lucide-react";
import { api } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import Card from "../UI/Card";
import Button from "../UI/Button";
import { API_URL } from "../../config";

export default function ParentDashboard() {
  const { user } = useAuth();
  const [inquiry, setInquiry] = useState<any>(null);
  const [assignedTutor, setAssignedTutor] = useState<any>(null);
  const [aiInsights, setAiInsights] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingAI, setLoadingAI] = useState(false);

  const getFullUrl = (path: string) => {
    if (!path) return "";
    if (path.startsWith("http") || path.startsWith("data:")) return path;
    return `${API_URL}${path}`;
  };

  const fetchParentData = async () => {
    try {
      const data = await api.get(`/api/parent/profile`);
      if (data.success && data.profile) {
        setInquiry(data.profile);
        if (data.tutor) {
          setAssignedTutor(data.tutor);
        }
      }
    } catch (err) {
      console.error("Failed to load parent data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParentData();
  }, [user]);

  const triggerAIInsights = async () => {
    if (!inquiry) return;
    setLoadingAI(true);
    setAiInsights("");
    try {
      const data = await api.post("/api/ai/parent-insights", { parentInquiryId: inquiry.id });
      setAiInsights(data.insights || "No insight generated.");
    } catch (err) {
      console.error(err);
      setAiInsights("Failed to retrieve guidance roadmap from Gemini AI. Verify settings.");
    } finally {
      setLoadingAI(false);
    }
  };

  useEffect(() => {
    if (inquiry && !aiInsights) {
      triggerAIInsights();
    }
  }, [inquiry]);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-white">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#9bfc07] mb-4" />
        <p className="text-xs font-mono">Syncing Client Portal...</p>
      </div>
    );
  }

  if (!inquiry) {
    return (
      <div className="py-20 text-center text-white max-w-md mx-auto space-y-4">
        <AlertCircle className="w-12 h-12 text-[#9bfc07] mx-auto animate-bounce" />
        <h3 className="font-display font-bold text-lg">No Active Tuition Inquiry Mapped</h3>
        <p className="text-zinc-400 text-xs">
          Please submit a "Find Tutor" request from the main landing page using your email, and our coordinator team will map it.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-4">
      {/* Overview stats header */}
      <div className="p-8 rounded-2xl bg-gradient-to-r from-[#1b1631] via-[#110d22] to-black border border-[#9bfc07]/15 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="font-display font-bold text-lg text-white">Welcome, {inquiry.name}</h2>
          <p className="text-[10px] text-zinc-400 font-mono">Client Email: {inquiry.email} | Mobile: {inquiry.mobile}</p>
          <span className="text-[9px] uppercase tracking-wider text-[#9bfc07] font-bold">INQUIRY ID: {inquiry.id}</span>
        </div>

        <div>
          <span className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider inline-block ${
            inquiry.status === "Mapped" 
              ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400" 
              : inquiry.status === "Closed"
                ? "bg-zinc-500/10 border border-zinc-500/30 text-zinc-400"
                : "bg-amber-500/10 border border-amber-500/30 text-amber-400"
          }`}>
            Tuition Status: {inquiry.status || "Pending"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Inquiry Parameters */}
        <div className="lg:col-span-6 space-y-6">
          <Card variant="glass" hoverable={false}>
            <h3 className="font-display font-bold text-sm uppercase tracking-wider text-[#9bfc07] mb-6 border-b border-[#9bfc07]/10 pb-3">
              Request Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
              <div className="space-y-1">
                <span className="text-zinc-500 block uppercase font-mono text-[9px] tracking-wider">Class / Grade</span>
                <span className="text-white font-semibold flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#9bfc07]" />
                  {inquiry.studentClass}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-zinc-500 block uppercase font-mono text-[9px] tracking-wider">Academic Board</span>
                <span className="text-white font-semibold flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#9bfc07]" />
                  {inquiry.board}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-zinc-500 block uppercase font-mono text-[9px] tracking-wider">Subjects Mapped</span>
                <span className="text-white font-semibold flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#9bfc07]" />
                  {inquiry.subjects}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-zinc-500 block uppercase font-mono text-[9px] tracking-wider">Delivery Mode</span>
                <span className="text-white font-semibold">{inquiry.mode} Tuition</span>
              </div>

              <div className="sm:col-span-2 space-y-1">
                <span className="text-zinc-500 block uppercase font-mono text-[9px] tracking-wider">Home physical address</span>
                <span className="text-white flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  {inquiry.address}
                </span>
              </div>
            </div>
          </Card>

          {/* Assigned Tutor card */}
          <Card variant={assignedTutor ? "glass" : "solid"} hoverable={false}>
            <h3 className="font-display font-bold text-sm uppercase tracking-wider text-[#9bfc07] mb-6 border-b border-[#9bfc07]/10 pb-3">
              Mapped Tutor Information
            </h3>

            {assignedTutor ? (
              <div className="flex gap-4 items-center">
                <img 
                  src={assignedTutor.photoUrl ? getFullUrl(assignedTutor.photoUrl) : "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150"} 
                  className="w-14 h-14 rounded-full object-cover border border-[#9bfc07]/20"
                  alt="tutor headshot"
                />
                <div className="text-xs space-y-1 flex-1">
                  <h4 className="font-bold text-white text-sm">{assignedTutor.name}</h4>
                  <p className="text-[#9bfc07] font-semibold">{assignedTutor.qualification} | {assignedTutor.experience} Exp</p>
                  <p className="text-zinc-400 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    Call: {assignedTutor.mobile}
                  </p>
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] rounded font-bold uppercase tracking-wider mt-1.5 inline-block">
                    2-Day trial demo assigned
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-zinc-400 space-y-3">
                <div className="h-2 bg-[#9bfc07]/10 rounded-full animate-pulse w-2/3 mx-auto" />
                <p className="text-[10px]">
                  Tutor allocation is in progress. Coordinator desk is vetting best math/science educators in your city.
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* AI Parent Insights */}
        <div className="lg:col-span-6 space-y-6">
          <Card variant="gradient" hoverable={false} className="h-full">
            <div className="flex justify-between items-center border-b border-[#9bfc07]/10 pb-3 mb-6">
              <h3 className="font-display font-bold text-sm uppercase tracking-wider text-[#9bfc07] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#9bfc07] animate-pulse" />
                AI Learning Roadmap
              </h3>
              <Button
                variant="secondary"
                size="sm"
                onClick={triggerAIInsights}
                loading={loadingAI}
              >
                Regenerate
              </Button>
            </div>

            {loadingAI ? (
              <div className="py-12 text-center space-y-3">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#9bfc07] mx-auto" />
                <p className="text-[10px] font-mono text-zinc-400">Gemini model compiling guidance roadmaps...</p>
              </div>
            ) : (
              <div className="text-zinc-300 leading-relaxed space-y-4 font-mono text-[11px] whitespace-pre-wrap bg-black/40 p-4 rounded-xl border border-[#9bfc07]/5 max-h-[380px] overflow-y-auto custom-scrollbar">
                {aiInsights}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
