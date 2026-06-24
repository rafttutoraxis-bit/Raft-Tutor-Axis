import React, { useState, useEffect } from "react";
import { Sparkles, MapPin, Building, GraduationCap, Phone, Plus, List, Search, Award, CheckCircle2 } from "lucide-react";
import { api } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import Card from "../UI/Card";
import Button from "../UI/Button";
import Table from "../UI/Table";
import { API_URL } from "../../config";

export default function SchoolDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [vacancies, setVacancies] = useState<any[]>([]);
  const [matchingTutors, setMatchingTutors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"list" | "post">("list");
  const [status, setStatus] = useState<{ type: "success" | "error" | null; message: string }>({ type: null, message: "" });

  const getFullUrl = (path: string) => {
    if (!path) return "";
    if (path.startsWith("http") || path.startsWith("data:")) return path;
    return `${API_URL}${path}`;
  };
  
  // Vacancy Form state
  const [vacancyForm, setVacancyForm] = useState({
    title: "",
    subject: "",
    board: "CBSE",
    city: "",
    qualification: "",
    experience: "",
    salary: "",
    description: ""
  });
  const [posting, setPosting] = useState(false);

  // AI Insights states
  const [aiReport, setAiReport] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);
  const [selectedVacancyId, setSelectedVacancyId] = useState("");

  const fetchData = async () => {
    try {
      const data = await api.get(`/api/school/profile`);
      if (data.success && data.profile) {
        const schoolProf = data.profile;
        setProfile(schoolProf);
        
        // Fetch school specific vacancies
        const vacResponse = await api.get(`/api/vacancies?city=${schoolProf.location}`);
        if (vacResponse.success) {
          const schoolVacancies = vacResponse.vacancies?.filter((v: any) => v.schoolId === schoolProf.id) || [];
          setVacancies(schoolVacancies);
          
          if (schoolVacancies.length > 0) {
            setSelectedVacancyId(schoolVacancies[0].id);
          }
        }

        // Get matching teachers in the same city securely
        const tutorsResponse = await api.get(`/api/school/matching-tutors`);
        if (tutorsResponse.success) {
          setMatchingTutors(tutorsResponse.tutors || []);
        }
      }
    } catch (err) {
      console.error("Failed to load school workspace:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handlePostVacancy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setPosting(true);
    setStatus({ type: null, message: "" });

    try {
      const payload = {
        ...vacancyForm,
        schoolId: profile.id,
        schoolName: profile.orgName,
      };

      const response = await api.post("/api/vacancies", payload);
      if (response.success) {
        setStatus({ type: "success", message: "Vacancy published successfully! Mapped candidates will be updated." });
        setVacancyForm({
          title: "",
          subject: "",
          board: "CBSE",
          city: profile.location || "",
          qualification: "",
          experience: "",
          salary: "",
          description: ""
        });
        setActiveTab("list");
        fetchData();
      }
    } catch (err: any) {
      setStatus({ type: "error", message: err.message || "Failed to post teaching role." });
    } finally {
      setPosting(false);
    }
  };

  const getHiringInsights = async (vId: string) => {
    if (!vId) return;
    setLoadingAI(true);
    setAiReport("");
    try {
      const data = await api.post("/api/ai/hiring-insights", { vacancyId: vId });
      setAiReport(data.insights || "No report compiled.");
    } catch (err) {
      console.error(err);
      setAiReport("Failed to compile strategy report using Gemini.");
    } finally {
      setLoadingAI(false);
    }
  };

  useEffect(() => {
    if (selectedVacancyId) {
      getHiringInsights(selectedVacancyId);
    }
  }, [selectedVacancyId]);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-white">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#9bfc07] mb-4" />
        <p className="text-xs font-mono">Syncing Partner Workspace...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="py-20 text-center text-white max-w-md mx-auto space-y-4">
        <Building className="w-12 h-12 text-[#9bfc07] mx-auto animate-bounce" />
        <h3 className="font-display font-bold text-lg">No Linked Institution Profile</h3>
        <p className="text-zinc-400 text-xs">
          Please submit a "School Solutions" request from the main landing page using your email, and our coordinator desk will map it.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4">
      {/* Welcome Banner */}
      <div className="p-8 rounded-2xl bg-gradient-to-r from-[#1b1631] via-[#110d22] to-black border border-[#9bfc07]/15 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="font-display font-bold text-lg text-white uppercase tracking-wider">{profile.orgName}</h2>
          <p className="text-[10px] text-zinc-400 font-mono flex items-center gap-1 mt-1">
            <MapPin className="w-3.5 h-3.5 text-red-500" />
            Location: {profile.location} | Representative: {profile.contactPerson} ({profile.phone})
          </p>
        </div>

        <div className="flex bg-[#110d22] p-1 rounded-xl border border-[#9bfc07]/15">
          <button
            onClick={() => setActiveTab("list")}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "list"
                ? "bg-[#9bfc07] text-[#1b1631]"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <List className="w-3.5 h-3.5 inline mr-1" />
            Vacancies ({vacancies.length})
          </button>
          <button
            onClick={() => {
              setActiveTab("post");
              setVacancyForm(prev => ({ ...prev, city: profile.location }));
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "post"
                ? "bg-[#9bfc07] text-[#1b1631]"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Plus className="w-3.5 h-3.5 inline mr-1" />
            Publish Role
          </button>
        </div>
      </div>

      {status.type && (
        <div className={`p-4 rounded-xl flex items-start gap-2.5 border ${
          status.type === "success" 
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
            : "bg-rose-500/10 border-rose-500/30 text-rose-400"
        }`}>
          {status.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> : <Plus className="w-4 h-4 shrink-0 mt-0.5" />}
          <span className="text-[10px] font-medium leading-normal">{status.message}</span>
        </div>
      )}

      {activeTab === "list" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Vacancy Roster */}
          <div className="lg:col-span-8 space-y-6">
            <Card variant="glass" hoverable={false}>
              <h3 className="font-display font-bold text-sm uppercase tracking-wider text-[#9bfc07] mb-6 border-b border-[#9bfc07]/10 pb-3">
                Published Faculty Openings
              </h3>

              {vacancies.length === 0 ? (
                <div className="py-12 text-center text-zinc-500 space-y-2">
                  <p className="text-xs font-mono">No active vacancies published.</p>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("post")}>
                    Publish First Vacancy
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {vacancies.map(vac => (
                    <div 
                      key={vac.id}
                      onClick={() => setSelectedVacancyId(vac.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        selectedVacancyId === vac.id 
                          ? "bg-[#9bfc07]/5 border-[#9bfc07]/30 shadow-md" 
                          : "bg-[#110d22]/50 border-zinc-800 hover:border-[#9bfc07]/20"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-3 flex-wrap">
                        <div>
                          <h4 className="font-bold text-white text-xs">{vac.title}</h4>
                          <p className="text-[10px] text-zinc-400 mt-0.5">{vac.subject} | Board: {vac.board} | Exp: {vac.experience}</p>
                          <p className="text-[10px] text-zinc-500 mt-1">{vac.description}</p>
                        </div>
                        <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[9px] rounded font-mono font-bold uppercase tracking-wider">
                          {vac.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Candidates Matchboard */}
            <Card variant="glass" hoverable={false}>
              <h3 className="font-display font-bold text-sm uppercase tracking-wider text-[#9bfc07] mb-6 border-b border-[#9bfc07]/10 pb-3">
                Matching Local Educators
              </h3>

              <Table
                columns={[
                  {
                    header: "Tutor Profile",
                    render: (t: any) => (
                      <div className="flex items-center gap-3">
                        <img src={t.photoUrl ? getFullUrl(t.photoUrl) : "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150"} className="w-9 h-9 rounded-full object-cover shrink-0" alt="tutor" />
                        <div>
                          <p className="font-bold text-white leading-none mb-1">{t.name}</p>
                          <span className="text-[9px] font-mono text-zinc-400">{t.email} | {t.mobile}</span>
                        </div>
                      </div>
                    )
                  },
                  {
                    header: "City / Mode",
                    render: (t: any) => (
                      <div>
                        <p className="font-semibold text-white leading-none mb-1">{t.city}</p>
                        <span className="text-[9px] font-mono text-zinc-400">{t.mode} Comfort</span>
                      </div>
                    )
                  },
                  {
                    header: "Qualification / Experience",
                    render: (t: any) => (
                      <div>
                        <p className="font-semibold text-white leading-none mb-1">{t.qualification}</p>
                        <span className="text-[9px] font-mono text-[#9bfc07]">{t.experience} Experience</span>
                      </div>
                    )
                  },
                  {
                    header: "Subjects",
                    render: (t: any) => <span className="text-emerald-400 font-semibold">{t.subjects}</span>
                  }
                ]}
                data={matchingTutors}
                pageSize={5}
                emptyMessage="No matching verified tutors found in your location."
              />
            </Card>
          </div>

          {/* Hiring advice */}
          <div className="lg:col-span-4 space-y-6">
            <Card variant="gradient" hoverable={false} className="h-full">
              <h3 className="font-display font-bold text-sm uppercase tracking-wider text-[#9bfc07] flex items-center gap-2 mb-6 border-b border-[#9bfc07]/10 pb-3">
                <Sparkles className="w-4 h-4 text-[#9bfc07] animate-pulse" />
                AI Sourcing Strategy
              </h3>

              {selectedVacancyId ? (
                loadingAI ? (
                  <div className="py-12 text-center space-y-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#9bfc07] mx-auto" />
                    <p className="text-[10px] font-mono text-zinc-400">Gemini model scoring credentials...</p>
                  </div>
                ) : (
                  <div className="text-zinc-300 leading-relaxed space-y-4 font-mono text-[11px] whitespace-pre-wrap bg-black/40 p-4 rounded-xl border border-[#9bfc07]/5">
                    {aiReport}
                  </div>
                )
              ) : (
                <p className="text-zinc-500 text-[10px] text-center py-10 font-mono">
                  Select a vacancy from the left panel to fetch AI recruitment strategies.
                </p>
              )}
            </Card>
          </div>
        </div>
      )}

      {activeTab === "post" && (
        <Card variant="glass" hoverable={false} className="max-w-3xl mx-auto">
          <h3 className="font-display font-bold text-sm uppercase tracking-wider text-[#9bfc07] mb-6 border-b border-[#9bfc07]/10 pb-3">
            Publish New Teaching Vacancy
          </h3>

          <form onSubmit={handlePostVacancy} className="space-y-6 text-white text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-bold tracking-widest text-zinc-400">Vacancy Title *</label>
                <div className="relative">
                  <GraduationCap className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={vacancyForm.title}
                    onChange={e => setVacancyForm({ ...vacancyForm, title: e.target.value })}
                    placeholder="e.g. Senior PGT Chemistry Lecturer"
                    className="w-full bg-[#110d22] pl-10 pr-4 py-3 rounded-xl border border-[#9bfc07]/15 focus:border-[#9bfc07] outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-bold tracking-widest text-zinc-400">Subject Specialization *</label>
                <div className="relative">
                  <Building className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={vacancyForm.subject}
                    onChange={e => setVacancyForm({ ...vacancyForm, subject: e.target.value })}
                    placeholder="e.g. Chemistry"
                    className="w-full bg-[#110d22] pl-10 pr-4 py-3 rounded-xl border border-[#9bfc07]/15 focus:border-[#9bfc07] outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-bold tracking-widest text-zinc-400">Affiliated Board</label>
                <select
                  value={vacancyForm.board}
                  onChange={e => setVacancyForm({ ...vacancyForm, board: e.target.value as any })}
                  className="w-full bg-[#110d22] px-3.5 py-3 rounded-xl border border-[#9bfc07]/15 focus:border-[#9bfc07] outline-none"
                >
                  <option value="CBSE">CBSE Board</option>
                  <option value="ICSE">ICSE Board</option>
                  <option value="State Board">State Board</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-bold tracking-widest text-zinc-400">Target Location City *</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={vacancyForm.city}
                    onChange={e => setVacancyForm({ ...vacancyForm, city: e.target.value })}
                    placeholder="e.g. Vadodara"
                    className="w-full bg-[#110d22] pl-10 pr-4 py-3 rounded-xl border border-[#9bfc07]/15 focus:border-[#9bfc07] outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-bold tracking-widest text-zinc-400">Minimum Qualification *</label>
                <input
                  type="text"
                  value={vacancyForm.qualification}
                  onChange={e => setVacancyForm({ ...vacancyForm, qualification: e.target.value })}
                  placeholder="e.g. B.Tech / M.Sc B.Ed"
                  className="w-full bg-[#110d22] px-3.5 py-3 rounded-xl border border-[#9bfc07]/15 focus:border-[#9bfc07] outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-bold tracking-widest text-zinc-400">Required Experience *</label>
                <input
                  type="text"
                  value={vacancyForm.experience}
                  onChange={e => setVacancyForm({ ...vacancyForm, experience: e.target.value })}
                  placeholder="e.g. 3+ Years in CBSE High School"
                  className="w-full bg-[#110d22] px-3.5 py-3 rounded-xl border border-[#9bfc07]/15 focus:border-[#9bfc07] outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="block text-[10px] uppercase font-bold tracking-widest text-zinc-400">Offered Monthly Salary Slab</label>
                <input
                  type="text"
                  value={vacancyForm.salary}
                  onChange={e => setVacancyForm({ ...vacancyForm, salary: e.target.value })}
                  placeholder="e.g. ₹25,000 - ₹35,000 / month"
                  className="w-full bg-[#110d22] px-3.5 py-3 rounded-xl border border-[#9bfc07]/15 focus:border-[#9bfc07] outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] uppercase font-bold tracking-widest text-zinc-400">Job Description details</label>
              <textarea
                value={vacancyForm.description}
                onChange={e => setVacancyForm({ ...vacancyForm, description: e.target.value })}
                placeholder="List syllabus requirements, working hours, and extra roles..."
                className="w-full bg-[#110d22] p-3.5 rounded-xl border border-[#9bfc07]/15 focus:border-[#9bfc07] outline-none h-24 resize-none"
              />
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={() => setActiveTab("list")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="flex-1"
                loading={posting}
              >
                Publish Posting
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}
