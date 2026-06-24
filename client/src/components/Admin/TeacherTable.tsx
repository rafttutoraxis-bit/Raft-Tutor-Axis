import React, { useState } from "react";
import { Check, Trash2, ShieldAlert, FileText, Image as ImageIcon, Eye, AlertCircle, Download } from "lucide-react";
import Table from "../UI/Table";
import Modal from "../UI/Modal";
import Button from "../UI/Button";
import Card from "../UI/Card";
import { API_URL } from "../../config";

interface TeacherTableProps {
  teachers: any[];
  role: string;
  onAction: (actionType: "delete" | "approve_teacher" | "toggle_payment", entityType: string, id: string) => void;
}

export default function TeacherTable({ teachers, role, onAction }: TeacherTableProps) {
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);

  // Local state for searching/filtering/sorting
  const [filterSubject, setFilterSubject] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [filterQual, setFilterQual] = useState("");
  const [filterLang, setFilterLang] = useState("");
  const [filterMode, setFilterMode] = useState("All");
  const [filterExp, setFilterExp] = useState("All");
  const [filterMaxFee, setFilterMaxFee] = useState("");
  const [sortOption, setSortOption] = useState("newest");

  // String parser helpers
  const parseNumericFee = (feeStr: string): number => {
    if (!feeStr) return 0;
    const cleaned = feeStr.replace(/[^0-9]/g, "");
    return cleaned ? parseInt(cleaned, 10) : 0;
  };

  const parseNumericExperience = (expStr: string): number => {
    if (!expStr) return 0;
    const cleaned = expStr.replace(/[^0-9]/g, "");
    return cleaned ? parseInt(cleaned, 10) : 0;
  };

  // Perform search, filter, and sort calculations
  const filteredTeachers = teachers.filter(t => {
    if (filterSubject && !t.subjects?.toLowerCase().includes(filterSubject.toLowerCase())) {
      return false;
    }
    if (filterCity && !t.city?.toLowerCase().includes(filterCity.toLowerCase())) {
      return false;
    }
    if (filterQual && !t.qualification?.toLowerCase().includes(filterQual.toLowerCase())) {
      return false;
    }
    if (filterMode !== "All") {
      if (filterMode === "Home" && t.mode !== "Home" && t.mode !== "Both") return false;
      if (filterMode === "Online" && t.mode !== "Online" && t.mode !== "Both") return false;
      if (filterMode === "Both" && t.mode !== "Both") return false;
    }
    if (filterExp !== "All") {
      const minYears = parseInt(filterExp, 10);
      const years = parseNumericExperience(t.experience);
      if (years < minYears) return false;
    }
    if (filterMaxFee) {
      const maxFee = parseInt(filterMaxFee, 10);
      const fee = parseNumericFee(t.expectedFees);
      if (fee > maxFee) return false;
    }
    if (filterLang) {
      const query = filterLang.toLowerCase();
      const match = 
        t.subjects?.toLowerCase().includes(query) ||
        t.qualification?.toLowerCase().includes(query) ||
        t.experience?.toLowerCase().includes(query) ||
        t.address?.toLowerCase().includes(query);
      if (!match) return false;
    }
    return true;
  });

  const sortedTeachers = [...filteredTeachers].sort((a, b) => {
    switch (sortOption) {
      case "newest":
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      case "oldest":
        return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      case "name-asc":
        return (a.name || "").localeCompare(b.name || "");
      case "name-desc":
        return (b.name || "").localeCompare(a.name || "");
      case "exp-desc":
        return parseNumericExperience(b.experience) - parseNumericExperience(a.experience);
      case "fee-asc":
        return parseNumericFee(a.expectedFees) - parseNumericFee(b.expectedFees);
      case "fee-desc":
        return parseNumericFee(b.expectedFees) - parseNumericFee(a.expectedFees);
      default:
        return 0;
    }
  });

  const getFullUrl = (path: string) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `${API_URL}${path}`;
  };

  const exportToCSV = () => {
    const headers = "ID,Name,Mobile,Email,Gender,City,Qualification,Experience,Subjects,Classes,Mode,ExpectedFees,Approved,PaymentStatus,TxnID,Created_At\n";
    const rows = teachers.map(t => 
      `"${t.id}","${t.name}","${t.mobile}","${t.email}","${t.gender}","${t.city}","${t.qualification}","${t.experience}","${t.subjects}","${t.classes}","${t.mode}","${t.expectedFees}","${t.isApproved}","${t.paymentStatus || "Pending"}","${t.txnId || ""}","${t.createdAt}"`
    );

    const csvContent = headers + rows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `rta_teachers_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Card variant="glass" hoverable={false}>
      <div className="flex items-center justify-between border-b border-[#9bfc07]/10 pb-3 mb-6 select-none">
        <h3 className="font-display font-bold text-sm uppercase tracking-wider text-[#9bfc07]">
          Registered Educator Roster
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={exportToCSV}
          className="flex items-center gap-1 font-bold"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV</span>
        </Button>
      </div>

      <div className="space-y-4">
        {/* Search & Filter Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 bg-[#110d22]/50 border border-zinc-800 p-4 rounded-xl mb-4 text-white text-xs select-none">
          <div className="space-y-1">
            <label className="block text-[8px] uppercase tracking-wider text-zinc-500 font-bold">Subject</label>
            <input
              type="text"
              placeholder="Search Subject"
              value={filterSubject}
              onChange={e => setFilterSubject(e.target.value)}
              className="w-full bg-[#110d22] border border-zinc-800 focus:border-[#9bfc07] outline-none px-2 py-1.5 rounded-lg text-[11px]"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-[8px] uppercase tracking-wider text-zinc-500 font-bold">City</label>
            <input
              type="text"
              placeholder="Search City"
              value={filterCity}
              onChange={e => setFilterCity(e.target.value)}
              className="w-full bg-[#110d22] border border-zinc-800 focus:border-[#9bfc07] outline-none px-2 py-1.5 rounded-lg text-[11px]"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-[8px] uppercase tracking-wider text-zinc-500 font-bold">Qualification</label>
            <input
              type="text"
              placeholder="Search Qual."
              value={filterQual}
              onChange={e => setFilterQual(e.target.value)}
              className="w-full bg-[#110d22] border border-zinc-800 focus:border-[#9bfc07] outline-none px-2 py-1.5 rounded-lg text-[11px]"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-[8px] uppercase tracking-wider text-zinc-500 font-bold">Language</label>
            <input
              type="text"
              placeholder="e.g. English"
              value={filterLang}
              onChange={e => setFilterLang(e.target.value)}
              className="w-full bg-[#110d22] border border-zinc-800 focus:border-[#9bfc07] outline-none px-2 py-1.5 rounded-lg text-[11px]"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-[8px] uppercase tracking-wider text-zinc-500 font-bold">Mode</label>
            <select
              value={filterMode}
              onChange={e => setFilterMode(e.target.value)}
              className="w-full bg-[#110d22] border border-zinc-800 focus:border-[#9bfc07] outline-none px-2 py-1.5 rounded-lg text-[11px]"
            >
              <option value="All">All Modes</option>
              <option value="Home">Home</option>
              <option value="Online">Online</option>
              <option value="Both">Both</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-[8px] uppercase tracking-wider text-zinc-500 font-bold">Experience</label>
            <select
              value={filterExp}
              onChange={e => setFilterExp(e.target.value)}
              className="w-full bg-[#110d22] border border-zinc-800 focus:border-[#9bfc07] outline-none px-2 py-1.5 rounded-lg text-[11px]"
            >
              <option value="All">All Exp</option>
              <option value="1">1+ Years</option>
              <option value="3">3+ Years</option>
              <option value="5">5+ Years</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-[8px] uppercase tracking-wider text-zinc-500 font-bold">Max Fee (₹)</label>
            <input
              type="number"
              placeholder="Max budget"
              value={filterMaxFee}
              onChange={e => setFilterMaxFee(e.target.value)}
              className="w-full bg-[#110d22] border border-zinc-800 focus:border-[#9bfc07] outline-none px-2 py-1.5 rounded-lg text-[11px]"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-[8px] uppercase tracking-wider text-zinc-500 font-bold">Sort By</label>
            <select
              value={sortOption}
              onChange={e => setSortOption(e.target.value)}
              className="w-full bg-[#110d22] border border-zinc-800 focus:border-[#9bfc07] outline-none px-2 py-1.5 rounded-lg text-[11px]"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="exp-desc">Exp (High to Low)</option>
              <option value="fee-asc">Fee (Low to High)</option>
              <option value="fee-desc">Fee (High to Low)</option>
            </select>
          </div>
        </div>

        <Table
          columns={[
            {
              header: "Photo / Tutor Info",
              render: (t: any) => (
                <div className="flex items-center gap-3">
                  <img
                    src={t.photoUrl ? getFullUrl(t.photoUrl) : "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150"}
                    className="w-10 h-10 rounded-full object-cover border border-zinc-700 shrink-0"
                    alt="tutor avatar"
                  />
                  <div>
                    <p className="font-bold text-white leading-none mb-1">{t.name}</p>
                    <p className="text-[10px] text-zinc-400 font-mono">{t.email} | {t.mobile}</p>
                    <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-mono font-bold">{t.gender}</span>
                  </div>
                </div>
              )
            },
            {
              header: "City & Credentials",
              render: (t: any) => (
                <div>
                  <p className="font-semibold text-white leading-none mb-1">{t.city}</p>
                  <p className="text-[10px] text-[#9bfc07] font-semibold">{t.qualification}</p>
                  <span className="text-[9px] bg-[#110d22] text-zinc-400 px-2 py-0.5 rounded border border-zinc-800 mt-1 inline-block">
                    Exp: {t.experience}
                  </span>
                </div>
              )
            },
            {
              header: "Subjects & Classes",
              render: (t: any) => (
                <div>
                  <p className="font-semibold text-white leading-none mb-1">Classes: {t.classes}</p>
                  <span className="text-[10px] text-emerald-400 font-semibold">{t.subjects}</span>
                </div>
              )
            },
            {
              header: "Resume / CV",
              render: (t: any) => (
                <a
                  href={getFullUrl(t.resumeUrl)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-[#9bfc07]/10 text-zinc-300 hover:text-white border border-zinc-700 hover:border-[#9bfc07]/30 transition-all font-semibold font-mono"
                >
                  <FileText className="w-3.5 h-3.5 text-[#9bfc07]" />
                  <span>PDF/DOC</span>
                </a>
              ),
              className: "w-28"
            },
            {
              header: "Vetting Status",
              render: (t: any) => (
                <div className="flex flex-col gap-1 items-start">
                  <span className={`px-2.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide inline-flex items-center gap-1 ${
                    t.isApproved
                      ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                      : "bg-amber-500/10 border border-amber-500/30 text-amber-400"
                  }`}>
                    <Check className={`w-3 h-3 ${t.isApproved ? "" : "hidden"}`} />
                    <span>{t.isApproved ? "Approved Member" : "Verification Pending"}</span>
                  </span>
                  
                  {/* Display Payment Screenshot trigger */}
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-widest ${
                      t.paymentStatus === "Verified" || t.paymentStatus === "Paid"
                        ? "bg-blue-500/10 border border-blue-500/30 text-blue-400"
                        : t.paymentStatus === "Rejected"
                          ? "bg-rose-500/10 border border-rose-500/30 text-rose-450"
                          : "bg-amber-500/10 border border-amber-500/30 text-amber-450"
                    }`}>
                      Fee ₹149: {t.paymentStatus || "Pending"}
                    </span>
                    
                    {t.screenshotUrl && (
                      <button
                        onClick={() => setSelectedScreenshot(t.screenshotUrl)}
                        className="p-1 rounded bg-[#110d22] border border-zinc-800 hover:border-[#9bfc07] text-[#9bfc07] transition-all cursor-pointer"
                        title="Inspect Payment Receipt Screenshot"
                      >
                        <ImageIcon className="w-3 h-3" />
                      </button>
                    )}
                  </div>
 
                  {t.txnId && (
                    <span className="text-[9px] font-mono text-zinc-500 select-all leading-none mt-1">
                      TXN: {t.txnId}
                    </span>
                  )}
                </div>
              )
            },
            {
              header: "Vetting Operations",
              render: (t: any) => (
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onAction("approve_teacher", "teachers", t.id)}
                    className="px-2.5 py-1.5 font-bold"
                    title="Toggle verification approval status"
                  >
                    Verify
                  </Button>
 
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onAction("toggle_payment", "teachers", t.id)}
                    className="px-2.5 py-1.5 font-bold"
                    title="Cycle fee payment status"
                  >
                    Pay Status
                  </Button>
 
                  <button
                    onClick={() => onAction("delete", "teachers", t.id)}
                    className={`p-2 rounded-xl border transition-all ${
                      role === "Super Admin"
                        ? "hover:bg-red-500/10 text-zinc-500 hover:text-red-400 border-zinc-800 hover:border-red-500/30 cursor-pointer"
                        : "text-zinc-700 border-zinc-900 cursor-not-allowed"
                    }`}
                    disabled={role !== "Super Admin"}
                    title={role === "Super Admin" ? "Delete permanently" : "Super Admin permissions required"}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ),
              className: "text-right w-52"
            }
          ]}
          data={sortedTeachers}
          searchKeys={[]}
          pageSize={10}
        />

        {/* Payment Screenshot Modal */}
        <Modal
          isOpen={!!selectedScreenshot}
          onClose={() => setSelectedScreenshot(null)}
          title="Payment screenshot receipt inspector"
        >
          {selectedScreenshot && (
            <div className="space-y-4">
              <p className="text-[10px] text-zinc-400">
                Double check transaction ID details match the screenshot receipt text before verification approval.
              </p>
              <div className="border border-zinc-800 rounded-xl overflow-hidden bg-black/40 flex items-center justify-center p-2">
                <img
                  src={getFullUrl(selectedScreenshot)}
                  className="max-h-[450px] w-auto object-contain rounded"
                  alt="Receipt screenshot"
                />
              </div>
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => setSelectedScreenshot(null)}
              >
                Close Inspector
              </Button>
            </div>
          )}
        </Modal>
      </div>
    </Card>
  );
}
