import React, { useState, useEffect } from "react";
import { Menu, X, Languages, Shield, HelpCircle, Phone } from "lucide-react";
import { Language } from "../types";
import Logo from "./Logo";

interface NavbarProps {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  onNavigate: (sectionId: string) => void;
  activeSection: string;
  onOpenOnboarding: () => void;
}

export default function Navbar({
  currentLang,
  onLanguageChange,
  onNavigate,
  activeSection,
  onOpenOnboarding
}: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const menuItems = [
    { id: "home", label: currentLang === "en" ? "Home" : "होम" },
    { id: "about", label: currentLang === "en" ? "About Us" : "हमारे बारे में" },
    { id: "services", label: currentLang === "en" ? "Services" : "सेवाएं" },
    { id: "inquiry-forms-section", label: currentLang === "en" ? "Register" : "पंजीकरण" },
    { id: "founders", label: currentLang === "en" ? "Founders" : "संस्थापक" },
    { id: "contact", label: currentLang === "en" ? "Contact" : "संपर्क" },
    { id: "admin-panel-console", label: currentLang === "en" ? "Staff Gate" : "स्टाफ" }
  ];

  return (
    <nav className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 text-white ${
      isScrolled 
        ? "bg-brand-logo-dark shadow-lg py-3 border-b border-brand-logo-green/10" 
        : "bg-brand-logo-dark py-4 sm:py-5"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        
        {/* Brand Logo Title */}
        <div 
          onClick={() => onNavigate("home")} 
          className="cursor-pointer"
        >
          <Logo lang={currentLang} />
        </div>

        {/* Desktop Menu links */}
        <div className="hidden lg:flex items-center gap-6 text-xs font-semibold tracking-wide uppercase">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => { onNavigate(item.id); setIsOpen(false); }}
              className={`hover:text-brand-logo-green transition-colors uppercase cursor-pointer ${
                activeSection === item.id 
                  ? "text-brand-logo-green font-bold border-b-2 border-brand-logo-green pb-1" 
                  : "text-white/80"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Right controls */}
        <div className="hidden lg:flex items-center gap-4">
          
          {/* Quick Guide */}
          <button 
            onClick={onOpenOnboarding}
            className="flex items-center gap-1.5 p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 text-[11px] font-bold uppercase tracking-wide transition-all cursor-pointer select-none"
            title="Launch Interactive Walkthrough"
          >
            <HelpCircle className="w-4 h-4 text-white" />
            <span>Guide</span>
          </button>

          {/* Multi-language Toggler */}
          <button
            onClick={() => onLanguageChange(currentLang === "en" ? "hi" : "en")}
            className="p-2 hover:bg-white/15 rounded-lg text-white flex items-center gap-1.5 text-[11px] font-bold uppercase cursor-pointer"
            title="Switch Language"
          >
            <Languages className="w-4 h-4" />
            <span>{currentLang === "en" ? "हिन्दी" : "Eng"}</span>
          </button>

          {/* Support desk indicator */}
          <div className="text-right mr-2 leading-none hidden xl:block">
            <p className="text-[9px] text-[#9bfc07]/80 font-extrabold uppercase tracking-widest">{currentLang === "en" ? "Support Desk" : "सहायता डेस्क"}</p>
            <p className="text-xs sm:text-sm font-black text-white mt-1">
              <a href="tel:6205355760" className="hover:text-[#9bfc07] transition-all">+91 62053 55760</a>
            </p>
          </div>

          {/* Hotline CTA */}
          <a
            href="tel:6205355760"
            className="px-4 py-2 bg-[#9bfc07] hover:bg-white text-[#1b1631] font-display font-semibold text-xs uppercase tracking-wider rounded-md transition-colors shadow-sm flex items-center gap-1.5"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>{currentLang === "en" ? "Call" : "कॉल"}</span>
          </a>
        </div>

        {/* Mobile controls & toggle button */}
        <div className="flex lg:hidden items-center gap-3">
          <button
            onClick={() => onLanguageChange(currentLang === "en" ? "hi" : "en")}
            className="p-2 hover:bg-white/10 rounded-lg text-white text-xs font-bold leading-none cursor-pointer"
          >
            <Languages className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-white hover:bg-white/10 rounded-lg focus:outline-none cursor-pointer"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-brand-logo-dark border-b border-brand-logo-green/15 p-6 flex flex-col gap-4 shadow-xl animate-fade-in transition-all">
          <div className="flex flex-col gap-3.5 text-xs font-semibold uppercase tracking-wider">
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => { onNavigate(item.id); setIsOpen(false); }}
                className="hover:text-brand-logo-green pl-1 py-1 text-left cursor-pointer border-l-2 border-transparent hover:border-brand-logo-green transition-all text-white/90"
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4 border-t border-brand-logo-green/15 pt-5">
            <button
              onClick={() => { onOpenOnboarding(); setIsOpen(false); }}
              className="px-4 py-2 bg-white/10 text-white hover:bg-white/20 font-display font-medium rounded-lg text-[11px] text-center"
            >
              Interactive Guide
            </button>
            <a
              href="tel:6205355760"
              className="px-4 py-2 bg-[#9bfc07] text-[#1b1631] font-display font-medium rounded-lg text-[11px] text-center"
            >
              Hotline call RTA
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
