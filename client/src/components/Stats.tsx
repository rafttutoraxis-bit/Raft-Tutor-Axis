import React, { useState, useEffect, useRef } from "react";
import { statsData } from "../data";
import { MapPin, Compass, Users, BookOpen } from "lucide-react";

interface StatsProps {
  lang: "en" | "hi";
}

export default function Stats({ lang }: StatsProps) {
  const [counts, setCounts] = useState([0, 0, 0, 0]);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          const duration = 1500; // ms
          const steps = 30;
          const intervalTime = duration / steps;
          
          let currentStep = 0;
          timer = setInterval(() => {
            currentStep++;
            setCounts(
              statsData.map(stat => {
                const target = stat.count;
                const currentVal = Math.round((target / steps) * currentStep);
                return currentVal > target ? target : currentVal;
              })
            );

            if (currentStep >= steps) {
              clearInterval(timer);
            }
          }, intervalTime);

          // Stop observing once animated
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.1,
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (timer) clearInterval(timer);
      observer.disconnect();
    };
  }, []);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "MapPin":
        return <MapPin className="w-6 h-6 text-[#9bfc07]" />;
      case "Compass":
        return <Compass className="w-6 h-6 text-[#9bfc07]" />;
      case "Users":
        return <Users className="w-6 h-6 text-[#9bfc07]" />;
      case "BookOpen":
        return <BookOpen className="w-6 h-6 text-[#9bfc07]" />;
      default:
        return <Compass className="w-6 h-6 text-[#9bfc07]" />;
    }
  };

  return (
    <section ref={sectionRef} className="py-12 bg-[#110d22] border-y border-[#9bfc07]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {statsData.map((stat, idx) => {
            const formattedVal = stat.count >= 1000 
              ? counts[idx].toLocaleString() + "+"
              : counts[idx] + "+";

            const borderClass = "border-b-4 border-[#9bfc07]";
            const textClass = "text-[#9bfc07]";

            return (
              <div 
                key={stat.label}
                className={`bg-brand-logo-dark border border-[#9bfc07]/15 p-6 rounded-2xl shadow-lg text-center transform hover:scale-[1.02] transition-all duration-300 flex flex-col items-center justify-center relative overflow-hidden ${borderClass}`}
              >
                
                {/* Background flare */}
                <div className="absolute top-[-20%] right-[-10%] w-16 h-16 bg-[#9bfc07]/10 rounded-full blur-xl" />

                {/* Styled icon container */}
                <div className="p-3 bg-[#110d22] border border-[#9bfc07]/15 rounded-xl mb-4 inline-block">
                  {getIcon(stat.icon)}
                </div>

                <p className={`font-display font-black text-2xl sm:text-3.5xl leading-none ${textClass}`}>
                  {formattedVal}
                </p>

                <h4 className="text-xs font-bold text-gray-300 mt-2.5 tracking-wide uppercase">
                  {lang === "en" ? stat.label : (
                    stat.label === "States Covered" ? "सक्रिय राज्य" :
                    stat.label === "Cities Presence" ? "शहरों में उपस्थिति" :
                    stat.label === "Verified Teachers" ? "सत्यापित शिक्षक" : "होम ट्यूशन पूर्ण"
                  )}
                </h4>

                <p className="text-[10px] text-[#9bfc07]/70 mt-1 font-mono">
                  {stat.desc}
                </p>

              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
