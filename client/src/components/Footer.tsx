import React from "react";
import { Phone, Mail, MapPin, ShieldCheck, Globe } from "lucide-react";
import Logo from "./Logo";

interface FooterProps {
  lang: "en" | "hi";
  onNavigate: (sectionId: string) => void;
}

export default function Footer({ lang, onNavigate }: FooterProps) {
  // Navigation mapping for "QUICK PORTALS"
  const portals = [
    { label: lang === "en" ? "Home (Statistics)" : "होम (सांख्यिकी)", id: "home" },
    { label: lang === "en" ? "About Company" : "कंपनी के बारे में", id: "about" },
    { label: lang === "en" ? "Educational Services" : "शैक्षणिक सेवाएं", id: "services" },
    { label: lang === "en" ? "Find Home Tutor" : "होम ट्यूटर खोजें", id: "find-tutor" },
    { label: lang === "en" ? "Become a Teacher (Apply)" : "शिक्षक बनें (आवेदन करें)", id: "apply" },
    { label: lang === "en" ? "School Staff Recruitment" : "स्कूल स्टाफ भर्ती", id: "school-staff" }
  ];

  return (
    <footer className="bg-[#1b1631] text-white border-t border-brand-logo-green/10 transition-colors duration-300 pt-16 pb-8" id="contact">
      
      {/* Footer Primary Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
        
        {/* Column 1: Logo & About description */}
        <div className="lg:col-span-4 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <Logo lang={lang} />
            <p className="text-sm text-gray-300 leading-relaxed font-sans">
              {lang === "en" 
                ? "North India's elite and most trusted educational teacher providing platform. Bridging certified subject educators, school administrators, and students with absolute verification guarantees."
                : "उत्तर भारत का संभ्रांत और सबसे भरोसेमंद शिक्षक प्रदाता मंच। पूर्ण सत्यापन गारंटी के साथ प्रमाणित विषय शिक्षकों, स्कूल प्रशासकों और छात्रों को जोड़ता है।"}
            </p>
          </div>

          {/* ISO COMPLIANCE badge */}
          <div className="bg-[#110d22] border border-[#9bfc07]/20 rounded-xl p-4 flex items-center gap-3.5 max-w-sm mt-2 shadow-inner">
            <div className="w-10 h-10 rounded-lg bg-[#9bfc07]/10 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-[#9bfc07]" />
            </div>
            <div>
              <p className="text-[10px] text-[#9bfc07] font-black uppercase tracking-widest leading-none">
                ISO COMPLIANCE
              </p>
              <p className="text-white text-sm font-extrabold mt-1">
                100% Verified Tutors
              </p>
            </div>
          </div>
        </div>

        {/* Column 2: QUICK PORTALS */}
        <div className="lg:col-span-3">
          <h3 className="font-display font-black text-sm uppercase tracking-wider text-white border-b border-[#9bfc07]/10 pb-3 mb-5">
            {lang === "en" ? "QUICK PORTALS" : "त्वरित पोर्टल"}
          </h3>
          <ul className="space-y-3.5 text-sm">
            {portals.map((portal) => (
              <li key={portal.id}>
                <button
                  onClick={() => onNavigate(portal.id)}
                  className="text-gray-300 hover:text-[#9bfc07] transition-all cursor-pointer text-left font-medium flex items-center gap-2 hover:translate-x-1 duration-200"
                >
                  <span className="text-[#9bfc07]/40 text-xs">■</span>
                  <span>{portal.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3: HEADQUARTERS & HELPLINES */}
        <div className="lg:col-span-5">
          <h3 className="font-display font-black text-sm uppercase tracking-wider text-white border-b border-[#9bfc07]/10 pb-3 mb-5">
            {lang === "en" ? "HEADQUARTERS & HELPLINES" : "मुख्यालय और हेल्पलाइन"}
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Left Inner Sub-Column */}
            <div className="space-y-6">
              {/* Office address */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[#9bfc07]">
                  <MapPin className="w-5 h-5" />
                  <span className="font-bold text-xs uppercase tracking-widest">
                    {lang === "en" ? "Principal Office" : "प्रधान कार्यालय"}
                  </span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed pl-7">
                  Vrindavan Chokdi, Vadodara, Gujarat - 390019
                </p>
              </div>

              {/* Support Email */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[#9bfc07]">
                  <Mail className="w-5 h-5" />
                  <span className="font-bold text-xs uppercase tracking-widest">
                    {lang === "en" ? "Support Email" : "सहायता ईमेल"}
                  </span>
                </div>
                <p className="text-xs text-gray-300 pl-7 text-wrap break-all">
                  <a href="mailto:info@rafttutoraxis.com" className="hover:underline hover:text-[#9bfc07] transition-all font-bold">
                    info@rafttutoraxis.com
                  </a>
                </p>
              </div>
            </div>

            {/* Right Inner Sub-Column with the colored ring numbers */}
            <div className="space-y-5">
              {/* Helpline 1: PK Singh */}
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-full bg-[#110d22] border border-[#9bfc07]/20 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-[#9bfc07]" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wide leading-none">
                    PK Singh (Founder Helpline)
                  </p>
                  <a 
                    href="tel:7255941761" 
                    className="text-[#9bfc07] text-base font-black hover:underline tracking-tight block mt-1.5"
                  >
                    +91 7255941761
                  </a>
                </div>
              </div>

              {/* Helpline 2: Bhushan Gaurav */}
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-full bg-[#110d22] border border-[#9bfc07]/20 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-[#9bfc07]" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wide leading-none">
                    Bhushan Gaurav (Co-Founder)
                  </p>
                  <a 
                    href="tel:6205355760" 
                    className="text-[#9bfc07] text-base font-black hover:underline tracking-tight block mt-1.5"
                  >
                    +91 6205355760
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Map Location Operating Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-12">
        <div className="bg-[#110d22] border border-brand-logo-green/10 rounded-xl px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-2.5 text-xs text-gray-300 font-sans tracking-tight">
            <span className="text-rose-500 text-base">📍</span>
            <span className="font-medium">
              {lang === "en" 
                ? "Operating across Bihar, UP & Gujarat" 
                : "बिहार, यूपी और गुजरात में संचालित"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs font-black tracking-widest text-white uppercase select-none">
            <span className="text-xs">{lang === "en" ? "MAP ONLINE" : "नक्शा ऑनलाइन"}</span>
            <Globe className="w-4 h-4 text-[#9bfc07] animate-pulse" />
          </div>
        </div>
      </div>

      {/* Ground Footnote */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-10 pt-6 border-t border-brand-logo-green/10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-gray-400 font-sans">
          <p className="text-center md:text-left">
            &copy; 2026 Raft Tutor Axis (RTA). All Rights Reserved. Branded educational provider.
          </p>
          <div className="flex items-center gap-3 font-mono text-[10px] uppercase text-gray-400 select-none">
            <span>PK Singh PBX Support</span>
            <span className="text-brand-logo-green/40">•</span>
            <span>Bhushan Gaurav PBX Support</span>
          </div>
        </div>
      </div>

    </footer>
  );
}
