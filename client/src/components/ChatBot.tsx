import React, { useState } from "react";
import { MessageCircle, X, Send, PhoneCall, CheckCircle, ArrowUpRight, HelpCircle, HelpCircle as HelpIcon, Sparkles } from "lucide-react";

interface ChatBotProps {
  lang: "en" | "hi";
}

export default function ChatBot({ lang }: ChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customMessage, setCustomMessage] = useState("");
  const [selectedRecipient, setSelectedRecipient] = useState<"operations" | "director">("operations");

  const whatsappNumbers = {
    operations: "916205355760", // Helpdesk Operations
    director: "917255941761"    // Academic Director Desk
  };

  const presets = lang === "en" ? [
    {
      id: "parent",
      label: "Find a Home Tutor",
      description: "Ask for trial schedules, tutor profiles, and fees for your child",
      text: "Hello Raft Tutor Axis, I am a Parent looking for a qualified home tutor. Please guide me on trial schedules and fee details."
    },
    {
      id: "teacher",
      label: "Register as Tutor / Teacher",
      description: "Submit your qualifications and register for teaching vacancies",
      text: "Hello Raft Tutor Axis, I am an educator / tutor looking to register with your platform for teaching vacancies."
    },
    {
      id: "school",
      label: "School & Institute Tie-up",
      description: "Request teachers, subject matter experts, or institutional hiring help",
      text: "Hello Raft Tutor Axis, I represent an academic institution looking to hire verified teaching faculty."
    },
    {
      id: "rates",
      label: "Inquire Rates & Covered Areas",
      description: "Questions about service rates, locations, and cover plans",
      text: "Hello Raft Tutor Axis, I want to inquire about tutoring rates, packages, and cities you currently cover in India."
    }
  ] : [
    {
      id: "parent",
      label: "होम ट्यूटर खोजें",
      description: "ट्रायल क्लास, शिक्षक प्रोफाइल और शुल्क के बारे में पूछें",
      text: "नमस्ते राफ्ट ट्यूटर एक्सिस, मैं एक अभिभावक हूँ और अपने बच्चे के लिए योग्य होम ट्यूटर ढूंढ रहा हूँ। कृपया मुझे पूरी जानकारी दें।"
    },
    {
      id: "teacher",
      label: "शिक्षक के रूप में पंजीकरण",
      description: "अपनी योग्यता जमा करें और उपलब्ध नौकरियों के लिए रजिस्टर करें",
      text: "नमस्ते राफ्ट ट्यूटर एक्सिस, मैं एक शिक्षक हूँ और शिक्षण रिक्तियों के लिए आपके मंच पर पंजीकरण कराना चाहता हूँ।"
    },
    {
      id: "school",
      label: "स्कूल और संस्थान गठजोड़",
      description: "स्कूलों के लिए योग्य फैकल्टी और विशेषज्ञों की मांग करें",
      text: "नमस्ते राफ्ट ट्यूटर एक्सिस, मैं एक शैक्षणिक संस्थान का प्रतिनिधित्व करता हूँ और सत्यापित शिक्षक नियुक्त करना चाहता हूँ।"
    },
    {
      id: "rates",
      label: "ट्यूशन फीस और सेवा क्षेत्र",
      description: "फीस पैकेज, शहरों और सेवा कवरेज की जानकारी प्राप्त करें",
      text: "नमस्ते राफ्ट ट्यूटर एक्सिस, मैं ट्यूशन दरों, पैकेजों और आपके द्वारा कवर किए जाने वाले शहरों/स्थानों के बारे में जानना चाहता हूँ।"
    }
  ];

  const handleSendPreset = (text: string) => {
    // Determine target phone
    const phone = whatsappNumbers[selectedRecipient];
    const encodedText = encodeURIComponent(text);
    const url = `https://api.whatsapp.com/send?phone=${phone}&text=${encodedText}`;
    window.open(url, "_blank");
  };

  const handleSendCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customMessage.trim()) return;
    
    const phone = whatsappNumbers[selectedRecipient];
    const encodedText = encodeURIComponent(customMessage);
    const url = `https://api.whatsapp.com/send?phone=${phone}&text=${encodedText}`;
    window.open(url, "_blank");
    setCustomMessage("");
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 select-none font-sans">
      
      {/* Floating Messenger Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="p-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-2xl hover:scale-[1.08] active:scale-95 transition-all outline-none duration-300 flex items-center gap-2 cursor-pointer relative group border-2 border-white/20 dark:border-emerald-500/30"
          id="support-whatsapp-bubble"
          title={lang === "en" ? "Chat on WhatsApp" : "व्हाट्सएप पर चैट करें"}
        >
          {/* Animated Green Ring Signal */}
          <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4.5 w-4.5 bg-emerald-400"></span>
          </span>

          <MessageCircle className="w-6 h-6 fill-current animate-pulse text-white" />
          
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 text-xs font-bold uppercase tracking-wider block whitespace-nowrap">
            {lang === "en" ? "WhatsApp Support" : "व्हाट्सएप सहायता"}
          </span>
        </button>
      )}

      {/* Modern WhatsApp Slide-up Panel */}
      {isOpen && (
        <div className="w-[360px] sm:w-[390px] h-[550px] bg-white dark:bg-[#0c121a] border border-emerald-100 dark:border-emerald-900/40 rounded-2xl shadow-3xl flex flex-col overflow-hidden animate-fade-in transition-all duration-300">
          
          {/* Green Header */}
          <div className="p-4 bg-emerald-700 dark:bg-emerald-800 text-white flex flex-col gap-3 relative">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-1.5 hover:bg-white/15 text-emerald-100 hover:text-white rounded-full transition-all cursor-pointer"
              title="Close Panel"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-xl relative">
                <MessageCircle className="w-6 h-6 fill-white text-emerald-700" />
                <span className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-emerald-700 rounded-full animate-ping" />
                <span className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-emerald-700 rounded-full" />
              </div>
              <div>
                <h4 className="font-display font-semibold text-sm tracking-wide">Raft Tutor Axis</h4>
                <p className="text-[10px] text-emerald-100 flex items-center gap-1.5 mt-0.5 font-mono">
                  <span className="h-1.5 w-1.5 bg-emerald-300 rounded-full" />
                  {lang === "en" ? "Live Assistance (Usually replies instantly)" : "लाइव सहायता (आमतौर पर तुरंत उत्तर)"}
                </p>
              </div>
            </div>

            {/* Recipient Channel Toggle */}
            <div className="bg-emerald-800/60 dark:bg-emerald-950/40 p-1 rounded-lg grid grid-cols-2 text-center text-[10px] border border-emerald-600/30">
              <button
                type="button"
                onClick={() => setSelectedRecipient("operations")}
                className={`py-1 rounded-md font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  selectedRecipient === "operations" 
                    ? "bg-white text-emerald-900 shadow-sm" 
                    : "text-emerald-100 hover:text-white"
                }`}
              >
                📞 {lang === "en" ? "Helpdesk Ops" : "हेल्पडेस्क टीम"}
              </button>
              <button
                type="button"
                onClick={() => setSelectedRecipient("director")}
                className={`py-1 rounded-md font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  selectedRecipient === "director" 
                    ? "bg-white text-emerald-900 shadow-sm" 
                    : "text-emerald-100 hover:text-white"
                }`}
              >
                🎓 {lang === "en" ? "Academic HQ" : "मुख्यालय संचालक"}
              </button>
            </div>
          </div>

          {/* Quick Info Bar */}
          <div className="bg-slate-50 dark:bg-gray-950/80 px-4 py-2 border-b border-gray-100 dark:border-gray-850 flex items-center justify-between text-[11px] font-medium font-mono text-gray-500 dark:text-gray-400 transition-colors">
            <span className="flex items-center gap-1">
              <PhoneCall className="w-3 h-3 text-emerald-600" />
              {lang === "en" ? "Current Active Line:" : "सक्रिय हेल्पलाइन नंबर:"}
            </span>
            <a 
              href={`tel:${selectedRecipient === "operations" ? "6205355760" : "7255941761"}`} 
              className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold"
            >
              +{selectedRecipient === "operations" ? "91 6205355760" : "91 7255941761"}
            </a>
          </div>

          {/* Body List of Preset Helper Inquiries */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/40 dark:bg-gray-950/40 custom-scrollbar">
            
            <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">
              {lang === "en" ? "Select a topic to start WhatsApp Chat" : "व्हाट्सएप चैट शुरू करने के लिए विषय चुनें"}
            </p>

            <div className="space-y-2.5">
              {presets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleSendPreset(preset.text)}
                  className="w-full text-left p-3.5 bg-white dark:bg-gray-900 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/15 border border-gray-150 dark:border-gray-850 hover:border-emerald-200 dark:hover:border-emerald-900/50 rounded-xl transition-all shadow-xxs block group cursor-pointer relative"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-display font-bold text-xs text-gray-850 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {preset.label}
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
                  </div>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 leading-normal">
                    {preset.description}
                  </p>
                </button>
              ))}
            </div>

            {/* Verification Tag */}
            <div className="flex items-center gap-1.5 bg-white dark:bg-gray-900/50 p-2.5 rounded-xl border border-dashed border-gray-250 dark:border-gray-800 text-[10px] text-gray-500 dark:text-gray-450 mt-4 font-mono">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{lang === "en" ? "Direct routing via official WhatsApp API" : "आधिकारिक व्हाट्सएप एपीआई द्वारा निर्देशित"}</span>
            </div>

          </div>

          {/* Prompt Direct Input Box and Trigger send */}
          <form 
            onSubmit={handleSendCustom} 
            className="p-3 bg-white dark:bg-[#0c121a] border-t border-gray-150 dark:border-gray-850 flex items-center gap-2"
          >
            <input
              type="text"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder={lang === "en" ? "Type your custom request here..." : "अपनी कस्टम मांग यहाँ लिखें..."}
              className="flex-1 bg-gray-50 dark:bg-gray-950/80 border border-gray-200 dark:border-gray-800 focus:border-emerald-600 dark:focus:border-emerald-700 text-xs text-gray-800 dark:text-white px-3.5 py-3 rounded-xl outline-none transition-all duration-200"
            />
            <button
              type="submit"
              disabled={!customMessage.trim()}
              className={`p-3 rounded-xl transition-all ${
                customMessage.trim()
                  ? "bg-emerald-600 text-white hover:bg-emerald-500 hover:scale-105 active:scale-95 cursor-pointer shadow-md"
                  : "bg-gray-100 dark:bg-gray-900 text-gray-400 cursor-not-allowed"
              }`}
              title={lang === "en" ? "Submit custom message" : "कस्टम संदेश भेजें"}
            >
              <Send className="w-4 h-4 fill-current" />
            </button>
          </form>

        </div>
      )}

    </div>
  );
}
