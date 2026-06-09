import React from "react";
import { Phone, CheckSquare, Sparkles, GraduationCap, Compass, BookOpen } from "lucide-react";

interface HeroProps {
  lang: "en" | "hi";
  onNavigate: (sectionId: string) => void;
}

export default function Hero({ lang, onNavigate }: HeroProps) {
  return (
    <section 
      className="relative pt-28 sm:pt-36 pb-20 sm:pb-28 bg-[#110d22] overflow-hidden" 
      id="home"
    >
      
      {/* Visual Ambient Rings */}
      <div className="absolute top-1/4 right-0 w-80 h-80 bg-[#9bfc07]/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-10 left-[-100px] w-96 h-96 bg-brand-logo-dark/40 rounded-full blur-3xl animate-pulse" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 flex flex-col items-center text-center">
        
        {/* Badge Indicator */}
        <span className="bg-[#9bfc07]/15 text-[#9bfc07] border border-[#9bfc07]/30 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-6 inline-block shadow-sm">
          ⚡ {lang === "en" ? "2 Days Free Demo" : "2 दिन का मुफ्त डेमो"}
        </span>

        {/* Primary Title Display */}
        <h1 className="font-display font-black text-5xl sm:text-7xl md:text-8xl text-white leading-[0.9] mb-4 uppercase tracking-tighter">
          RTA Home <br className="hidden sm:block" />
          <span className="text-[#9bfc07]">Tuition</span>
        </h1>

        {/* Subtitle / City Display */}
        <p className="font-sans text-xl sm:text-2xl text-[#9bfc07] font-black mb-3 uppercase tracking-wider">
          {lang === "en" ? "Bihar, UP & Gujarat" : "बिहार, यूपी और गुजरात"}
        </p>

        {/* Vetted Hindi subtitle prompt */}
        <p className="max-w-xl mx-auto text-base sm:text-lg text-gray-300 leading-tight mb-8 font-medium">
          होम ट्यूशन के लिए योग्य एवं अनुभवी शिक्षक के लिए संपर्क करें।
        </p>

        {/* CTA Actions Panel */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-xl mb-12">
          
          <button
            onClick={() => onNavigate("inquiry-forms-section")}
            className="w-full sm:w-auto bg-[#9bfc07] hover:bg-white text-[#1b1631] px-7 py-3.5 rounded-lg text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer select-none"
          >
            {lang === "en" ? "Book Free Demo" : "डेमो बुक करें"}
          </button>

          <button
            onClick={() => onNavigate("inquiry-forms-section")}
            className="w-full sm:w-auto border-2 border-[#9bfc07] text-[#9bfc07] px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-[#9bfc07] hover:text-[#1b1631] transition-all cursor-pointer select-none"
          >
            {lang === "en" ? "Find a Tutor" : "ट्यूटर खोजें"}
          </button>

          <button
            onClick={() => onNavigate("inquiry-forms-section")}
            className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white px-7 py-3.5 rounded-lg text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg border border-white/15 transition-all cursor-pointer select-none"
          >
            {lang === "en" ? "Become a Teacher" : "शिक्षक बनें"}
          </button>
        </div>

        {/* Verification / Callout list */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-4xl border-t border-brand-logo-green/10 pt-10">
          
          {/* Item 1 */}
          <div className="flex items-center gap-4 justify-start sm:justify-center w-full max-w-[280px] sm:max-w-none mx-auto">
            <div className="p-2.5 bg-[#9bfc07]/10 text-[#9bfc07] border border-[#9bfc07]/15 rounded-lg shrink-0">
              <Phone className="w-5 h-5 text-[#9bfc07]" />
            </div>
            <div className="text-left font-mono">
              <h5 className="text-[10px] uppercase font-bold text-gray-400">RTA Helpline (Operations)</h5>
              <a href="tel:6205355760" className="text-sm font-bold text-white hover:text-[#9bfc07] transition-all">6205355760</a>
            </div>
          </div>

          {/* Item 2 */}
          <div className="flex items-center gap-4 justify-start sm:justify-center w-full max-w-[280px] sm:max-w-none mx-auto">
            <div className="p-2.5 bg-[#9bfc07]/10 text-[#9bfc07] border border-[#9bfc07]/15 rounded-lg shrink-0">
              <Phone className="w-5 h-5 text-[#9bfc07]" />
            </div>
            <div className="text-left font-mono">
              <h5 className="text-[10px] uppercase font-bold text-gray-400">Founder Connect</h5>
              <a href="tel:7255941761" className="text-sm font-bold text-white hover:text-[#9bfc07] transition-all">7255941761</a>
            </div>
          </div>

          {/* Item 3 */}
          <div className="flex items-center gap-4 justify-start sm:justify-center w-full max-w-[280px] sm:max-w-none mx-auto sm:col-span-2 md:col-span-1">
            <div className="p-2.5 bg-[#9bfc07]/10 text-[#9bfc07] border border-[#9bfc07]/15 rounded-lg shrink-0">
              <GraduationCap className="w-5 h-5 text-[#9bfc07]" />
            </div>
            <div className="text-left">
              <h5 className="text-[10px] uppercase font-bold text-gray-400">Verified Network</h5>
              <p className="text-xs font-bold text-white">
                40,000+ Expert Tutors
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
