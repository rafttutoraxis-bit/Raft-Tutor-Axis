import React, { useState, useEffect } from "react";
import { Check, ArrowRight, Star, Heart, Activity, Sparkles, Navigation, Award, BookOpen, Users, Compass, Globe } from "lucide-react";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Stats from "./components/Stats";
import Forms from "./components/Forms";
import ChatBot from "./components/ChatBot";
import OnboardingFlow from "./components/OnboardingFlow";
import Footer from "./components/Footer";

// Context Hooks & Portals
import { useAuth } from "./contexts/AuthContext";
import { useSettings } from "./contexts/SettingsContext";
import AdminPanel from "./components/AdminPanel";
import TeacherDashboard from "./components/Teacher/TeacherDashboard";
import ParentDashboard from "./components/Parent/ParentDashboard";
import SchoolDashboard from "./components/School/SchoolDashboard";

import { servicesData, whyChooseBenefits, founderCardsList, dummyTestimonials } from "./data";
import { Language } from "./types";

export default function App() {
  const { user } = useAuth();
  const { settings, loading: settingsLoading } = useSettings();
  const [lang, setLang] = useState<Language>("en");
  const [activeSection, setActiveSection] = useState("home");
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Auto-reload synchronization key to notify Admin of database changes
  const [syncKey, setSyncKey] = useState(0);

  // Trigger onboarding on first visit based on session memory, and ensure dark mode is removed from document root
  useEffect(() => {
    document.documentElement.classList.add("dark"); // Default to dynamic dark theme
    const hasVisited = localStorage.getItem("rta_visited_onboarding");
    if (!hasVisited) {
      setShowOnboarding(true);
      localStorage.setItem("rta_visited_onboarding", "true");
    }
  }, []);

  // Redirect Admins away from the public landing page to the secure /admin route
  useEffect(() => {
    if (user && (user.role === "Super Admin" || user.role === "Operations Manager")) {
      window.location.href = "/admin";
    }
  }, [user]);

  const toggleLanguage = (selectedLang: Language) => {
    setLang(selectedLang);
  };

  // Handle smooth scroll navigation
  const handleScrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const triggerAdminRefresh = () => {
    setSyncKey(prev => prev + 1);
  };

  // Renders correct portal dashboard based on user role
  const renderDashboardPortal = () => {
    if (!user) {
      return (
        <AdminPanel 
          lang={lang} 
          onForceRefresh={triggerAdminRefresh} 
          mode="user"
        />
      );
    }

    switch (user.role) {
      case "Super Admin":
      case "Operations Manager":
        return (
          <div className="py-20 flex flex-col items-center justify-center text-white">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#9bfc07] mb-4" />
            <p className="text-xs font-mono">Redirecting to Secure Portal Workspace...</p>
          </div>
        );
      case "Teacher":
        return <TeacherDashboard />;
      case "Parent":
        return <ParentDashboard />;
      case "School":
        return <SchoolDashboard />;
      default:
        return (
          <AdminPanel 
            lang={lang} 
            onForceRefresh={triggerAdminRefresh} 
            mode="user"
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#110d22] text-white transition-colors duration-300">
      
      {/* Dynamic Interactive Guide overlay */}
      {showOnboarding && (
        <OnboardingFlow 
          lang={lang} 
          onClose={() => setShowOnboarding(false)} 
        />
      )}
      
      {/* Corporate Sticky Navbar */}
      <Navbar 
        currentLang={lang} 
        onLanguageChange={toggleLanguage} 
        onNavigate={handleScrollToSection}
        activeSection={activeSection}
        onOpenOnboarding={() => setShowOnboarding(true)}
      />

      {/* Landing Banner Screen */}
      <Hero 
        lang={lang} 
        onNavigate={handleScrollToSection} 
      />

      {/* Dynamic Count Stats Grid */}
      <Stats lang={lang} />

      {/* About Us Segment */}
      <section className="py-20 bg-[#1b1631] border-b border-[#9bfc07]/5" id="about">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
            
            <div className="md:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#9bfc07]/10 border border-[#9bfc07]/25 text-[#9bfc07] text-xs font-semibold uppercase tracking-wider">
                <Globe className="w-3.5 h-3.5" />
                <span>{lang === "en" ? "India's Growing Teacher Network" : "भारत का बढ़ता शिक्षक नेटवर्क"}</span>
              </div>

              <h2 className="font-display font-bold text-3xl sm:text-4xl text-white leading-tight">
                {lang === "en" ? "India's Growing Teacher Network" : "राफ्ट ट्यूटर एक्सिस - भारत का बढ़ता शिक्षक नेटवर्क"}
              </h2>

              <div className="text-sm text-gray-300 leading-relaxed space-y-4 font-mono text-zinc-300">
                <p>{lang === "en" ? "Raft Tutor Axis is a trusted teacher-providing platform dedicated to connecting qualified educators with schools, institutes, and students across India." : "राफ्ट ट्यूटर एक्सिस एक विश्वसनीय शिक्षक-प्रदाता मंच है जो पूरे भारत में योग्य शिक्षकों को स्कूलों, संस्थानों और छात्रों से जोड़ने के लिए समर्पित है।"}</p>
                <p>{lang === "en" ? "Our mission is to make quality education accessible by providing skilled and verified teachers for academic institutions as well as personalized home tuition services." : "हमारा उद्देश्य शैक्षणिक संस्थानों के लिए कुशल और सत्यापित शिक्षक प्रदान करने के साथ-साथ व्यक्तिगत रूप से होम ट्यूशन सेवाएं प्रदान करके गुणवत्तापूर्ण शिक्षा को सुलभ बनाना है।"}</p>
                <p>{lang === "en" ? "With a strong presence across multiple states and cities, we have built a vast network of experienced educators to meet diverse learning needs." : "कई राज्यों और शहरों में मजबूत उपस्थिति के साथ, हमने विविध शिक्षण आवश्यकताओं को पूरा करने के लिए अनुभवी शिक्षकों का एक विशाल नेटवर्क बनाया है।"}</p>
              </div>

              <div className="border-l-4 border-[#9bfc07] pl-4 py-1 italic font-medium text-[#9bfc07] text-sm">
                "{lang === "en" ? "We believe that the right teacher can transform a student's future." : "हमारा विश्वास है कि सही शिक्षक छात्र के भविष्य को बदल सकता है।"}"
              </div>
            </div>

            <div className="md:col-span-5 relative">
              <div className="aspect-square bg-[#110d22] rounded-2xl overflow-hidden shadow-2xl relative border border-[#9bfc07]/10">
                <img 
                  src="/tutor.png"
                  alt="Tutoring" 
                  className="w-full h-full object-cover opacity-90 filter brightness-90 transition-all duration-500 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
                  <div className="text-white text-xs">
                    <p className="font-bold uppercase tracking-wider text-[#9bfc07]">Empowering Education</p>
                    <p className="mt-1 text-gray-300">Personalized trial schedules for higher secondary scholars.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Services Portfolio Grid */}
      <section className="py-20 bg-[#110d22] border-b border-[#9bfc07]/5" id="services">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-display font-semibold text-3xl text-white mb-2 uppercase tracking-wide">
              {lang === "en" ? "Our Vast Educational Solutions" : "हमारी विस्तृत शैक्षणिक सेवाएं"}
            </h2>
            <p className="text-xs text-zinc-450 uppercase tracking-widest leading-relaxed">
              {lang === "en" 
                ? "Providing optimized localized matchmaking for private academic boards and public coaches."
                : "निजी शैक्षणिक बोर्डों और सार्वजनिक कोचिंग संस्थानों के लिए स्थानीयकृत मिलान समाधान।"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {servicesData.map(service => (
              <div
                key={service.id}
                className="bg-[#1b1631] border border-[#9bfc07]/10 p-6 rounded-2xl shadow-lg hover:shadow-2xl hover:border-[#9bfc07]/30 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <span className="px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-widest rounded-md bg-[#9bfc07]/10 text-[#9bfc07] mb-4 inline-block">
                    RTA Certified
                  </span>
                  <h3 className="font-display font-semibold text-base text-white mb-2">
                    {lang === "en" ? service.title.en : service.title.hi}
                  </h3>
                  <p className="text-xs text-gray-300 leading-relaxed mb-4">
                    {lang === "en" ? service.desc.en : service.desc.hi}
                  </p>
                </div>
                <div className="text-[11px] font-mono text-[#9bfc07] bg-[#110d22] p-3 rounded-lg border border-[#9bfc07]/10 leading-normal">
                  💎 {service.details}
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 bg-[#1b1631] border-b border-[#9bfc07]/5" id="why-choose">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-lg mx-auto mb-12">
            <h2 className="font-display font-semibold text-2xl text-white mb-2 uppercase tracking-wide">
              {lang === "en" ? "Why We Excel" : "क्यों हम सर्वश्रेष्ठ हैं"}
            </h2>
            <p className="text-[11px] text-gray-300 uppercase tracking-widest leading-relaxed">
              Proven milestones mapping experienced educators directly to student boards.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {whyChooseBenefits.map(benefit => (
              <div 
                key={benefit.title}
                className="p-5 border border-[#9bfc07]/10 bg-[#110d22]/50 hover:bg-[#110d22] rounded-xl relative hover:border-[#9bfc07]/30 hover:shadow-md transition-all"
              >
                <div className="h-6 w-6 rounded-full bg-[#9bfc07]/10 text-[#9bfc07] flex items-center justify-center font-display font-semibold mb-3">
                  ✓
                </div>
                <h4 className="font-display font-semibold text-xs text-white mb-1 tracking-wide">
                  {benefit.title}
                </h4>
                <p className="text-[11px] text-gray-350 leading-relaxed">
                  {benefit.desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Parents & Teachers Interactive Registration Wizards */}
      <Forms 
        lang={lang} 
        onNewRegistration={triggerAdminRefresh} 
      />

      {/* Meet Our Founders Section */}
      <section className="py-16 bg-[#110d22] border-b border-[#9bfc07]/5" id="founders">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-lg mx-auto mb-12">
            <h2 className="font-display font-semibold text-2xl text-white mb-2 uppercase tracking-wider">
              Meet Our Visionaries
            </h2>
            <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-mono">
              The force guiding strategic tutoring placement and operations in North India.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {founderCardsList.map(founder => (
              <div 
                key={founder.name}
                className="bg-[#1b1631] border border-[#9bfc07]/10 rounded-2xl overflow-hidden shadow-lg flex flex-col hover:shadow-2xl hover:border-[#9bfc07]/30 transition-all duration-300"
              >
                <div className="h-80 sm:h-[420px] relative bg-[#110d22]">
                  <img
                    src={founder.image}
                    alt={founder.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover grayscale brightness-95 hover:grayscale-0 hover:brightness-100 transition-all duration-300"
                  />
                  <div className="absolute bottom-4 left-4 bg-[#1b1631]/90 px-3 py-1.5 text-[10px] uppercase font-mono tracking-widest text-[#9bfc07] rounded-md border border-[#9bfc07]/20">
                    {founder.role}
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  <h3 className="font-display font-semibold text-base text-white flex items-center gap-1.5 leading-none">
                    {founder.name}
                  </h3>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    {founder.bio}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Sliding Testimonials slider */}
      <section className="py-16 bg-[#1b1631]" id="testimonials">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          
          <h2 className="font-display font-semibold text-2xl text-white mb-10 uppercase tracking-wider">
            Voices of Trust
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            {dummyTestimonials.map((t, idx) => (
              <div 
                key={idx}
                className="p-6 bg-[#110d22] border border-[#9bfc07]/10 rounded-2xl relative shadow-lg hover:border-[#9bfc07]/30 transition-all"
              >
                <div className="flex gap-1 mb-3.5">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-[#9bfc07] text-[#9bfc07]" />
                  ))}
                </div>
                <p className="text-xs text-gray-300 italic leading-relaxed mb-4">
                  "{t.text}"
                </p>
                <div>
                  <h5 className="font-display font-semibold text-xs text-white">{t.author}</h5>
                  <p className="text-[10px] text-[#9bfc07] font-mono mt-0.5">{t.role}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Unified Portal Workspace Console (Teacher, Parent, School) */}
      {user && (
        <section className="py-16 bg-[#110d22]/90 border-t border-[#9bfc07]/10" id="portal-workspace-console">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div key={syncKey}>
              {renderDashboardPortal()}
            </div>
          </div>
        </section>
      )}

      {/* Consolidated Footer detailing contacts and Maps */}
      <Footer 
        lang={lang} 
        onNavigate={handleScrollToSection} 
      />

      {/* Floating 24/7 client assistant powered server side by Gemini */}
      <ChatBot lang={lang} />

    </div>
  );
}
