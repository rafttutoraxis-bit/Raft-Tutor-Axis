import React from "react";
import { LayoutDashboard, Users, GraduationCap, Building, ClipboardList, Activity, Sparkles, Settings } from "lucide-react";

export type AdminTab = "analytics" | "parents" | "teachers" | "schools" | "vacancies" | "logs" | "ai" | "settings";

interface SidebarProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  counts: {
    parents: number;
    teachers: number;
    schools: number;
    vacancies: number;
    logs: number;
  };
}

export default function Sidebar({ activeTab, setActiveTab, counts }: SidebarProps) {
  const menuItems = [
    { id: "analytics", label: "Analytics", icon: LayoutDashboard },
    { id: "parents", label: "Parents", icon: Users, count: counts.parents },
    { id: "teachers", label: "Teachers", icon: GraduationCap, count: counts.teachers },
    { id: "schools", label: "Schools", icon: Building, count: counts.schools },
    { id: "vacancies", label: "Vacancies", icon: ClipboardList, count: counts.vacancies },
    { id: "logs", label: "System Logs", icon: Activity, count: counts.logs },
    { id: "ai", label: "Gemini AI Report", icon: Sparkles },
    { id: "settings", label: "Site Settings", icon: Settings },
  ];

  return (
    <aside className="bg-[#1b1631] border border-[#9bfc07]/15 rounded-2xl p-5 text-white h-full space-y-6 select-none shadow-xl">
      <div className="border-b border-[#9bfc07]/10 pb-4">
        <h2 className="font-display font-extrabold text-sm tracking-widest text-[#9bfc07] uppercase">
          Control Deck
        </h2>
        <p className="text-[9px] text-zinc-400 font-mono tracking-wider mt-0.5">RAFT TUTOR AXIS v2.0</p>
      </div>

      <nav className="space-y-1.5 text-xs font-semibold uppercase tracking-wider">
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as AdminTab)}
              className={`w-full flex items-center justify-between p-3.5 rounded-xl transition-all cursor-pointer group ${
                isActive
                  ? "bg-[#9bfc07] text-[#1b1631] font-bold shadow-md shadow-[#9bfc07]/15 scale-102"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4.5 h-4.5 transition-colors ${isActive ? "text-[#1b1631]" : "text-[#9bfc07]/70 group-hover:text-[#9bfc07]"}`} />
                <span>{item.label}</span>
              </div>
              {item.count !== undefined && (
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold leading-none ${
                  isActive 
                    ? "bg-[#110d22] text-[#9bfc07]" 
                    : "bg-[#110d22] text-zinc-400 border border-[#9bfc07]/10"
                }`}>
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
