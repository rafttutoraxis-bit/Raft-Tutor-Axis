import { API_URL } from "../config";
import React, { useState, useEffect } from "react";
import { 
  Lock, Search, Shield, Trash2, Check, Download, AlertTriangle, 
  FileSpreadsheet, Activity, RefreshCw, BarChart2, Users, FolderCheck, 
  Sparkles, CheckCircle, HelpCircle, LogOut, MapPin 
} from "lucide-react";
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, PieChart, Pie, Cell 
} from "recharts";

import { ParentRegistration, TeacherRegistration, SchoolRequest, AdminLog } from "../types";

interface AdminPanelProps {
  onForceRefresh?: () => void;
  lang: "en" | "hi";
}

export default function AdminPanel({ onForceRefresh, lang }: AdminPanelProps) {
  const [authToken, setAuthToken] = useState(() => localStorage.getItem("rta_admin_token") || "");
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(localStorage.getItem("rta_admin_token")));
  const [username, setUsername] = useState(() => localStorage.getItem("rta_admin_email") || "");
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState<"analytics" | "parents" | "teachers" | "schools" | "logs" | "ai">("analytics");
  const [searchQuery, setSearchQuery] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" >("all");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Role-based Access level
  const [role, setRole] = useState<"Super Admin" | "Operations Manager">(
    () => (localStorage.getItem("rta_admin_role") as "Super Admin" | "Operations Manager") || "Operations Manager"
  );

  // Live database collections
  const [parents, setParents] = useState<ParentRegistration[]>([]);
  const [teachers, setTeachers] = useState<TeacherRegistration[]>([]);
  const [schools, setSchoolRequests] = useState<SchoolRequest[]>([]);
  const [logs, setLogs] = useState<AdminLog[]>([]);

  // AI Strategic report outcome
  const [aiReport, setAiReport] = useState("");
  const [generatingReport, setGeneratingReport] = useState(false);

  const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${authToken}`
  });

  const logout = () => {
    localStorage.removeItem("rta_admin_token");
    localStorage.removeItem("rta_admin_email");
    localStorage.removeItem("rta_admin_role");
    setAuthToken("");
    setIsAuthenticated(false);
    setUsername("");
    setPassword("");
    setParents([]);
    setTeachers([]);
    setSchoolRequests([]);
    setLogs([]);
  };

  const fetchDatabase = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/data`, {
        headers: authHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setParents(data.parents || []);
        setTeachers(data.teachers || []);
        setSchoolRequests(data.schools || []);
        setLogs(data.logs || []);
      } else if (response.status === 401) {
        logout();
      }
    } catch (err) {
      console.error("Failed to read server data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && authToken) {
      fetchDatabase();
    }
  }, [isAuthenticated, authToken]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      if (response.ok) {
        const result = await response.json();
        localStorage.setItem("rta_admin_token", result.token);
        localStorage.setItem("rta_admin_email", result.user?.email || username);
        localStorage.setItem("rta_admin_role", result.user?.role || "Operations Manager");
        setAuthToken(result.token);
        setUsername(result.user?.email || username);
        setRole(result.user?.role || "Operations Manager");
        setIsAuthenticated(true);
      } else {
        const err = await response.json();
        setErrorMsg(err.error || "Authentication failed. Try again.");
      }
    } catch {
      setErrorMsg("Unable to communicate with the Express authorization daemon.");
    } finally {
      setLoading(false);
    }
  };

  const executeAdminAction = async (actionType: "delete" | "approve_teacher" | "toggle_payment", entityType: string, id: string) => {
    // Only Super Admins can delete critical records to ensure safety
    if (actionType === "delete" && role !== "Super Admin") {
      alert("Permission Denied: Only Super Admin has deletion rights.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/admin/action`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          actionType,
          entityType,
          id
        })
      });

      if (response.ok) {
        fetchDatabase();
        if (onForceRefresh) onForceRefresh();
      }
    } catch (err) {
      console.error("Action execution failed:", err);
    }
  };

  const handleGenerateAIReport = async () => {
    setGeneratingReport(true);
    setAiReport("");
    try {
      const response = await fetch(`${API_URL}/api/admin/gemini-report`, {
        method: "POST",
        headers: authHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setAiReport(data.report || "");
      } else {
        setAiReport("Failed to generate AI Analytics from server.");
      }
    } catch {
      setAiReport("Connection interrupted while requesting Gemini services.");
    } finally {
      setGeneratingReport(false);
    }
  };

  // CSV Exporter
  const exportToCSV = (entityType: "parents" | "teachers" | "schools") => {
    let headers = "";
    let rows = [];

    if (entityType === "parents") {
      headers = "ID,Name,Mobile,Email,City,Class,Board,Subjects,Mode,Address,Created_At\n";
      rows = parents.map(p => 
        `"${p.id}","${p.name}","${p.mobile}","${p.email}","${p.city}","${p.studentClass}","${p.board}","${p.subjects}","${p.mode}","${p.address?.replace(/"/g, '""')}","${p.createdAt}"`
      );
    } else if (entityType === "teachers") {
      headers = "ID,Name,Mobile,Email,Gender,City,Qualification,Experience,Subjects,Classes,Mode,ExpectedFees,Approved,PaymentStatus,TxnID,Created_At\n";
      rows = teachers.map(t => 
        `"${t.id}","${t.name}","${t.mobile}","${t.email}","${t.gender}","${t.city}","${t.qualification}","${t.experience}","${t.subjects}","${t.classes}","${t.mode}","${t.expectedFees}","${t.isApproved}","${t.paymentStatus || "Pending"}","${t.txnId || ""}","${t.createdAt}"`
      );
    } else {
      headers = "ID,OrgName,ContactPerson,Phone,Email,Location,Details,Created_At\n";
      rows = schools.map(s => 
        `"${s.id}","${s.orgName}","${s.contactPerson}","${s.phone}","${s.email}","${s.location}","${s.details?.replace(/"/g, '""')}","${s.createdAt}"`
      );
    }

    const csvContent = "data:text/csv;charset=utf-8," + headers + rows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `rta_${entityType}_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter computations
  const getFilteredParents = () => {
    return parents.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.subjects.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.mobile.includes(searchQuery);
      const matchesCity = cityFilter === "" ? true : p.city.toLowerCase() === cityFilter.toLowerCase();
      return matchesSearch && matchesCity;
    });
  };

  const getFilteredTeachers = () => {
    return teachers.filter(t => {
      const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            t.subjects.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            t.qualification.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCity = cityFilter === "" ? true : t.city.toLowerCase() === cityFilter.toLowerCase();
      return matchesSearch && matchesCity;
    });
  };

  // Analytics helper datasets
  const getBoardDistributionData = () => {
    const cbse = parents.filter(p => p.board === "CBSE").length;
    const icse = parents.filter(p => p.board === "ICSE").length;
    const state = parents.filter(p => p.board === "State Board").length;

    return [
      { name: "CBSE Board", value: cbse },
      { name: "ICSE Board", value: icse },
      { name: "State Board", value: state }
    ];
  };

  const getCitySpreadData = () => {
    const cities: Record<string, number> = {};
    parents.forEach(p => {
      const c = p.city ? p.city.trim() : "Other";
      cities[c] = (cities[c] || 0) + 1;
    });
    return Object.keys(cities).map(name => ({ city: name, inquiries: cities[name] }));
  };

  const COLORS = ["#0B6FB8", "#A10D0D", "#FFD700", "#10B981", "#8B5CF6", "#F59E0B"];

  if (!isAuthenticated) {
    return (
      <section className="py-20 bg-brand-bg dark:bg-brand-dark-bg transition-colors duration-300 min-h-[500px] flex items-center justify-center">
        <div className="w-full max-w-md bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 p-8 rounded-2xl shadow-2xl relative overflow-hidden">
          
          <div className="absolute top-0 left-0 w-full h-1.5 bg-brand-primary" />

          <div className="text-center mb-6">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-full inline-block mb-3">
              <Shield className="w-8 h-8 text-brand-primary" />
            </div>
            <h3 className="font-display font-semibold text-xl text-gray-900 dark:text-white uppercase tracking-wider">
              RTA Staff Gatekeeper
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Authorized administrators, operations logs and founders login only.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 mb-4 bg-rose-50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-400 border border-rose-200 dark:border-rose-900 rounded-lg text-xs leading-normal flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest mb-1.5">Admin Email</label>
              <input
                type="text"
                placeholder="e.g. admin@rafttutoraxis.com"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#0c121a] border border-gray-200 dark:border-gray-800 focus:border-brand-primary outline-none px-3.5 py-3 rounded-xl text-xs text-gray-800 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest mb-1.5">Root Token Password</label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Enter your admin password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#0c121a] border border-gray-200 dark:border-gray-800 focus:border-brand-primary outline-none px-3.5 py-3 pr-10 rounded-xl text-xs text-gray-800 dark:text-white"
                  required
                />
                <Lock className="absolute right-3.5 top-3.5 w-4 h-4 text-gray-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-brand-primary hover:bg-blue-600 text-white font-semibold rounded-xl text-xs tracking-wider uppercase transition-all shadow-md hover:shadow-brand-primary/20 cursor-pointer flex items-center justify-center gap-1.5"
            >
              {loading ? "Decrypting Node..." : "Login Securely"}
            </button>
          </form>

          <div className="mt-6 border-t border-gray-100 dark:border-gray-800 pt-4 text-center">
            <span className="text-[10px] text-gray-400 font-mono">
              ROLE-BASED ACCESS CONTROL (RBAC) PIPELINE ACTIVE
            </span>
          </div>
        </div>
      </section>
    );
  }

  return (
      <section className="py-12 bg-gradient-to-br from-slate-950 via-slate-900 to-black min-h-screen transition-colors duration-300" id="admin-panel-console">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Console Header */}
        <div className="bg-slate-900 border border-slate-800 text-white p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-blue-500 rounded-full text-[9px] font-bold uppercase tracking-widest">
                {role} Level
              </span>
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] text-zinc-400 font-mono">Admin: {username}</span>
            </div>
            <h2 className="font-display font-semibold text-lg text-white mt-1">
              Raft Tutor Axis Administration Hub
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchDatabase}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-zinc-300 rounded-lg text-xs transition-all flex items-center gap-1.5 border border-slate-700 cursor-pointer"
              title="Reload Sync Database"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Sync</span>
            </button>

            <button
              onClick={logout}
              className="p-2 bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 rounded-lg text-xs transition-all flex items-center gap-1.5 border border-rose-900/40 cursor-pointer"
              title="Logout Session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher Grid */}
        <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 dark:border-gray-850 pb-4 mb-8">
          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-4 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "analytics"
                ? "bg-slate-100 dark:bg-gray-800 text-brand-primary"
                : "text-gray-500 hover:text-brand-primary"
            }`}
          >
            📊 {lang === "en" ? "Analytics" : "विश्लेषण"}
          </button>
          <button
            onClick={() => setActiveTab("parents")}
            className={`px-4 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "parents"
                ? "bg-slate-100 dark:bg-gray-800 text-brand-primary"
                : "text-gray-500 hover:text-brand-primary"
            }`}
          >
            👩‍👦 {lang === "en" ? "Parents" : "अभिभावक सूची"} ({parents.length})
          </button>
          <button
            onClick={() => setActiveTab("teachers")}
            className={`px-4 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "teachers"
                ? "bg-slate-100 dark:bg-gray-800 text-brand-primary"
                : "text-gray-500 hover:text-brand-primary"
            }`}
          >
            👨‍🏫 {lang === "en" ? "Teachers" : "शिक्षक सूची"} ({teachers.length})
          </button>
          <button
            onClick={() => setActiveTab("schools")}
            className={`px-4 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "schools"
                ? "bg-slate-100 dark:bg-gray-800 text-brand-primary"
                : "text-gray-500 hover:text-brand-primary"
            }`}
          >
            🏫 {lang === "en" ? "Schools" : "स्कूल अनुरोध"} ({schools.length})
          </button>
          <button
            onClick={() => setActiveTab("logs")}
            className={`px-4 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "logs"
                ? "bg-slate-100 dark:bg-gray-800 text-brand-primary"
                : "text-gray-500 hover:text-brand-primary"
            }`}
          >
            📝 {lang === "en" ? "System Logs" : "लॉग फ़ाइलें"} ({logs.length})
          </button>
          <button
            onClick={() => { setActiveTab("ai"); if (aiReport === "") handleGenerateAIReport(); }}
            className={`px-4 py-2.5 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-950/30 font-display flex items-center gap-1 opacity-90 hover:opacity-100 uppercase tracking-wider transition-all cursor-pointer`}
          >
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>Executive Gemini Report</span>
          </button>
        </div>

        {/* Dynamic Context Panel */}
        {activeTab === "analytics" && (
          <div className="space-y-8 animate-fade-in">
            {/* Numeric Indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              <div className="p-5 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/10 dark:to-blue-950/25 rounded-xl border border-blue-100 dark:border-blue-900/30">
                <Users className="w-6 h-6 text-brand-primary mb-2.5" />
                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Total Parent Inquiries</h4>
                <p className="text-3xl font-display font-semibold text-gray-900 dark:text-white mt-1">{parents.length}</p>
              </div>

              <div className="p-5 bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/10 dark:to-emerald-950/25 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                <Users className="w-6 h-6 text-emerald-600 mb-2.5" />
                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Approved Instructors</h4>
                <p className="text-3xl font-display font-semibold text-gray-900 dark:text-white mt-1">
                  {teachers.filter(t => t.isApproved).length} <span className="text-xs text-gray-400 font-normal">/ {teachers.length}</span>
                </p>
              </div>

              <div className="p-5 bg-gradient-to-br from-rose-50 to-rose-100/50 dark:from-rose-950/10 dark:to-rose-950/25 rounded-xl border border-rose-100 dark:border-rose-900/30">
                <FolderCheck className="w-6 h-6 text-brand-secondary mb-2.5" />
                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">School Vacancy Postings</h4>
                <p className="text-3xl font-display font-semibold text-gray-900 dark:text-white mt-1">{schools.length}</p>
              </div>

              <div className="p-5 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/10 dark:to-purple-950/25 rounded-xl border border-purple-100 dark:border-purple-900/30">
                <Activity className="w-6 h-6 text-purple-600 mb-2.5" />
                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Admin Actions Logged</h4>
                <p className="text-3xl font-display font-semibold text-gray-900 dark:text-white mt-1">{logs.length}</p>
              </div>
            </div>

            {/* Graphical Dashboards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Graphic 1: Recharts Bar Chart */}
              <div className="p-6 bg-slate-50 dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl shadow-sm">
                <h4 className="font-display font-semibold text-sm text-gray-805 dark:text-white mb-6">
                  Inquiry Share by City Presence
                </h4>
                {parents.length === 0 ? (
                  <div className="h-64 flex items-center justify-center text-xs text-gray-400">
                    No registrations captured yet.
                  </div>
                ) : (
                  <div className="h-64 text-xs font-mono">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getCitySpreadData()}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                        <XAxis dataKey="city" stroke="#888888" />
                        <YAxis stroke="#888888" />
                        <Tooltip />
                        <Bar dataKey="inquiries" fill="#0B6FB8" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Graphic 2: Pie Chart */}
              <div className="p-6 bg-slate-50 dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl shadow-sm">
                <h4 className="font-display font-semibold text-sm text-gray-805 dark:text-white mb-6">
                  Target Student School Boards
                </h4>
                {parents.length === 0 ? (
                  <div className="h-64 flex items-center justify-center text-xs text-gray-400">
                    No registrations captured yet.
                  </div>
                ) : (
                  <div className="h-64 text-xs">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={getBoardDistributionData()}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {getBoardDistributionData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* Search controls for lists */}
        {activeTab !== "analytics" && activeTab !== "logs" && activeTab !== "ai" && (
          <div className="flex flex-col md:flex-row items-center gap-4 bg-[#1f2937] p-4 border border-gray-800 rounded-xl mb-6">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={lang === "en" ? "Search by name or subjects..." : "नाम या विषय से खोजें..."}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-[#0f172a] text-white pl-9 pr-4 py-2 rounded-lg text-xs outline-none focus:border-brand-primary border border-gray-700"
              />
            </div>

            <div className="w-full md:w-48">
              <input
                type="text"
                placeholder={lang === "en" ? "Filter City..." : "शहर से ट्यून..."}
                value={cityFilter}
                onChange={e => setCityFilter(e.target.value)}
                className="w-full bg-white dark:bg-[#0c121a] px-3 py-2 rounded-lg text-xs outline-none focus:border-brand-primary border border-gray-200 dark:border-gray-800"
              />
            </div>

            <div className="w-full md:w-48">
  <select
    value={statusFilter}
    onChange={(e) =>
      setStatusFilter(e.target.value as "all" | "pending" | "approved")
    }
    className="w-full bg-white dark:bg-[#0c121a] px-3 py-2 rounded-lg text-xs outline-none border border-gray-200 dark:border-gray-800"
  >
    <option value="all">All Status</option>
    <option value="approved">Approved</option>
    <option value="pending">Pending</option>
  </select>
</div>

            <button
              onClick={() => exportToCSV(activeTab)}
              className="px-4.5 py-2.5 bg-brand-primary hover:bg-blue-600 text-white rounded-lg text-xs font-semibold flex items-center gap-2 cursor-pointer w-full md:w-auto shrink-0 justify-center shadow-lg shadow-brand-primary/10"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        )}

        {/* Parent registrations list */}
        {activeTab === "parents" && (
            <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-x-auto shadow-sm">
              <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 uppercase tracking-widest text-[9px] font-bold text-gray-500">
                  <th className="px-5 py-3">Student / Parent Details</th>
                  <th className="px-5 py-3">Location & Address</th>
                  <th className="px-5 py-3">Academic vacancies</th>
                  <th className="px-5 py-3">Instruction</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3 text-right">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-xs">
                {getFilteredParents().length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-gray-400">No matching requests found.</td>
                  </tr>
                ) : (
                  getFilteredParents().map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-gray-900/50 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-gray-900 dark:text-white">{p.name}</p>
                        <p className="text-[10px] text-gray-500 dark:text-zinc-400">{p.mobile} | {p.email}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-gray-900 dark:text-white">{p.city}</p>
                        <p className="text-[10px] text-gray-505 dark:text-zinc-400 max-w-[200px] truncate">{p.address}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-zinc-900 dark:text-white">{p.studentClass} ({p.board})</p>
                        <p className="text-[10px] text-brand-primary dark:text-blue-400 font-medium">{p.subjects}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-[10px] text-zinc-600 dark:text-zinc-300 max-w-[150px] truncate">{p?.message || "None"}</p>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold tracking-wider ${
                          p.mode === "Home" ? "bg-amber-100 text-amber-850" : "bg-teal-100 text-teal-850"
                        }`}>{p.mode}</span>
                      </td>
                      <td className="px-5 py-4 text-[10px] text-gray-400">
                        {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "unknown"}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => executeAdminAction("delete", "parents", p.id)}
                          className={`p-1.5 rounded-lg border transition-all ${
                            role === "Super Admin" 
                              ? "hover:bg-red-50 hover:text-red-600 hover:border-red-200 border-gray-200 dark:border-gray-800 text-gray-400 cursor-pointer" 
                              : "text-gray-300 border-gray-100 dark:border-gray-900 cursor-not-allowed"
                          }`}
                          title={role === "Super Admin" ? "Delete Record Permanently" : "Super Admin Required"}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Teacher applicant roster list */}
        {activeTab === "teachers" && (
          <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-x-auto shadow-sm">
            <table className="w-full text-left border-collapse min-w-[850px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 uppercase tracking-widest text-[9px] font-bold text-gray-500">
                  <th className="px-5 py-3">Photo / Tutor Info</th>
                  <th className="px-5 py-3">City & Credentials</th>
                  <th className="px-5 py-3">Teaching Subjects</th>
                  <th className="px-5 py-3">Expectation</th>
                  <th className="px-5 py-3">Vetted Status</th>
                  <th className="px-5 py-3 text-right font-bold text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-xs text-gray-700 dark:text-zinc-300">
                {getFilteredTeachers().length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-gray-400">No applicants logged in.</td>
                  </tr>
                ) : (
                  getFilteredTeachers().map(t => (
                    <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-gray-900/50 transition-colors">
                      <td className="px-5 py-4 flex items-center gap-3">
                        <img 
                          src={t.photoUrl || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150"} 
                          className="w-10 h-10 rounded-full object-cover border border-gray-200 shrink-0"
                          alt="tutor" 
                        />
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{t.name}</p>
                          <p className="text-[10px] text-gray-400">{t.email} | {t.mobile}</p>
                          <p className="text-[9px] uppercase tracking-wider font-semibold text-gray-400">{t.gender}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-gray-900 dark:text-white">{t.city}</p>
                        <p className="text-[10px] text-brand-primary">{t.qualification}</p>
                        <span className="text-[10px] font-medium bg-slate-100 dark:bg-gray-800 text-gray-600 dark:text-zinc-300 px-2 py-0.5 rounded-full mt-1 inline-block">Exp: {t.experience}</span>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-gray-900 dark:text-white">Classes: {t.classes}</p>
                        <p className="text-[10px] text-green-500 font-medium">{t.subjects}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-zinc-900 dark:text-white">{t.expectedFees}</p>
                        <span className="text-[10px] uppercase font-bold text-gray-400">{t.mode} Mode</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide inline-flex items-center gap-1 ${
                          t.isApproved 
                            ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400" 
                            : "bg-amber-100 dark:bg-amber-950/20 text-amber-800 dark:text-amber-400"
                        }`}>
                          <Check className={`w-3 h-3 ${t.isApproved ? "" : "hidden"}`} />
                          <span>{t.isApproved ? "Approved Network Member" : "Verification Pending"}</span>
                        </span>
                        <div className="mt-1.5 flex flex-col gap-1 items-start">
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-widest ${
                            t.paymentStatus === "Paid" 
                              ? "bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-400" 
                              : "bg-rose-100 dark:bg-rose-950/20 text-rose-800 dark:text-rose-400"
                          }`}>
                            Fee ₹149: {t.paymentStatus || "Pending"}
                          </span>
                          {t.txnId && (
                            <span className="text-[9px] font-mono text-zinc-500 dark:text-zinc-400 select-all leading-none mt-0.5">
                              Txn: {t.txnId}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => executeAdminAction("approve_teacher", "teachers", t.id)}
                            className="p-1 px-2 border border-gray-200 dark:border-gray-800 hover:border-brand-primary dark:hover:border-blue-400 text-brand-primary dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-md text-[10px] font-semibold flex items-center gap-0.5 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5 shrink-0" />
                            <span>Approval</span>
                          </button>

                          <button
                            onClick={() => executeAdminAction("toggle_payment", "teachers", t.id)}
                            className="p-1 px-2 border border-gray-200 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-400 text-zinc-600 dark:text-zinc-300 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-md text-[10px] font-semibold flex items-center gap-0.5 cursor-pointer"
                          >
                            <span>Fee</span>
                          </button>

                          <button
                            onClick={() => executeAdminAction("delete", "teachers", t.id)}
                            className={`p-1.5 rounded-lg border transition-all ${
                              role === "Super Admin" 
                                ? "hover:bg-red-50 hover:text-red-600 hover:border-red-200 border-gray-200 dark:border-gray-800 text-gray-400 cursor-pointer" 
                                : "text-gray-300 border-gray-100 dark:border-gray-900 cursor-not-allowed"
                            }`}
                            title="Super Admin Required"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* School recruitment inquiries list */}
        {activeTab === "schools" && (
          <div className="bg-[#111827] border border-gray-150 dark:border-gray-850 rounded-xl overflow-x-auto shadow-sm">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 uppercase tracking-widest text-[9px] font-bold text-gray-500">
                  <th className="px-5 py-3">Institute / Organization Name</th>
                  <th className="px-5 py-3">Contact Person Details</th>
                  <th className="px-5 py-3">Vacant specifications vacancy details</th>
                  <th className="px-5 py-3 text-right">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-xs">
                {schools.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-10 text-gray-400">No school entries mapped.</td>
                  </tr>
                ) : (
                  schools.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-gray-900/50 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-gray-900 dark:text-white uppercase tracking-wider">{s.orgName}</p>
                        <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-1 font-semibold">
                          <MapPin className="w-3 h-3 text-red-500" />
                          {s.location}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-gray-800 dark:text-white">{s.contactPerson}</p>
                        <span className="text-[10px] text-gray-400">{s.phone} | {s.email}</span>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-[10px] text-gray-650 dark:text-gray-300 leading-normal max-w-sm whitespace-pre-line">{s.details}</p>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => executeAdminAction("delete", "schools", s.id)}
                          className={`p-1.5 rounded-lg border transition-all ${
                            role === "Super Admin" 
                              ? "hover:bg-red-50 hover:text-red-600 hover:border-red-200 border-gray-200 dark:border-gray-800 text-gray-400 cursor-pointer" 
                              : "text-gray-300 border-gray-100 dark:border-gray-900 cursor-not-allowed"
                          }`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* System log history */}
        {activeTab === "logs" && (
          <div className="bg-slate-50 dark:bg-gray-950 p-6 border border-gray-150 dark:border-gray-850 rounded-2xl">
            <div className="flex items-center gap-2 mb-4 border-b border-gray-100 dark:border-gray-800 pb-3">
              <Activity className="w-5 h-5 text-purple-500" />
              <h3 className="font-display font-semibold text-sm text-gray-800 dark:text-white uppercase tracking-wider">
                Audit Trail and System Telemetry Logs
              </h3>
            </div>

            <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-2 font-mono text-[11px] leading-relaxed">
              {logs.map(lg => (
                <div key={lg.id} className="p-3 bg-white dark:bg-gray-900 rounded-lg shadow-xxs border border-gray-100 dark:border-gray-900 flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <span className="text-brand-primary dark:text-blue-400 font-semibold uppercase tracking-wider">[{lg.user}]</span>
                    <span className="text-gray-600 dark:text-zinc-300 ml-2">{lg.action}</span>
                  </div>
                  <div className="text-right text-[10px] text-gray-400 shrink-0">
                    <span>{lg.ip}</span> | <span>{new Date(lg.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gemini Strategic AI reports */}
        {activeTab === "ai" && (
          <div className="bg-white dark:bg-[#0d121a] p-6 sm:p-10 border border-gray-150 dark:border-gray-800 rounded-2xl shadow-xl animate-fade-in text-xs font-mono">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4 mb-6 relative">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded-full">
                  <Sparkles className="w-5 h-5 text-brand-primary animate-spin" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-sm text-gray-900 dark:text-white uppercase tracking-widest">
                    Gemini AI Strategic Market Analysis
                  </h3>
                  <p className="text-[10px] text-gray-500 mt-1">
                    Custom reports generated server-side using gemini-3.5-flash
                  </p>
                </div>
              </div>

              <button
                onClick={handleGenerateAIReport}
                disabled={generatingReport}
                className="px-4 py-2 bg-brand-primary hover:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-lg text-xs leading-none font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${generatingReport ? 'animate-spin' : ''}`} />
                <span>Compile New Report</span>
              </button>
            </div>

            {generatingReport ? (
              <div className="py-20 flex flex-col items-center justify-center text-center">
                <RefreshCw className="w-10 h-10 text-brand-primary animate-spin mb-4" />
                <p className="font-semibold text-gray-700 dark:text-white">Analyzing Student Registrations & Vetting Tutors...</p>
                <p className="text-xs text-gray-400 mt-2">Checking coordinate anomalies, phone matching codes, and city weights.</p>
              </div>
            ) : (
              <div className="text-gray-800 dark:text-gray-200 leading-relaxed font-sans bg-slate-50 dark:bg-gray-950/40 p-6 rounded-xl border border-gray-100 dark:border-gray-900 font-mono whitespace-pre-wrap max-h-[600px] overflow-y-auto">
                {aiReport}
              </div>
            )}
          </div>
        )}

      </div>
    </section>
  );
}
