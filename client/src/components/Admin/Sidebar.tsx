import React from "react";

export default function Sidebar() {
  return (
    <div className="bg-slate-900 rounded-xl p-5 text-white">
      <h2 className="font-bold text-xl mb-4">
        Navigation
      </h2>

      <div className="space-y-2">
        <button className="w-full text-left p-2 rounded bg-blue-600">
          Analytics
        </button>

        <button className="w-full text-left p-2 rounded hover:bg-slate-800">
          Parents
        </button>

        <button className="w-full text-left p-2 rounded hover:bg-slate-800">
          Teachers
        </button>

        <button className="w-full text-left p-2 rounded hover:bg-slate-800">
          Schools
        </button>

        <button className="w-full text-left p-2 rounded hover:bg-slate-800">
          Logs
        </button>
      </div>
    </div>
  );
}
