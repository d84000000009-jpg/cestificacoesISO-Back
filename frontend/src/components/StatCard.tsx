import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: LucideIcon;
  variant?: "default" | "primary" | "success" | "warning" | "info" | "gradient" | "ocean";
  sparkData?: number[];
}

const variantStyles = {
  default: "bg-card text-card-foreground border-border",
  primary: "bg-primary/5 text-foreground border-primary/10",
  success: "bg-success/5 text-foreground border-success/10",
  warning: "bg-warning/5 text-foreground border-warning/10",
  info: "bg-primary/5 text-foreground border-primary/10",
  gradient: "gradient-primary text-primary-foreground border-transparent",
  ocean: "gradient-ocean text-primary-foreground border-transparent",
};

const iconStyles = {
  default: "bg-muted text-muted-foreground",
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  info: "bg-primary/10 text-primary",
  gradient: "bg-primary-foreground/15 text-primary-foreground",
  ocean: "bg-primary-foreground/15 text-primary-foreground",
};

const isLight = (v: string) => v === "gradient" || v === "ocean";

function MiniSparkline({ data, light }: { data: number[]; light: boolean }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 56;
  const h = 20;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(" ");
  return (
    <svg width={w} height={h} className="mt-1">
      <polyline
        points={points}
        fill="none"
        stroke={light ? "rgba(255,255,255,0.5)" : "hsl(var(--primary))"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function StatCard({ title, value, change, icon: Icon, variant = "default", sparkData }: StatCardProps) {
  const light = isLight(variant);
  return (
    <div className={cn(
      "rounded-xl p-3 md:p-4 border shadow-card transition-all duration-200 hover:shadow-elevated group relative overflow-hidden",
      variantStyles[variant]
    )}>
      <div className="flex items-start justify-between relative">
        <div className="space-y-0.5">
          <p className={cn("text-[10px] font-semibold uppercase tracking-wider", light ? "text-primary-foreground/70" : "text-muted-foreground")}>{title}</p>
          <p className="text-xl md:text-2xl font-display font-bold tracking-tight">{value}</p>
          {change && (
            <p className={cn("text-[10px] font-medium", light ? "text-primary-foreground/60" : "text-muted-foreground")}>{change}</p>
          )}
          {sparkData && <MiniSparkline data={sparkData} light={light} />}
        </div>
        <div className={cn("p-2 rounded-xl transition-all duration-200 group-hover:scale-110", iconStyles[variant])}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}
