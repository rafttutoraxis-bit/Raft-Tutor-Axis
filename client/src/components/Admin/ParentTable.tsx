import React, { useState } from "react";
import { Trash2, UserPlus, Eye, Check, AlertCircle, HelpCircle, Download } from "lucide-react";
import Table from "../UI/Table";
import Modal from "../UI/Modal";
import Button from "../UI/Button";
import Card from "../UI/Card";
import { api } from "../../services/api";

interface ParentTableProps {
  parents: any[];
  teachers: any[];
  role: string;
  onAction: (actionType: "delete" | "approve_teacher" | "toggle_payment" | "assign_tutor", entityType: string, id: string, extraBody?: any) => void;
}

export default function ParentTable({ parents, teachers, role, onAction }: ParentTableProps) {
  const [selectedParent, setSelectedParent] = useState<any>(null);
  const [matchingTutors, setMatchingTutors] = useState<any[]>([]);
  const [matchingInsight, setMatchingInsight] = useState("");
  const [loadingMatches, setLoadingMatches] = useState(false);

  const openMatchmaker = async (parent: any) => {
    setSelectedParent(parent);
    setMatchingTutors([]);
    setMatchingInsight("");
    setLoadingMatches(true);

    try {
      // Fetch AI matching recommendations from server
      const response = await api.post("/api/ai/match-tutor", { parentInquiryId: parent.id });
      if (response.matches) {
        // If AI matching returned structured items, let's map them
        setMatchingTutors(response.matches);
        setMatchingInsight(response.insight || "AI score recommendations based on qualifications, subjects, and experience.");
      } else {
        // Fallback to local heuristic matching
        const cityTutors = teachers.filter(
          t => t.isApproved && t.city.toLowerCase() === parent.city.toLowerCase()
        );
        setMatchingTutors(cityTutors.map(t => ({
          id: t.id,
          name: t.name,
          score: 80, // static default heuristic
          experience: t.experience,
          qualification: t.qualification,
          phone: t.mobile
        })));
        setMatchingInsight("Matched based on local city presence.");
      }
    } catch (err) {
      console.error(err);
      // Fallback
      const cityTutors = teachers.filter(
        t => t.isApproved && t.city.toLowerCase() === parent.city.toLowerCase()
      );
      setMatchingTutors(cityTutors.map(t => ({
        id: t.id,
        name: t.name,
        score: 75,
        experience: t.experience,
        qualification: t.qualification,
        phone: t.mobile
      })));
    } finally {
      setLoadingMatches(false);
    }
  };

  const handleAssignTutor = async (tutorId: string) => {
    if (!selectedParent) return;
    try {
      onAction("assign_tutor", "parents", selectedParent.id, { teacherId: tutorId });
      setSelectedParent(null);
    } catch (err) {
      console.error(err);
    }
  };

  const exportToCSV = () => {
    const headers = "ID,Name,Mobile,Email,City,Class,Board,Subjects,Mode,Address,Status,Created_At\n";
    const rows = parents.map(p => 
      `"${p.id}","${p.name}","${p.mobile}","${p.email}","${p.city}","${p.studentClass}","${p.board}","${p.subjects}","${p.mode}","${p.address?.replace(/"/g, '""')}","${p.status || "Pending"}","${p.createdAt}"`
    );

    const csvContent = headers + rows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `rta_parents_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Card variant="glass" hoverable={false}>
      <div className="flex items-center justify-between border-b border-[#9bfc07]/10 pb-3 mb-6 select-none">
        <h3 className="font-display font-bold text-sm uppercase tracking-wider text-[#9bfc07]">
          Home Tuition Inquiries
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
        <Table
          columns={[
            {
              header: "Student / Parent Details",
              render: (p: any) => (
                <div>
                  <p className="font-bold text-white">{p.name}</p>
                  <p className="text-[10px] text-zinc-400 font-mono mt-0.5">{p.mobile} | {p.email}</p>
                </div>
              )
            },
            {
              header: "Location & Address",
              render: (p: any) => (
                <div>
                  <p className="font-semibold text-white leading-none mb-1">{p.city}</p>
                  <span className="text-[10px] text-zinc-500 max-w-[200px] truncate block" title={p.address}>
                    {p.address}
                  </span>
                </div>
              )
            },
            {
              header: "Academic Requirements",
              render: (p: any) => (
                <div>
                  <p className="font-semibold text-white leading-none mb-1">{p.studentClass} ({p.board})</p>
                  <span className="text-[10px] text-[#9bfc07] font-semibold">{p.subjects}</span>
                </div>
              )
            },
            {
              header: "Mode & Status",
              render: (p: any) => (
                <div className="flex flex-col gap-1 items-start">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                    p.mode === "Home" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-teal-500/10 text-teal-400 border border-teal-500/20"
                  }`}>
                    {p.mode}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                    p.status === "Mapped" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  }`}>
                    {p.status || "Pending"}
                  </span>
                </div>
              )
            },
            {
              header: "Assigned Educator",
              render: (p: any) => {
                if (p.assignedTeacherId) {
                  const assigned = teachers.find(t => t.id === p.assignedTeacherId);
                  return (
                    <div>
                      <p className="font-bold text-[#9bfc07]">{assigned?.name || "Assigned Tutor"}</p>
                      <p className="text-[9px] text-zinc-400 font-mono mt-0.5">{assigned?.mobile}</p>
                    </div>
                  );
                }
                return (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openMatchmaker(p)}
                    className="flex items-center gap-1"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Assign</span>
                  </Button>
                );
              }
            },
            {
              header: "Delete",
              render: (p: any) => (
                <button
                  onClick={() => onAction("delete", "parents", p.id)}
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
              ),
              className: "text-right w-16"
            }
          ]}
          data={parents}
          searchKeys={["name", "subjects", "mobile", "city"]}
          searchPlaceholder="Filter inquiries by student class, name, subject or city..."
          pageSize={10}
        />

        {/* AI Matchmaker Modal */}
        <Modal
          isOpen={!!selectedParent}
          onClose={() => setSelectedParent(null)}
          title="AI Tutor Matchmaker Assignment"
          size="lg"
        >
          {selectedParent && (
            <div className="space-y-6">
              <div className="bg-[#110d22] border border-[#9bfc07]/15 p-4 rounded-xl space-y-1.5">
                <h4 className="font-display font-bold text-white text-xs uppercase tracking-wide">
                  Target Request Parameters
                </h4>
                <p className="text-[10px] text-zinc-400">
                  Student Name: <strong className="text-white">{selectedParent.name}</strong> | City: <strong className="text-white">{selectedParent.city}</strong> | Board: <strong className="text-white">{selectedParent.board}</strong>
                </p>
                <p className="text-[10px] text-zinc-400">
                  Subjects Required: <strong className="text-emerald-400 font-mono">{selectedParent.subjects}</strong> | Class: <strong className="text-white">{selectedParent.studentClass}</strong>
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">AI Scoring Suggestions</span>
                  <span className="text-[9px] font-mono text-[#9bfc07] animate-pulse">Live database scan</span>
                </div>

                {loadingMatches ? (
                  <div className="py-10 text-center space-y-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#9bfc07] mx-auto" />
                    <p className="text-[10px] font-mono text-zinc-400">Gemini models scanning tutor list...</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {matchingInsight && (
                      <div className="p-3 bg-[#9bfc07]/5 border border-[#9bfc07]/20 rounded-xl text-[10px] text-[#9bfc07] flex items-center gap-2 font-mono">
                        <HelpCircle className="w-4 h-4 shrink-0" />
                        <span>{matchingInsight}</span>
                      </div>
                    )}

                    {matchingTutors.length === 0 ? (
                      <p className="text-center text-zinc-500 text-xs py-6">
                        No active verified tutors found in {selectedParent.city}. Please verify and approve tutors in this city first.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {matchingTutors.map((match, idx) => (
                          <div key={idx} className="bg-[#110d22] border border-zinc-800 rounded-xl p-4 flex items-center justify-between gap-4">
                            <div className="text-xs space-y-1">
                              <div className="flex items-center gap-2.5">
                                <h5 className="font-bold text-white text-sm">{match.name}</h5>
                                <span className="px-2 py-0.5 bg-[#9bfc07]/10 text-[#9bfc07] text-[9px] rounded font-bold">
                                  {match.score ? `${match.score}% Score` : "Match"}
                                </span>
                              </div>
                              <p className="text-[#9bfc07] font-semibold text-[10px]">{match.qualification} | {match.experience} Exp</p>
                              <p className="text-zinc-400 text-[10px]">{match.phone}</p>
                            </div>

                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleAssignTutor(match.id)}
                              className="flex items-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Map educator</span>
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </Modal>
      </div>
    </Card>
  );
}
