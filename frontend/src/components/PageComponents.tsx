import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
      <div>
        <h1 className="text-xl md:text-2xl font-display font-extrabold text-foreground tracking-tight">{title}</h1>
        {description && <p className="text-xs md:text-sm text-muted-foreground mt-0.5">{description}</p>}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}

interface DataCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

export function DataCard({ title, children, className, action }: DataCardProps) {
  return (
    <div className={cn("bg-card rounded-2xl border border-border shadow-card p-4 md:p-5 transition-all duration-300 hover:shadow-elevated", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold text-sm text-card-foreground">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}
