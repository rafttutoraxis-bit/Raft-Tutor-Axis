import React from "react";

export default function AnalyticsCards() {
  return (
    <div className="grid grid-cols-4 gap-5">
      <div className="bg-slate-800 rounded-xl p-6 text-white">
        Total Parents
      </div>

      <div className="bg-slate-800 rounded-xl p-6 text-white">
        Teachers
      </div>

      <div className="bg-slate-800 rounded-xl p-6 text-white">
        Schools
      </div>

      <div className="bg-slate-800 rounded-xl p-6 text-white">
        Logs
      </div>
    </div>
  );
}
