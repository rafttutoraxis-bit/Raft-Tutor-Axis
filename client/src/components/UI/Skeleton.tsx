import React from "react";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "rect" | "circle" | "card" | "table";
  count?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = "rect",
  count = 1,
  className = "",
  ...props
}) => {
  const baseStyles = "bg-[#1b1631]/40 border border-[#9bfc07]/5 animate-pulse rounded-xl";

  const renderSingle = (key: number) => {
    if (variant === "text") {
      return (
        <div key={key} className="space-y-2.5 w-full">
          <div className="h-4 bg-[#1b1631]/50 rounded-md w-3/4" />
          <div className="h-3.5 bg-[#1b1631]/30 rounded-md w-1/2" />
        </div>
      );
    }

    if (variant === "circle") {
      return <div key={key} className={`h-12 w-12 rounded-full ${baseStyles} ${className}`} {...props} />;
    }

    if (variant === "card") {
      return (
        <div key={key} className={`p-6 bg-[#1b1631]/60 border border-[#9bfc07]/10 rounded-2xl space-y-4 ${className}`} {...props}>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[#1b1631] animate-pulse" />
            <div className="space-y-1.5 flex-1">
              <div className="h-3.5 bg-[#1b1631] rounded w-2/3 animate-pulse" />
              <div className="h-3 bg-[#1b1631] rounded w-1/2 animate-pulse" />
            </div>
          </div>
          <div className="h-16 bg-[#1b1631]/30 rounded-xl animate-pulse" />
          <div className="h-8 bg-[#9bfc07]/10 rounded-lg animate-pulse" />
        </div>
      );
    }

    if (variant === "table") {
      return (
        <div key={key} className={`space-y-3.5 ${className}`} {...props}>
          <div className="h-10 bg-[#1b1631]/80 rounded-xl animate-pulse" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 bg-[#1b1631]/40 rounded-xl animate-pulse flex items-center justify-between px-5">
              <div className="h-4 bg-[#1b1631] rounded w-1/4" />
              <div className="h-4 bg-[#1b1631] rounded w-1/6" />
              <div className="h-4 bg-[#1b1631] rounded w-1/5" />
              <div className="h-4 bg-[#1b1631] rounded w-1/12" />
            </div>
          ))}
        </div>
      );
    }

    return <div key={key} className={`${baseStyles} ${className}`} {...props} />;
  };

  return (
    <div className="w-full space-y-3.5">
      {[...Array(count)].map((_, idx) => renderSingle(idx))}
    </div>
  );
};
export default Skeleton;
