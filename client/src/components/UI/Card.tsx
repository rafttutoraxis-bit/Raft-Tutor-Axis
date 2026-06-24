import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "glass" | "gradient" | "outline" | "solid";
  hoverable?: boolean;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  variant = "glass",
  hoverable = true,
  className = "",
  children,
  ...props
}) => {
  const baseStyles = "rounded-2xl p-6 transition-all duration-300 relative overflow-hidden";
  
  const variants = {
    glass: "bg-[#1b1631]/80 backdrop-blur-md border border-[#9bfc07]/15 shadow-xl text-white",
    gradient: "bg-gradient-to-br from-[#1b1631] via-[#110d22] to-black border border-[#9bfc07]/10 shadow-2xl text-white",
    outline: "bg-transparent border border-[#9bfc07]/20 shadow-sm text-white",
    solid: "bg-[#110d22] border border-zinc-800 shadow-md text-white"
  };

  const hoverStyles = hoverable 
    ? "hover:-translate-y-1.5 hover:shadow-2xl hover:border-[#9bfc07]/30 hover:shadow-[#9bfc07]/5" 
    : "";

  return (
    <div
      className={`${baseStyles} ${variants[variant]} ${hoverStyles} ${className}`}
      {...props}
    >
      {/* Decorative gradient orb for premium UI */}
      {variant === "gradient" && (
        <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-[#9bfc07]/5 filter blur-3xl pointer-events-none" />
      )}
      {children}
    </div>
  );
};
export default Card;
