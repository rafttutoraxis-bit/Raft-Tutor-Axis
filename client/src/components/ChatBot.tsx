import React, { useState } from "react";
import { MessageCircle, X, Send, PhoneCall, CheckCircle, ArrowUpRight, HelpCircle, Sparkles } from "lucide-react";
import { api } from "../services/api";
import Button from "./UI/Button";

interface ChatBotProps {
  lang: "en" | "hi";
}

interface ChatMessage {
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
}

export default function ChatBot({ lang }: ChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [chatMode, setChatMode] = useState<"ai" | "whatsapp">("ai");
  const [customMessage, setCustomMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: "bot",
      text: lang === "en" 
        ? "Hello! I am your Raft Tutor Axis AI Assistant. Ask me anything about home tuition rates, teacher registrations, or trial demo schedules." 
        : "नमस्ते! मैं आपका राफ्ट ट्यूटर एक्सिस एआई सहायक हूँ। होम ट्यूशन दरों, शिक्षक पंजीकरण या ट्रायल क्लास शेड्यूलिंग के बारे में कुछ भी पूछें।",
      timestamp: new Date()
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState<"operations" | "director">("operations");

  const whatsappNumbers = {
    operations: "916205355760",
    director: "917255941761"
  };

  const presets = lang === "en" ? [
    {
      id: "parent",
      label: "Find a Home Tutor",
      description: "Ask about trial schedules and fees",
      text: "I am a Parent looking for a qualified home tutor. Please guide me on trial schedules and fee details."
    },
    {
      id: "teacher",
      label: "Register as Tutor / Teacher",
      description: "Submit qualifications & vacancies",
      text: "I am an educator looking to register with your platform for teaching vacancies."
    },
    {
      id: "rates",
      label: "Inquire Tutoring Rates",
      description: "Service rates and locations",
      text: "What are your standard home tutoring rates, and which cities do you cover?"
    }
  ] : [
    {
      id: "parent",
      label: "होम ट्यूटर खोजें",
      description: "ट्रायल क्लास और शुल्क के बारे में पूछें",
      text: "मैं एक अभिभावक हूँ और अपने बच्चे के लिए योग्य होम ट्यूटर ढूंढ रहा हूँ। कृपया पूरी जानकारी दें।"
    },
    {
      id: "teacher",
      label: "शिक्षक के रूप में पंजीकरण",
      description: "शिक्षण रिक्तियों के लिए रजिस्टर करें",
      text: "मैं एक शिक्षक हूँ और शिक्षण रिक्तियों के लिए आपके मंच पर पंजीकरण कराना चाहता हूँ।"
    },
    {
      id: "rates",
      label: "ट्यूशन फीस की जानकारी",
      description: "दरें और सेवा कवरेज",
      text: "ट्यूशन दरें और आपके द्वारा कवर किए जाने वाले शहरों/स्थानों के बारे में बताएं?"
    }
  ];

  const handleSendPreset = (text: string) => {
    if (chatMode === "whatsapp") {
      const phone = whatsappNumbers[selectedRecipient];
      const url = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(text)}`;
      window.open(url, "_blank");
    } else {
      // Send directly to AI Assistant
      handleSendToAI(text);
    }
  };

  const handleSendToAI = async (text: string) => {
    if (!text.trim()) return;
    
    const userMsg: ChatMessage = { sender: "user", text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setCustomMessage("");
    setLoading(true);

    try {
      const response = await api.post("/api/ai/chat", {
        message: text,
        chatHistory: messages.map(m => ({ role: m.sender === "user" ? "user" : "model", parts: [{ text: m.text }] }))
      });
      
      const botMsg: ChatMessage = {
        sender: "bot",
        text: response.response || "I'm having trouble connecting to operations. You can reach us directly on WhatsApp.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch {
      const botMsg: ChatMessage = {
        sender: "bot",
        text: "I am currently offline. Please toggle to WhatsApp mode to contact our support coordinators directly.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customMessage.trim()) return;

    if (chatMode === "whatsapp") {
      const phone = whatsappNumbers[selectedRecipient];
      const url = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(customMessage)}`;
      window.open(url, "_blank");
      setCustomMessage("");
    } else {
      handleSendToAI(customMessage);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-45 select-none font-sans">
      
      {/* Floating Messenger bubble */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="p-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-2xl hover:scale-[1.08] active:scale-95 transition-all outline-none duration-300 flex items-center gap-2 cursor-pointer relative group border-2 border-white/20"
          id="support-whatsapp-bubble"
        >
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-400"></span>
          </span>
          <MessageCircle className="w-6 h-6 fill-current animate-pulse text-white" />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 text-xs font-bold uppercase tracking-wider block whitespace-nowrap">
            {lang === "en" ? "RTA Assistant" : "आरटीए सहायक"}
          </span>
        </button>
      )}

      {/* Slide-up Chat Panel */}
      {isOpen && (
        <div className="w-[calc(100vw-48px)] sm:w-[390px] h-[550px] bg-[#1b1631] border border-[#9bfc07]/25 rounded-2xl shadow-3xl flex flex-col overflow-hidden animate-fade-in text-white">
          
          {/* Header */}
          <div className="p-4 bg-[#110d22] border-b border-[#9bfc07]/10 flex flex-col gap-3 relative">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-1.5 hover:bg-white/10 text-gray-400 hover:text-white rounded-full transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#9bfc07]/10 rounded-xl relative border border-[#9bfc07]/20">
                {chatMode === "ai" ? (
                  <Sparkles className="w-6 h-6 text-[#9bfc07] animate-pulse" />
                ) : (
                  <MessageCircle className="w-6 h-6 fill-[#9bfc07] text-[#110d22]" />
                )}
                <span className="absolute bottom-1 right-1 w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
              </div>
              <div>
                <h4 className="font-display font-bold text-sm tracking-wide">Raft Tutor Axis</h4>
                <p className="text-[9px] text-zinc-400 flex items-center gap-1 mt-0.5 font-mono">
                  <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full" />
                  {chatMode === "ai" ? "Gemini AI Helper Online" : "Direct WhatsApp Desk"}
                </p>
              </div>
            </div>

            {/* Mode selection toggle */}
            <div className="bg-black/40 p-1 rounded-lg grid grid-cols-2 text-center text-[10px] border border-[#9bfc07]/10">
              <button
                type="button"
                onClick={() => setChatMode("ai")}
                className={`py-1 rounded-md font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  chatMode === "ai" 
                    ? "bg-[#9bfc07] text-[#1b1631] shadow-sm" 
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                🤖 AI Chatbot
              </button>
              <button
                type="button"
                onClick={() => setChatMode("whatsapp")}
                className={`py-1 rounded-md font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  chatMode === "whatsapp" 
                    ? "bg-[#9bfc07] text-[#1b1631] shadow-sm" 
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                🟢 WhatsApp
              </button>
            </div>
          </div>

          {/* Interactive Chat Window */}
          {chatMode === "ai" ? (
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#110d22]/50 flex flex-col custom-scrollbar">
              <div className="flex-1 space-y-2">
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`p-3 rounded-xl max-w-[80%] text-[11px] leading-relaxed ${
                      m.sender === "user"
                        ? "bg-[#9bfc07] text-[#1b1631] font-semibold"
                        : "bg-[#1b1631] border border-[#9bfc07]/15 text-white"
                    }`}>
                      {m.text}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="p-3 rounded-xl bg-[#1b1631] border border-[#9bfc07]/15 text-zinc-500 text-[10px] flex items-center gap-1.5">
                      <div className="animate-bounce h-1.5 w-1.5 bg-[#9bfc07] rounded-full" />
                      <div className="animate-bounce h-1.5 w-1.5 bg-[#9bfc07] rounded-full" style={{ animationDelay: "0.2s" }} />
                      <div className="animate-bounce h-1.5 w-1.5 bg-[#9bfc07] rounded-full" style={{ animationDelay: "0.4s" }} />
                    </div>
                  </div>
                )}
              </div>

              {/* Presets shortcut inside AI mode too */}
              <div className="flex gap-2 overflow-x-auto pb-1 select-none whitespace-nowrap custom-scrollbar shrink-0">
                {presets.map(p => (
                  <button
                    key={p.id}
                    onClick={() => handleSendPreset(p.text)}
                    className="px-3 py-1.5 bg-[#1b1631] hover:bg-[#9bfc07]/10 border border-[#9bfc07]/10 hover:border-[#9bfc07]/30 text-[10px] rounded-lg text-zinc-300 hover:text-white transition-all cursor-pointer inline-block"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            // WhatsApp Selector Screen
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#110d22]/50 custom-scrollbar flex flex-col justify-between">
              <div className="space-y-3">
                <div className="bg-[#110d22]/60 p-1.5 rounded-lg grid grid-cols-2 text-center text-[10px] border border-[#9bfc07]/10 select-none">
                  <button
                    type="button"
                    onClick={() => setSelectedRecipient("operations")}
                    className={`py-1.5 rounded-md font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      selectedRecipient === "operations" 
                        ? "bg-[#9bfc07]/10 text-[#9bfc07]" 
                        : "text-zinc-500 hover:text-white"
                    }`}
                  >
                    📞 Helpdesk
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRecipient("director")}
                    className={`py-1.5 rounded-md font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      selectedRecipient === "director" 
                        ? "bg-[#9bfc07]/10 text-[#9bfc07]" 
                        : "text-zinc-500 hover:text-white"
                    }`}
                  >
                    🎓 Director Desk
                  </button>
                </div>

                <div className="space-y-2">
                  {presets.map(preset => (
                    <button
                      key={preset.id}
                      onClick={() => handleSendPreset(preset.text)}
                      className="w-full text-left p-3 bg-[#1b1631] border border-zinc-800 hover:border-[#9bfc07]/20 rounded-xl transition-all block cursor-pointer group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-white text-xs group-hover:text-[#9bfc07] transition-colors">{preset.label}</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-emerald-500" />
                      </div>
                      <p className="text-[10px] text-zinc-400 mt-1 leading-normal">{preset.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-1.5 p-2 bg-[#9bfc07]/10 rounded-xl border border-[#9bfc07]/20 text-[9px] font-mono text-[#9bfc07]">
                <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Sends message directly to +91 {selectedRecipient === "operations" ? "6205355760" : "7255941761"}</span>
              </div>
            </div>
          )}

          {/* User Custom input Form footer */}
          <form
            onSubmit={handleCustomSend}
            className="p-3 bg-[#110d22] border-t border-[#9bfc07]/10 flex items-center gap-2"
          >
            <input
              type="text"
              value={customMessage}
              onChange={e => setCustomMessage(e.target.value)}
              placeholder={lang === "en" ? "Ask a question..." : "प्रश्न पूछें..."}
              className="flex-1 bg-[#1b1631] border border-zinc-800 focus:border-[#9bfc07] text-xs text-white px-3.5 py-3 rounded-xl outline-none"
            />
            <button
              type="submit"
              disabled={!customMessage.trim() || loading}
              className={`p-3 rounded-xl transition-all ${
                customMessage.trim() && !loading
                  ? "bg-[#9bfc07] text-[#1b1631] cursor-pointer"
                  : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
              }`}
            >
              <Send className="w-4 h-4 fill-current" />
            </button>
          </form>

        </div>
      )}

    </div>
  );
}
