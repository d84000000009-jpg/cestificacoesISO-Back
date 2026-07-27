import { useLocation, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Award, Inbox, Settings } from "lucide-react";

const nav = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/" },
  { label: "Certificações", icon: Award, path: "/certifications" },
  { label: "Submissões", icon: Inbox, path: "/submissions" },
  { label: "Definições", icon: Settings, path: "/settings" },
];

export function MobileBottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-card/95 glass border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around px-1 py-1">
        {nav.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl transition-all duration-200 min-w-[56px]",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <div className={cn(
                "p-1.5 rounded-xl transition-all duration-200",
                active && "bg-primary/10"
              )}>
                <item.icon className={cn("w-5 h-5", active && "text-primary")} />
              </div>
              <span className={cn("text-[10px] font-medium", active && "font-semibold")}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
