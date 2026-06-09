import React from "react";
import { Language } from "../types";

interface LogoProps {
  className?: string; // class name for the outer container
  textClassName?: string; // class name for the text block (if shown)
  variant?: "header" | "footer" | "iconOnly";
  lang?: Language;
}

export default function Logo({ className = "", textClassName = "", variant = "header", lang = "en" }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 tracking-tight select-none ${className}`} id="brand-logo-container">
      {/* SVG Icon matching the user's uploaded high-resolution vector precisely */}
      <div 
        className="w-10 h-10 bg-[#1b1631] flex items-center justify-center rounded-full shrink-0 shadow-lg border border-white/5 relative overflow-hidden"
        id="brand-logo-icon"
      >
        <svg
          viewBox="0 0 100 100"
          className="w-8 h-8 select-none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Head 1 / Tutor Head (Large Outer Circle) */}
          <circle 
            cx="50" 
            cy="23" 
            r="10.5" 
            stroke="#9bfc07" 
            strokeWidth="3" 
            fill="none" 
          />
          
          {/* Head 2 / Student Head (Small Circle offset lower-right) */}
          <circle 
            cx="61.5" 
            cy="37" 
            r="6.5" 
            stroke="#9bfc07" 
            strokeWidth="3" 
            fill="none" 
          />
          
          {/* Tutor Shoulder wide curve */}
          <path 
            d="M 23 51 A 27 27 0 0 1 77 51" 
            stroke="#9bfc07" 
            strokeWidth="3" 
            strokeLinecap="round" 
            fill="none" 
          />
          
          {/* Student Shoulder nested curve */}
          <path 
            d="M 44.5 51 A 15 15 0 0 1 73.5 51" 
            stroke="#9bfc07" 
            strokeWidth="3" 
            strokeLinecap="round" 
            fill="none" 
          />

          {/* Styled Open Book pages (Top Layer) */}
          <path 
            d="M 16 53 C 22 56 36 56 50 65" 
            stroke="#9bfc07" 
            strokeWidth="3" 
            strokeLinecap="round" 
            fill="none" 
          />
          <path 
            d="M 50 65 C 64 56 78 56 84 53" 
            stroke="#9bfc07" 
            strokeWidth="3" 
            strokeLinecap="round" 
            fill="none" 
          />

          {/* Double page effect (Middle Layer) */}
          <path 
            d="M 19 58 C 25 61 36 61 50 70 M 50 70 C 64 61 75 61 81 58" 
            stroke="#9bfc07" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            fill="none" 
          />

          {/* Book Bottom boundary ribbon with bottom center loop hook */}
          <path 
            d="M 16 63 C 30 63 42 63 45.5 63 C 47 66 45 70 50 70 C 55 70 53 66 54.5 63 C 58 63 70 63 84 63" 
            stroke="#9bfc07" 
            strokeWidth="3" 
            strokeLinecap="round" 
            fill="none" 
          />
        </svg>
      </div>
      
      {variant !== "iconOnly" && (
        <div className={`leading-none flex flex-col ${textClassName}`}>
          <span className="font-display font-black text-sm sm:text-base text-white uppercase tracking-tight leading-none">
            Raft Tutor Axis
          </span>
          <span className="text-[9px] text-[#9bfc07] uppercase tracking-widest font-extrabold mt-0.5 whitespace-nowrap">
            {lang === "en" ? "India's Growing Network" : "भारत का बढ़ता शिक्षक नेटवर्क"}
          </span>
        </div>
      )}
    </div>
  );
}
