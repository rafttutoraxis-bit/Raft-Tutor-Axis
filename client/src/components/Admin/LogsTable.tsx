import React from "react";
import { Activity, Download } from "lucide-react";
import Table from "../UI/Table";
import Card from "../UI/Card";
import Button from "../UI/Button";

interface LogsTableProps {
  logs: any[];
}

export default function LogsTable({ logs }: LogsTableProps) {
  const exportToCSV = () => {
    const headers = "ID,User,Action,IP,Timestamp\n";
    const rows = logs.map(lg => 
      `"${lg.id}","${lg.user}","${lg.action?.replace(/"/g, '""')}","${lg.ip}","${lg.timestamp}"`
    );

    const csvContent = headers + rows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `rta_logs_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Card variant="solid" hoverable={false}>
      <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-3 select-none">
        <span className="text-zinc-500 font-mono text-[9px] uppercase tracking-widest">Secured Security Trail</span>
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
        <div className="flex items-center gap-2 border-b border-[#9bfc07]/10 pb-3 select-none">
          <Activity className="w-5 h-5 text-purple-400" />
          <div>
            <h3 className="font-display font-bold text-xs uppercase tracking-wider text-white">
              Audit Trail and System Telemetry Logs
            </h3>
            <p className="text-[9px] text-zinc-500 font-mono mt-0.5">Live security logging and operations tracker</p>
          </div>
        </div>

        <Table
          columns={[
            {
              header: "User / Identity",
              render: (lg: any) => (
                <span className="text-[#9bfc07] font-bold font-mono">
                  [{lg.user || "System"}]
                </span>
              ),
              className: "w-1/4"
            },
            {
              header: "Action Operations Log",
              render: (lg: any) => (
                <span className="text-zinc-200">
                  {lg.action}
                </span>
              )
            },
            {
              header: "Client IP",
              render: (lg: any) => (
                <span className="font-mono text-[10px] text-zinc-500">
                  {lg.ip}
                </span>
              ),
              className: "w-32"
            },
            {
              header: "Timestamp Date",
              render: (lg: any) => (
                <span className="font-mono text-[10px] text-zinc-500">
                  {lg.timestamp ? new Date(lg.timestamp).toLocaleString() : "N/A"}
                </span>
              ),
              className: "w-44 text-right"
            }
          ]}
          data={logs}
          pageSize={15}
          emptyMessage="No system telemetry audit logs logged yet."
        />
      </div>
    </Card>
  );
}
