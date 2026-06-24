import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  loading = false,
  className = "",
  children,
  disabled,
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-display font-semibold transition-all duration-300 rounded-xl outline-none select-none cursor-pointer focus:ring-2 focus:ring-offset-2 focus:ring-[#9bfc07]/50 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-[#9bfc07] hover:bg-white text-[#1b1631] shadow-lg shadow-[#9bfc07]/10 hover:shadow-[#9bfc07]/20",
    secondary: "bg-white/10 hover:bg-white/20 text-white border border-white/10",
    danger: "bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/10",
    ghost: "bg-transparent hover:bg-white/5 text-gray-300 hover:text-white",
    outline: "bg-transparent border border-[#9bfc07]/30 text-[#9bfc07] hover:bg-[#9bfc07]/10"
  };

  const sizes = {
    sm: "px-4 py-2 text-[10px] uppercase tracking-wider",
    md: "px-5 py-3 text-xs uppercase tracking-wider",
    lg: "px-7 py-4 text-sm uppercase tracking-wider"
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Loading...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
};
export default Button;
