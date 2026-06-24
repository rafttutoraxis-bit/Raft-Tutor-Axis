import React from "react";
import { Users, GraduationCap, Building, IndianRupee, CheckCircle, ShieldAlert } from "lucide-react";
import Card from "../UI/Card";

interface AnalyticsCardsProps {
  counts: {
    parents: number;
    teachers: number;
    schools: number;
    verifiedTeachers: number;
    pendingPayments: number;
    totalRevenue: number;
  };
}

export default function AnalyticsCards({ counts }: AnalyticsCardsProps) {
  const cards = [
    {
      label: "Client Base",
      value: counts.parents,
      desc: "Parent inquiries mapped",
      icon: Users,
      color: "text-blue-400 bg-blue-500/10 border-blue-500/20"
    },
    {
      label: "Talent Roster",
      value: counts.teachers,
      desc: `${counts.verifiedTeachers} verified active members`,
      icon: GraduationCap,
      color: "text-[#9bfc07] bg-[#9bfc07]/10 border-[#9bfc07]/20"
    },
    {
      label: "Institutions",
      value: counts.schools,
      desc: "School tie-up inquiries",
      icon: Building,
      color: "text-purple-400 bg-purple-500/10 border-purple-500/20"
    },
    {
      label: "Total Revenue",
      value: `₹${counts.totalRevenue}`,
      desc: `${counts.pendingPayments} payments pending review`,
      icon: IndianRupee,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 select-none">
      {cards.map((c, idx) => {
        const Icon = c.icon;
        return (
          <Card key={idx} variant="glass" className="flex items-center justify-between">
            <div className="space-y-1.5 flex-1">
              <span className="text-[10px] uppercase tracking-widest font-mono text-zinc-400">{c.label}</span>
              <p className="text-2xl font-display font-black text-white leading-none">{c.value}</p>
              <p className="text-[10px] text-zinc-500 leading-none">{c.desc}</p>
            </div>
            <div className={`p-3 rounded-xl border shrink-0 ${c.color}`}>
              <Icon className="w-5 h-5" />
            </div>
          </Card>
        );
      })}
    </div>
  );
}
