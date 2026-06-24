import React, { useState, useEffect } from "react";
import { Menu, X, Languages, Shield, HelpCircle, Phone, LayoutDashboard, LogOut, User } from "lucide-react";
import { Language } from "../types";
import { useAuth } from "../contexts/AuthContext";
import { useSettings } from "../contexts/SettingsContext";
import { useNavigate } from "react-router-dom";
import Logo from "./Logo";
import Button from "./UI/Button";

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
  const { user, logout } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
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
  ];

  // If user is logged in, show their dashboard portal button
  const getDashboardLabel = () => {
    if (!user) return "";
    if (user.role === "Super Admin" || user.role === "Operations Manager") return "";
    if (user.role === "Teacher") return "Teacher Portal";
    if (user.role === "Parent") return "Parent Panel";
    if (user.role === "School") return "School Workspace";
    return "";
  };

  return (
    <nav className={`fixed top-0 left-0 w-full z-45 transition-all duration-300 text-white ${
      isScrolled 
        ? "bg-[#1b1631] shadow-lg py-3 border-b border-[#9bfc07]/10" 
        : "bg-[#1b1631]/80 backdrop-blur-md py-4 sm:py-5"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        
        {/* Dynamic Settings Site Name / Brand Logo */}
        <div 
          onClick={() => onNavigate("home")} 
          className="cursor-pointer flex items-center gap-2"
        >
          {settings.logoUrl ? (
            <img src={settings.logoUrl} className="h-8 w-auto object-contain" alt="Logo" />
          ) : (
            <Logo lang={currentLang} />
          )}
        </div>

        {/* Desktop Menu links */}
        <div className="hidden lg:flex items-center gap-6 text-[10px] font-bold tracking-wider uppercase select-none">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => { onNavigate(item.id); setIsOpen(false); }}
              className={`hover:text-[#9bfc07] transition-all uppercase cursor-pointer ${
                activeSection === item.id 
                  ? "text-[#9bfc07] border-b-2 border-[#9bfc07] pb-1" 
                  : "text-white/80"
              }`}
            >
              {item.label}
            </button>
          ))}
          {user && getDashboardLabel() && (
            <button
              onClick={() => onNavigate("portal-workspace-console")}
              className="text-[#9bfc07] hover:text-white transition-all uppercase cursor-pointer"
            >
              {getDashboardLabel()}
            </button>
          )}
        </div>

        {/* Right controls */}
        <div className="hidden lg:flex items-center gap-4 select-none">
          
          {/* Quick Guide */}
          <button 
            onClick={onOpenOnboarding}
            className="flex items-center gap-1.5 p-2 rounded-lg bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
            title="Launch Interactive Walkthrough"
          >
            <HelpCircle className="w-4 h-4 text-[#9bfc07]" />
            <span>Guide</span>
          </button>

          {/* Multi-language Toggler */}
          <button
            onClick={() => onLanguageChange(currentLang === "en" ? "hi" : "en")}
            className="p-2 hover:bg-white/10 rounded-lg text-white flex items-center gap-1.5 text-[10px] font-bold uppercase cursor-pointer"
          >
            <Languages className="w-4 h-4 text-[#9bfc07]" />
            <span>{currentLang === "en" ? "हिन्दी" : "Eng"}</span>
          </button>

          {/* Dynamic Helpline Hotline Box */}
          <div className="text-right mr-2 leading-none hidden xl:block">
            <p className="text-[8px] text-[#9bfc07] font-extrabold uppercase tracking-widest">Support Line</p>
            <a 
              href={`tel:${settings.supportPhone}`} 
              className="text-xs font-black text-white mt-1 hover:text-[#9bfc07] transition-all block"
            >
              {settings.supportPhone}
            </a>
          </div>

          {/* Auth State Button */}
          {user ? (
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate("/login")}
              className="flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5" />
              <span>Portal Login</span>
            </Button>
          )}
        </div>

        {/* Mobile controls */}
        <div className="flex lg:hidden items-center gap-3">
          <button
            onClick={() => onLanguageChange(currentLang === "en" ? "hi" : "en")}
            className="p-2 hover:bg-white/10 rounded-lg text-white text-xs font-bold leading-none cursor-pointer"
          >
            <Languages className="w-4 h-4 text-[#9bfc07]" />
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
        <div className="lg:hidden absolute top-full left-0 w-full bg-[#1b1631] border-b border-[#9bfc07]/15 p-6 flex flex-col gap-4 shadow-xl animate-fade-in transition-all">
          <div className="flex flex-col gap-3.5 text-xs font-semibold uppercase tracking-wider">
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => { onNavigate(item.id); setIsOpen(false); }}
                className="hover:text-[#9bfc07] pl-1 py-1 text-left cursor-pointer border-l-2 border-transparent hover:border-[#9bfc07] transition-all text-white/90"
              >
                {item.label}
              </button>
            ))}
             {user && getDashboardLabel() && (
              <button
                onClick={() => { onNavigate("portal-workspace-console"); setIsOpen(false); }}
                className="text-[#9bfc07] hover:text-white pl-1 py-1 text-left cursor-pointer border-l-2 border-transparent transition-all font-bold"
              >
                {getDashboardLabel()}
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4 border-t border-[#9bfc07]/15 pt-5 text-center">
            <button
              onClick={() => { onOpenOnboarding(); setIsOpen(false); }}
              className="px-4 py-2 bg-white/5 text-white hover:bg-white/10 font-display font-medium rounded-lg text-[10px] text-center"
            >
              Interactive Guide
            </button>
            
            {user ? (
              <button
                onClick={() => { logout(); setIsOpen(false); }}
                className="px-4 py-2 bg-rose-600 text-white font-display font-medium rounded-lg text-[10px]"
              >
                Logout
              </button>
            ) : (
              <button
                onClick={() => { navigate("/login"); setIsOpen(false); }}
                className="px-4 py-2 bg-[#9bfc07] text-[#1b1631] font-display font-medium rounded-lg text-[10px]"
              >
                Portal Login
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
