import React from "react";
import Card from "../UI/Card";
import Chart from "../UI/Chart";

interface DashboardProps {
  parents: any[];
  teachers: any[];
  schools: any[];
  logs: any[];
  COLORS: string[];
}

export default function Dashboard({
  parents,
  teachers,
  schools,
  logs,
  COLORS
}: DashboardProps) {
  // Compute monthly growth data dynamically
  const getGrowthData = () => {
    // In our MERN app, we group creations by month
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentYear = new Date().getFullYear();
    
    const recordsByMonth: Record<string, { parents: number; teachers: number; schools: number }> = {};
    months.forEach(m => {
      recordsByMonth[m] = { parents: 0, teachers: 0, schools: 0 };
    });

    const populateGrowth = (arr: any[], key: "parents" | "teachers" | "schools") => {
      arr.forEach(item => {
        if (item.createdAt) {
          const date = new Date(item.createdAt);
          if (date.getFullYear() === currentYear) {
            const mLabel = months[date.getMonth()];
            if (recordsByMonth[mLabel]) {
              recordsByMonth[mLabel][key] += 1;
            }
          }
        }
      });
    };

    populateGrowth(parents, "parents");
    populateGrowth(teachers, "teachers");
    populateGrowth(schools, "schools");

    // Filter months with no registrations to make graph compact, or return all
    return months.map(m => ({
      name: m,
      Parents: recordsByMonth[m].parents,
      Teachers: recordsByMonth[m].teachers,
      Schools: recordsByMonth[m].schools
    }));
  };

  const getCitySpreadData = () => {
    const cities: Record<string, number> = {};
    parents.forEach(p => {
      const c = p.city ? p.city.trim() : "Other";
      cities[c] = (cities[c] || 0) + 1;
    });
    return Object.keys(cities).map(name => ({ city: name, inquiries: cities[name] }));
  };

  const getBoardDistributionData = () => {
    const cbse = parents.filter(p => p.board === "CBSE").length;
    const icse = parents.filter(p => p.board === "ICSE").length;
    const state = parents.filter(p => p.board === "State Board").length;

    return [
      { name: "CBSE Board", value: cbse },
      { name: "ICSE Board", value: icse },
      { name: "State Board", value: state }
    ];
  };

  const growthDataset = getGrowthData();
  const cityDataset = getCitySpreadData().slice(0, 5); // Take top 5 cities
  const boardDataset = getBoardDistributionData();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Growth Area Chart */}
        <Card variant="glass" className="lg:col-span-8" hoverable={false}>
          <div className="border-b border-[#9bfc07]/10 pb-3 mb-4 select-none">
            <h4 className="font-display font-bold text-xs uppercase tracking-wider text-[#9bfc07]">
              Platform Registrations Growth Profile
            </h4>
            <p className="text-[9px] text-zinc-400 font-mono mt-0.5">Live tracking for active year: {new Date().getFullYear()}</p>
          </div>
          
          <Chart
            type="area"
            data={growthDataset}
            dataKeys={["Teachers", "Parents", "Schools"]}
            colors={["#9bfc07", "#3b82f6", "#f43f5e"]}
            labels={["Tutors Onboarded", "Inquiries Logged", "Institutions"]}
            height={260}
          />
        </Card>

        {/* Board share distribution */}
        <Card variant="glass" className="lg:col-span-4" hoverable={false}>
          <div className="border-b border-[#9bfc07]/10 pb-3 mb-4 select-none">
            <h4 className="font-display font-bold text-xs uppercase tracking-wider text-[#9bfc07]">
              Tuition Board Distribution
            </h4>
            <p className="text-[9px] text-zinc-400 font-mono mt-0.5">Current student board demographics</p>
          </div>
          
          <Chart
            type="pie"
            data={boardDataset}
            dataKeys={["value"]}
            colors={COLORS}
            height={260}
          />
        </Card>
      </div>

      {/* City spread bar chart */}
      <Card variant="glass" hoverable={false}>
        <div className="border-b border-[#9bfc07]/10 pb-3 mb-4 select-none">
          <h4 className="font-display font-bold text-xs uppercase tracking-wider text-[#9bfc07]">
            Active City Registrations Density
          </h4>
          <p className="text-[9px] text-zinc-400 font-mono mt-0.5">Client inquiries density by regional zones</p>
        </div>

        <Chart
          type="bar"
          data={cityDataset.map(c => ({ name: c.city, Demands: c.inquiries }))}
          dataKeys={["Demands"]}
          colors={["#3b82f6"]}
          labels={["Inquiries"]}
          height={220}
        />
      </Card>
    </div>
  );
}
