import { ReactNode } from "react";

export function GlassCard({
  children,
  className = "",
  hover = true,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={`glass-card ${hover ? "glass-hover" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
