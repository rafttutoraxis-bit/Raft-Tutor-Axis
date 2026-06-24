import React, { useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  size?: "sm" | "md" | "lg" | "xl";
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  size = "md",
  children,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-md",
    md: "max-w-xl",
    lg: "max-w-3xl",
    xl: "max-w-5xl"
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className={`w-full ${sizes[size]} bg-[#1b1631] border border-[#9bfc07]/25 rounded-2xl shadow-3xl overflow-hidden flex flex-col relative animate-scale-up`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="px-6 py-5 border-b border-[#9bfc07]/10 flex items-center justify-between text-white relative">
          <h3 className="font-display font-bold text-base uppercase tracking-wider text-[#9bfc07]">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 text-gray-400 hover:text-white rounded-full transition-all cursor-pointer"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body content */}
        <div className="p-6 overflow-y-auto max-h-[75vh] custom-scrollbar text-white text-xs">
          {children}
        </div>
      </div>
    </div>
  );
};
export default Modal;
