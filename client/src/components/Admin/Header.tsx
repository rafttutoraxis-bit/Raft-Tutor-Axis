import React from "react";
import { Shield, RefreshCw, LogOut } from "lucide-react";
import Button from "../UI/Button";

interface HeaderProps {
  username: string;
  role: string;
  onRefresh: () => void;
  onLogout: () => void;
}

export default function Header({ username, role, onRefresh, onLogout }: HeaderProps) {
  return (
    <div className="bg-[#1b1631] border border-[#9bfc07]/15 rounded-2xl p-6 text-white mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xl">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-[#9bfc07]/10 border border-[#9bfc07]/25 rounded-xl text-[#9bfc07]">
          <Shield className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <h1 className="text-lg font-display font-extrabold uppercase tracking-wider text-white">
            Administration Control Deck
          </h1>
          <p className="text-[10px] text-zinc-400 font-mono tracking-wide mt-0.5">
            LOGGED: <span className="text-white font-bold select-all">{username}</span> | ROLE: <span className="text-[#9bfc07] font-bold">{role}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3.5 select-none w-full sm:w-auto shrink-0 justify-end">
        <Button
          variant="secondary"
          size="sm"
          onClick={onRefresh}
          className="flex items-center gap-1.5"
          title="Force refresh data feeds"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </Button>
        <Button
          variant="danger"
          size="sm"
          onClick={onLogout}
          className="flex items-center gap-1.5"
          title="Deauthorize session token"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Logout</span>
        </Button>
      </div>
    </div>
  );
}
