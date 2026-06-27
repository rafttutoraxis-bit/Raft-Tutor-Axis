import React, { useState, useEffect } from "react";
import { Lock, AlertTriangle, Shield, HelpCircle, Check, Eye, EyeOff } from "lucide-react";
import { api } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { useSettings } from "../contexts/SettingsContext";

// Modular Admin subcomponents
import Sidebar, { AdminTab } from "./Admin/Sidebar";
import Header from "./Admin/Header";
import Dashboard from "./Admin/Dashboard";
import AnalyticsCards from "./Admin/AnalyticsCards";
import ParentTable from "./Admin/ParentTable";
import TeacherTable from "./Admin/TeacherTable";
import SchoolTable from "./Admin/SchoolTable";
import VacancyTable from "./Admin/VacancyTable";
import LogsTable from "./Admin/LogsTable";
import AIReport from "./Admin/AIReport";
import SettingsManager from "./Admin/SettingsManager";
import Button from "./UI/Button";
import Card from "./UI/Card";

interface AdminPanelProps {
  onForceRefresh?: () => void;
  lang: "en" | "hi";
  mode?: "admin" | "user";
}

export default function AdminPanel({ onForceRefresh, lang, mode = "admin" }: AdminPanelProps) {
  const { user, token, login, logout, forgotPassword, resetPassword, loading: authLoading } = useAuth();
  const { settings } = useSettings();
  
  const [activeTab, setActiveTab] = useState<AdminTab>("analytics");
  const [loading, setLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [authCardMode, setAuthCardMode] = useState<"login" | "forgot" | "reset">("login");
  const [successMsg, setSuccessMsg] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showResetNewPassword, setShowResetNewPassword] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem("rta_remembered_email");
    if (savedEmail) {
      setLoginEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  // Live database collections
  const [parents, setParents] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  const [vacancies, setVacancies] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);

  // AI Strategic report outcome
  const [aiReport, setAiReport] = useState("");
  const [generatingReport, setGeneratingReport] = useState(false);

  const fetchDatabase = async () => {
    if (!token || !user) return;
    setLoading(true);
    try {
      const data = await api.get("/api/data");
      setParents(data.parents || []);
      setTeachers(data.teachers || []);
      setSchools(data.schools || []);
      setLogs(data.logs || []);

      // Fetch vacancies too
      const vacRes = await api.get("/api/vacancies");
      if (vacRes.success) {
        setVacancies(vacRes.vacancies || []);
      }
    } catch (err) {
      console.error("Failed to read server data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && user && (user.role === "Super Admin" || user.role === "Operations Manager")) {
      fetchDatabase();
    }
  }, [token, user]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const success = await login(loginEmail, loginPassword);
      if (success) {
        if (rememberMe) {
          localStorage.setItem("rta_remembered_email", loginEmail);
        } else {
          localStorage.removeItem("rta_remembered_email");
        }
        const storedUser = localStorage.getItem("rta_user");
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          if (isUserMode && (parsed.role === "Super Admin" || parsed.role === "Operations Manager")) {
            logout();
            setErrorMsg("Invalid credentials.");
            setLoading(false);
            return;
          }
          if (!isUserMode && !(parsed.role === "Super Admin" || parsed.role === "Operations Manager")) {
            logout();
            setErrorMsg("Invalid administrator or operations credentials.");
            setLoading(false);
            return;
          }
        }
      } else {
        setErrorMsg(isUserMode ? "Invalid credentials." : "Invalid administrator or operations credentials.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to establish connection to authentication engine.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);
    try {
      const res = await forgotPassword(loginEmail);
      if (res.success) {
        setSuccessMsg(res.message);
        setAuthCardMode("reset");
      } else {
        setErrorMsg(res.message);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to trigger password recovery");
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);
    try {
      const res = await resetPassword({
        email: loginEmail,
        token: resetToken,
        newPassword: newPassword,
      });
      if (res.success) {
        setSuccessMsg(res.message);
        setAuthCardMode("login");
        setLoginPassword("");
        setResetToken("");
        setNewPassword("");
      } else {
        setErrorMsg(res.message);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  const executeAdminAction = async (
    actionType: "delete" | "approve_teacher" | "toggle_payment" | "assign_tutor",
    entityType: string,
    id: string,
    extraBody?: any
  ) => {
    if (actionType === "delete" && user?.role !== "Super Admin") {
      alert("Permission Denied: Only Super Admin accounts hold delete privileges.");
      return;
    }

    try {
      const payload = { actionType, entityType, id, ...extraBody };
      const response = await api.post("/api/admin/action", payload);

      if (response.success) {
        fetchDatabase();
        if (onForceRefresh) onForceRefresh();
      }
    } catch (err: any) {
      alert(err.message || "Operation failed to compile on server.");
    }
  };

  const handleGenerateAIReport = async () => {
    setGeneratingReport(true);
    setAiReport("");
    try {
      const data = await api.post("/api/admin/gemini-report");
      setAiReport(data.report || "No strategic analytics returned from models.");
    } catch {
      setAiReport("Connection interrupted while requesting Gemini services.");
    } finally {
      setGeneratingReport(false);
    }
  };



  const verifiedTeachersCount = teachers.filter(t => t.isApproved).length;
  const pendingPaymentsCount = teachers.filter(t => t.paymentStatus === "Paid").length;
  const totalRevenueCount = teachers.filter(t => t.paymentStatus === "Verified").length * (settings.registrationFee || 149);

  const analyticsCounts = {
    parents: parents.length,
    teachers: teachers.length,
    schools: schools.length,
    vacancies: vacancies.length,
    logs: logs.length,
    verifiedTeachers: verifiedTeachersCount,
    pendingPayments: pendingPaymentsCount,
    totalRevenue: totalRevenueCount,
  };

  const COLORS = ["#9bfc07", "#3b82f6", "#f43f5e", "#10b981", "#8b5cf6", "#f59e0b"];

  const isUserMode = mode === "user";
  const isAdmin = user && (user.role === "Super Admin" || user.role === "Operations Manager");

  useEffect(() => {
    if (isAdmin && isUserMode) {
      window.location.href = "/admin";
    }
  }, [isAdmin, isUserMode]);

  if (authLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-white">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#9bfc07] mb-4" />
        <p className="text-xs font-mono">Verifying Access Gatekeeper...</p>
      </div>
    );
  }

  // 1. If not logged in, show corresponding login page (Admin gatekeeper vs User portal login)
  if (!user) {
    const isForgotMode = authCardMode === "forgot";
    const isResetMode = authCardMode === "reset";

    const queryParams = new URLSearchParams(window.location.search);
    const roleParam = queryParams.get("role");
    const selectedRole = (roleParam && ["Parent", "Teacher", "School"].includes(roleParam)) ? roleParam : null;

    const titleText = isForgotMode
      ? "Reset Password Request"
      : isResetMode
      ? "Initialize New Password"
      : isUserMode
      ? (selectedRole ? `${selectedRole} Portal Login` : "RTA Portal Login")
      : "RTA Staff Gatekeeper";

    const subtitleText = isForgotMode
      ? "Enter your email address to dispatch a secure password reset token"
      : isResetMode
      ? "Provide the code sent to your inbox and establish your new password"
      : isUserMode
      ? (selectedRole ? `Access your individual ${selectedRole} workspace` : "Access your Teacher, Parent, or School workspace")
      : "AUTHORIZED OPERATIONS LOGS AND FOUNDERS LOGIN ONLY";

    const emailLabel = isUserMode ? (selectedRole ? `${selectedRole} Email` : "Portal Email") : "Admin Email";
    const emailPlaceholder = isUserMode 
      ? (selectedRole ? `e.g. ${selectedRole.toLowerCase()}@rafttutoraxis.com` : "e.g. teacher@rafttutoraxis.com") 
      : "e.g. admin@rafttutoraxis.com";

    return (
      <section className="py-20 bg-[#110d22] transition-colors duration-300 min-h-[500px] flex items-center justify-center px-4">
        <Card variant="gradient" hoverable={false} className="w-full max-w-md p-8 relative overflow-hidden text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-[#9bfc07]/10 border border-[#9bfc07]/25 rounded-full flex items-center justify-center text-[#9bfc07]">
            <Lock className="w-8 h-8 animate-pulse" />
          </div>
          
          <div>
            <h3 className="font-display font-extrabold text-lg text-white uppercase tracking-wider">
              {titleText}
            </h3>
            <p className="text-[10px] text-zinc-400 font-mono tracking-wider mt-1">
              {subtitleText}
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-450 rounded-xl text-[10px] flex items-start gap-2 text-left">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-[10px] flex items-start gap-2 text-left">
              <Check className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {authCardMode === "login" && (
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-left">
              <div className="space-y-1.5">
                <label htmlFor="login-email" className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{emailLabel}<span className="text-red-500 ml-1">*</span></label>
                <input
                  id="login-email"
                  type="email"
                  placeholder={emailPlaceholder}
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  className="w-full bg-[#110d22] border border-zinc-800 focus:border-[#9bfc07] outline-none px-3.5 py-3 rounded-xl text-xs text-white placeholder-zinc-650"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="login-password" className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                  {isUserMode ? "Password" : "Root Password"}<span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showLoginPassword ? "text" : "password"}
                    placeholder={isUserMode ? "Enter password" : "Enter password token"}
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    className="w-full bg-[#110d22] border border-zinc-800 focus:border-[#9bfc07] outline-none pl-4 pr-11 py-3 rounded-xl text-xs text-white placeholder-zinc-650 transition-all duration-200"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-zinc-450 hover:text-[#9bfc07] transition-all duration-200 focus:outline-none cursor-pointer flex items-center justify-center"
                    aria-label={showLoginPassword ? "Show password" : "Hide password"}
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {isUserMode && (
                <div className="flex items-center gap-2 px-1">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-zinc-800 bg-[#110d22] text-[#9bfc07] focus:ring-[#9bfc07]/30 cursor-pointer"
                  />
                  <label htmlFor="rememberMe" className="text-[10px] text-zinc-400 font-mono select-none cursor-pointer">
                    Remember Me
                  </label>
                </div>
              )}

              <div className="flex justify-between items-center text-[10px] px-1 font-mono">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg("");
                    setSuccessMsg("");
                    setAuthCardMode("forgot");
                  }}
                  className="text-[#9bfc07] hover:underline"
                >
                  Forgot Password?
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg("");
                    setSuccessMsg("");
                    setAuthCardMode("reset");
                  }}
                  className="text-zinc-400 hover:text-white"
                >
                  Have a reset token?
                </button>
              </div>

              <Button
                type="submit"
                variant="primary"
                loading={loading}
                className="w-full flex items-center justify-center gap-1.5"
              >
                Login Securely
              </Button>

              {isUserMode && (
                <div className="flex justify-between items-center text-[10px] px-1 font-mono pt-3 border-t border-zinc-850 mt-1 select-none">
                  <span className="text-zinc-500">Need an account?</span>
                  <a
                    href="/#inquiry-forms-section"
                    className="text-[#9bfc07] hover:underline font-bold"
                  >
                    Create Account
                  </a>
                </div>
              )}
            </form>
          )}

          {authCardMode === "forgot" && (
            <form onSubmit={handleForgotSubmit} className="space-y-4 text-left">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{emailLabel}</label>
                <input
                  type="email"
                  placeholder={emailPlaceholder}
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  className="w-full bg-[#110d22] border border-zinc-800 focus:border-[#9bfc07] outline-none px-3.5 py-3 rounded-xl text-xs text-white placeholder-zinc-650"
                  required
                />
              </div>

              <div className="flex justify-start text-[10px] px-1 font-mono">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg("");
                    setSuccessMsg("");
                    setAuthCardMode("login");
                  }}
                  className="text-zinc-400 hover:text-white"
                >
                  Back to Login
                </button>
              </div>

              <Button
                type="submit"
                variant="primary"
                loading={loading}
                className="w-full flex items-center justify-center gap-1.5"
              >
                Send Reset Token
              </Button>
            </form>
          )}

          {authCardMode === "reset" && (
            <form onSubmit={handleResetSubmit} className="space-y-4 text-left">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{emailLabel}</label>
                <input
                  type="email"
                  placeholder={emailPlaceholder}
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  className="w-full bg-[#110d22] border border-zinc-800 focus:border-[#9bfc07] outline-none px-3.5 py-3 rounded-xl text-xs text-white placeholder-zinc-650"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Reset Token</label>
                <input
                  type="text"
                  placeholder="Enter 8-character token code"
                  value={resetToken}
                  onChange={e => setResetToken(e.target.value)}
                  className="w-full bg-[#110d22] border border-zinc-800 focus:border-[#9bfc07] outline-none px-3.5 py-3 rounded-xl text-xs text-white placeholder-zinc-650"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">New Password</label>
                <div className="relative">
                  <input
                    type={showResetNewPassword ? "text" : "password"}
                    placeholder="Min 8 characters"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full bg-[#110d22] border border-zinc-800 focus:border-[#9bfc07] outline-none pl-4 pr-11 py-3 rounded-xl text-xs text-white placeholder-zinc-650 transition-all duration-200"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetNewPassword(!showResetNewPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-zinc-450 hover:text-[#9bfc07] transition-all duration-200 focus:outline-none cursor-pointer flex items-center justify-center"
                    aria-label={showResetNewPassword ? "Show password" : "Hide password"}
                  >
                    {showResetNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-start text-[10px] px-1 font-mono">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg("");
                    setSuccessMsg("");
                    setAuthCardMode("login");
                  }}
                  className="text-zinc-400 hover:text-white"
                >
                  Back to Login
                </button>
              </div>

              <Button
                type="submit"
                variant="primary"
                loading={loading}
                className="w-full flex items-center justify-center gap-1.5"
              >
                Reset Password
              </Button>
            </form>
          )}

          <div className="border-t border-zinc-800 pt-4 text-[9px] font-mono text-zinc-500 tracking-wider">
            ROLE-BASED ACCESS CONTROL (RBAC) PORTAL ACTIVE
          </div>
        </Card>
      </section>
    );
  }

  // 2. If logged in as admin, but on the landing page user portal mode, redirect to /admin
  if (isAdmin && isUserMode) {
    return (
      <section className="py-20 bg-[#110d22] min-h-[500px] flex items-center justify-center px-4">
        <Card variant="gradient" hoverable={false} className="w-full max-w-md p-8 relative overflow-hidden text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-[#9bfc07]/10 border border-[#9bfc07]/25 rounded-full flex items-center justify-center text-[#9bfc07]">
            <Shield className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <h3 className="font-display font-extrabold text-lg text-white uppercase tracking-wider">
              Admin Session Active
            </h3>
            <p className="text-[10px] text-zinc-400 font-mono tracking-wider mt-1">
              YOU ARE AUTHENTICATED AS {user.role.toUpperCase()}
            </p>
          </div>
          <p className="text-xs text-zinc-350 leading-relaxed">
            Redirecting to dedicated Admin Console...
          </p>
          <div className="space-y-3">
            <Button
              variant="outline"
              onClick={logout}
              className="w-full"
            >
              Logout Session
            </Button>
          </div>
        </Card>
      </section>
    );
  }

  // 3. If logged in as standard user (Teacher/Parent/School), but attempting to view /admin route
  if (!isAdmin && !isUserMode) {
    return (
      <section className="py-20 bg-[#110d22] min-h-[500px] flex items-center justify-center px-4">
        <Card variant="gradient" hoverable={false} className="w-full max-w-md p-8 relative overflow-hidden text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-rose-500/10 border border-rose-500/30 rounded-full flex items-center justify-center text-rose-450">
            <Lock className="w-8 h-8 text-rose-400" />
          </div>
          <div>
            <h3 className="font-display font-extrabold text-lg text-white uppercase tracking-wider">
              Access Denied
            </h3>
            <p className="text-[10px] text-rose-400 font-mono tracking-wider mt-1">
              ADMINISTRATIVE ACCESS GATEWAY
            </p>
          </div>
          <p className="text-xs text-zinc-350 leading-relaxed">
            Your current account role ({user.role}) does not have permissions to access the Admin Console.
          </p>
          <div className="space-y-3">
            <a 
              href="/" 
              className="w-full py-3.5 bg-white hover:bg-zinc-200 text-[#1b1631] font-display font-bold transition-all rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
            >
              Return to Landing Page
            </a>
            <Button
              variant="outline"
              onClick={logout}
              className="w-full"
            >
              Logout Session
            </Button>
          </div>
        </Card>
      </section>
    );
  }

  return (
    <section className="py-10 bg-gradient-to-br from-slate-950 via-slate-900 to-black min-h-screen text-white" id="portal-workspace-console">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Modular Header */}
        <Header
          username={user.email}
          role={user.role}
          onRefresh={fetchDatabase}
          onLogout={logout}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Modular Navigation Sidebar */}
          <div className="lg:col-span-3">
            <Sidebar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              counts={analyticsCounts}
            />
          </div>

          {/* Active Workspaces Panels */}
          <div className="lg:col-span-9 space-y-6">
            {activeTab === "analytics" && (
              <div className="space-y-6">
                <AnalyticsCards counts={analyticsCounts} />
                <Dashboard
                  parents={parents}
                  teachers={teachers}
                  schools={schools}
                  logs={logs}
                  COLORS={COLORS}
                />
              </div>
            )}

            {activeTab === "parents" && (
              <ParentTable
                parents={parents}
                teachers={teachers}
                role={user.role}
                onAction={executeAdminAction}
              />
            )}

            {activeTab === "teachers" && (
              <TeacherTable
                teachers={teachers}
                role={user.role}
                onAction={executeAdminAction}
              />
            )}

            {activeTab === "schools" && (
              <SchoolTable
                schools={schools}
                role={user.role}
                onAction={executeAdminAction}
              />
            )}

            {activeTab === "vacancies" && (
              <VacancyTable
                vacancies={vacancies}
                role={user.role}
                onAction={executeAdminAction}
              />
            )}

            {activeTab === "logs" && (
              <LogsTable logs={logs} />
            )}

            {activeTab === "ai" && (
              <AIReport
                report={aiReport}
                loading={generatingReport}
                onGenerate={handleGenerateAIReport}
              />
            )}

            {activeTab === "settings" && <SettingsManager />}
          </div>
        </div>
      </div>
    </section>
  );
}
