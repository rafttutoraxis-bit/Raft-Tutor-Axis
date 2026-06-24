import React from "react";
import { Trash2, MapPin, Download } from "lucide-react";
import Table from "../UI/Table";
import Card from "../UI/Card";
import Button from "../UI/Button";

interface VacancyTableProps {
  vacancies: any[];
  role: string;
  onAction: (actionType: "delete" | "approve_teacher" | "toggle_payment", entityType: string, id: string) => void;
}

export default function VacancyTable({ vacancies, role, onAction }: VacancyTableProps) {
  const exportToCSV = () => {
    const headers = "ID,SchoolName,Title,Subject,Board,City,Qualification,Experience,Salary,Status,Created_At\n";
    const rows = vacancies.map(v => 
      `"${v.id}","${v.schoolName}","${v.title}","${v.subject}","${v.board}","${v.city}","${v.qualification}","${v.experience}","${v.salary}","${v.status}","${v.createdAt}"`
    );

    const csvContent = headers + rows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `rta_vacancies_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Card variant="glass" hoverable={false}>
      <div className="flex items-center justify-between border-b border-[#9bfc07]/10 pb-3 mb-6 select-none">
        <h3 className="font-display font-bold text-sm uppercase tracking-wider text-[#9bfc07]">
          School Faculty Job Postings
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

      <Table
        columns={[
          {
            header: "Institution / School",
            render: (v: any) => (
              <div>
                <p className="font-bold text-white uppercase tracking-wider">{v.schoolName}</p>
                <p className="text-[9px] text-zinc-400 font-mono mt-0.5 flex items-center gap-1 font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-red-500" />
                  {v.city}
                </p>
              </div>
            )
          },
          {
            header: "Job Role Title",
            render: (v: any) => (
              <div>
                <p className="font-semibold text-white leading-none mb-1">{v.title}</p>
                <span className="text-[9px] text-[#9bfc07] font-mono font-bold uppercase tracking-wider">{v.subject} ({v.board})</span>
              </div>
            )
          },
          {
            header: "Qualifications",
            render: (v: any) => (
              <div>
                <p className="font-semibold text-white leading-none mb-1">{v.qualification}</p>
                <span className="text-[9px] text-zinc-500 font-mono">Exp required: {v.experience}</span>
              </div>
            )
          },
          {
            header: "Salary slab",
            render: (v: any) => (
              <span className="font-mono text-emerald-400 font-bold">{v.salary || "Negotiable"}</span>
            )
          },
          {
            header: "Job Description",
            render: (v: any) => (
              <p className="text-[10px] text-zinc-400 max-w-[200px] truncate leading-normal" title={v.description}>
                {v.description || "None"}
              </p>
            )
          },
          {
            header: "Delete",
            render: (v: any) => (
              <button
                onClick={() => onAction("delete", "vacancies", v.id)}
                className={`p-2 rounded-xl border transition-all ${
                  role === "Super Admin"
                    ? "hover:bg-red-500/10 text-zinc-500 hover:text-red-400 border-zinc-800 hover:border-red-500/30 cursor-pointer"
                    : "text-zinc-700 border-zinc-900 cursor-not-allowed"
                }`}
                disabled={role !== "Super Admin"}
                title={role === "Super Admin" ? "Delete vacancy permanently" : "Super Admin required"}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            ),
            className: "text-right w-16"
          }
        ]}
        data={vacancies}
        searchKeys={["schoolName", "title", "subject", "city"]}
        searchPlaceholder="Filter school job vacancies by school name, subject, title or city..."
        pageSize={10}
      />
    </Card>
  );
}
