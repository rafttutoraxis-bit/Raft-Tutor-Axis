import React, { useState } from "react";
import { X, ArrowRight, BookOpen, Users, Compass, HelpCircle, CheckCircle } from "lucide-react";

interface OnboardingFlowProps {
  onClose: () => void;
  lang: "en" | "hi";
}

export default function OnboardingFlow({ onClose, lang }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: lang === "en" ? "Welcome to Raft Tutor Axis" : "राफ्ट ट्यूटर एक्सिस में आपका स्वागत है",
      desc: lang === "en" 
        ? "We connect professional, certified, and vetted home tutors with parents, coaching institutes, and schools across India."
        : "हम पूरे भारत में पेशेवर, प्रमाणित और सत्यापित ट्यूटर को माता-पिता, कोचिंग संस्थानों और स्कूलों से जोड़ते हैं।",
      icon: <Compass className="w-12 h-12 text-brand-primary" />,
      roleInfo: lang === "en" ? "Grounded in quality education. Powered by expert mentors." : "गुणवत्तापूर्ण शिक्षा पर आधारित। विशेषज्ञ गुरुओं द्वारा संचालित।"
    },
    {
      title: lang === "en" ? "For Parents (Find Tutors)" : "अभिभावकों के लिए (ट्यूटर खोजें)",
      desc: lang === "en"
        ? "1. Fill out the 'Find a Tutor' request form.\n2. Get matched with leading subject specialists in 24 hours.\n3. Complete 2 DAYS FREE DEMO session before starting."
        : "1. 'ट्यूटर खोजें' फॉर्म भरें।\n2. 24 घंटे में हमारे प्रमुख विषय विशेषज्ञों के साथ जुड़ें।\n3. पठन शुरू करने के पहले 2 दिन का निःशुल्क डेमो क्लास पूरा करें।",
      icon: <BookOpen className="w-12 h-12 text-blue-500" />,
      roleInfo: lang === "en" ? "✓ No registration fees | ✓ Highly secure matching" : "✓ कोई पंजीकरण शुल्क नहीं | ✓ अत्यधिक सुरक्षित मिलान"
    },
    {
      title: lang === "en" ? "For Teachers & Schools" : "शिक्षकों और स्कूलों के लिए",
      desc: lang === "en"
        ? "Tutors join India's fastest-growing teaching network. Access immediate tuition demands.\nSchools can hire expert PGT/TGT faculty with proven pedagogical records on a flexible basis."
        : "शिक्षक भारत के सबसे तेजी से बढ़ते नेटवर्क से जुड़ें और तत्काल अवसर पाएं।\nस्कूल और प्रमुख कोचिंग संस्थान अपनी आवश्यकताओं के अनुसार विशेषज्ञ शिक्षक किराए पर लें।",
      icon: <Users className="w-12 h-12 text-gray-700" />,
      roleInfo: lang === "en" ? "✓ Prompt monthly payments | ✓ Identity verification checks" : "✓ त्वरित मासिक भुगतान | ✓ पहचान सत्यापन जांच"
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-brand-dark-bg w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 transition-colors duration-300">
        
        {/* Progress bar */}
        <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 flex">
          {steps.map((_, idx) => (
            <div 
              key={idx}
              className={`h-full flex-1 transition-all duration-300 ${
                idx <= currentStep ? "bg-brand-primary" : "bg-transparent"
              }`}
            />
          ))}
        </div>

        <div className="p-6 md:p-8 relative">
          {/* Close button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            title="Skip Walkthrough"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Icon */}
          <div className="mb-6 flex justify-center">
            <div className="p-4 bg-blue-50 dark:bg-blue-950/40 rounded-full">
              {steps[currentStep].icon}
            </div>
          </div>

          {/* Content */}
          <div className="text-center">
            <h3 className="font-display font-semibold text-2xl text-gray-900 dark:text-white mb-3">
              {steps[currentStep].title}
            </h3>
            <div className="text-gray-600 dark:text-gray-300 whitespace-pre-line text-sm leading-relaxed mb-6">
              {steps[currentStep].desc}
            </div>

            <div className="bg-brand-bg dark:bg-gray-900 p-3 rounded-lg text-xs font-semibold text-brand-primary dark:text-blue-400 mb-6 inline-block">
              {steps[currentStep].roleInfo}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-4">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentStep === 0 
                  ? "text-gray-300 dark:text-gray-700 cursor-not-allowed" 
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              {lang === "en" ? "Previous" : "पिछला"}
            </button>

            <button
              onClick={handleNext}
              className="px-5 py-2.5 bg-brand-primary hover:bg-blue-700 text-white text-sm font-medium rounded-lg flex items-center gap-1.5 shadow-md shadow-brand-primary/25 transition-all cursor-pointer hover:translate-x-0.5"
            >
              <span>
                {currentStep === steps.length - 1 
                  ? (lang === "en" ? "Get Started" : "शुरू करें") 
                  : (lang === "en" ? "Next" : "अगला")}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
