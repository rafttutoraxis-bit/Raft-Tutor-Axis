import React from "react";
import { Sparkles, RefreshCw } from "lucide-react";
import Button from "../UI/Button";

interface AIReportProps {
  report: string;
  loading: boolean;
  onGenerate: () => void;
}

export default function AIReport({ report, loading, onGenerate }: AIReportProps) {
  return (
    <div className="bg-[#1b1631] border border-[#9bfc07]/15 rounded-2xl p-6 sm:p-10 shadow-xl relative text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#9bfc07]/10 pb-4 mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#9bfc07]/15 rounded-xl text-[#9bfc07]">
            <Sparkles className={`w-5 h-5 ${loading ? "animate-spin" : "animate-pulse"}`} />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm uppercase tracking-wider text-white">
              Gemini AI Strategic Market Analysis
            </h3>
            <p className="text-[9px] text-zinc-400 font-mono mt-0.5">
              Live executive summaries compiled from platform registrations telemetry
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={onGenerate}
          loading={loading}
          className="flex items-center gap-1.5 font-bold font-mono"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Compile New Report</span>
        </Button>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#9bfc07] mb-4" />
          <p className="font-semibold text-zinc-200 text-xs">Analyzing Student Registrations & Vetting Tutors...</p>
          <p className="text-[9px] text-zinc-500 font-mono mt-1">Checking active weights, city density, and billing conversions.</p>
        </div>
      ) : (
        <div className="text-zinc-300 leading-relaxed font-sans bg-black/40 p-6 rounded-xl border border-[#9bfc07]/5 font-mono text-[11px] whitespace-pre-wrap max-h-[500px] overflow-y-auto custom-scrollbar">
          {report || "Click 'Compile New Report' above to initialize strategic model summaries."}
        </div>
      )}
    </div>
  );
}
