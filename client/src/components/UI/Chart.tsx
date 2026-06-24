import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface ChartProps {
  type: "area" | "bar" | "pie";
  data: any[];
  dataKeys: string[];
  colors?: string[];
  labels?: string[];
  height?: number;
}

export const Chart: React.FC<ChartProps> = ({
  type,
  data,
  dataKeys,
  colors = ["#9bfc07", "#3b82f6", "#10b981", "#ef4444"],
  labels = [],
  height = 300,
}) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1b1631] border border-[#9bfc07]/25 p-3 rounded-xl shadow-xl text-xs font-mono text-white">
          <p className="font-bold text-[#9bfc07] mb-1">{label}</p>
          {payload.map((p: any, idx: number) => (
            <p key={idx} className="flex justify-between gap-6 py-0.5">
              <span className="text-zinc-400">{p.name || dataKeys[idx]}:</span>
              <span className="font-bold text-white">{p.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (type === "pie") {
    return (
      <div style={{ width: "100%", height }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="bottom" height={36} iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        {type === "area" ? (
          <AreaChart data={data}>
            <defs>
              {dataKeys.map((key, idx) => (
                <linearGradient key={key} id={`color-${key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors[idx % colors.length]} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={colors[idx % colors.length]} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#9bfc07" strokeOpacity={0.05} vertical={false} />
            <XAxis dataKey="name" stroke="#9bfc07" style={{ fontSize: 9, fontFamily: "monospace" }} tickLine={false} />
            <YAxis stroke="#9bfc07" style={{ fontSize: 9, fontFamily: "monospace" }} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="circle" />
            {dataKeys.map((key, idx) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                name={labels[idx] || key}
                stroke={colors[idx % colors.length]}
                strokeWidth={2}
                fillOpacity={1}
                fill={`url(#color-${key})`}
              />
            ))}
          </AreaChart>
        ) : (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#9bfc07" strokeOpacity={0.05} vertical={false} />
            <XAxis dataKey="name" stroke="#9bfc07" style={{ fontSize: 9, fontFamily: "monospace" }} tickLine={false} />
            <YAxis stroke="#9bfc07" style={{ fontSize: 9, fontFamily: "monospace" }} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="circle" />
            {dataKeys.map((key, idx) => (
              <Bar
                key={key}
                dataKey={key}
                name={labels[idx] || key}
                fill={colors[idx % colors.length]}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};
export default Chart;
