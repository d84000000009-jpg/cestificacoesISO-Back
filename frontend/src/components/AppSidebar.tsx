import { useLocation, Link } from "react-router-dom";
import { useAppContext } from "./AppLayout";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Award, Inbox, Settings, ChevronLeft, ChevronRight, ChevronsUpDown, Zap, type LucideIcon
} from "lucide-react";
import { useMe } from "@/hooks/useAuth";
import { useCertifications } from "@/hooks/useCertifications";
import { useSubmissions } from "@/hooks/useSubmissions";

interface MenuItem {
  label: string;
  icon: LucideIcon;
  path: string;
}

const menuItems: MenuItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/" },
  { label: "Certificações", icon: Award, path: "/certifications" },
  { label: "Submissões", icon: Inbox, path: "/submissions" },
  { label: "Definições", icon: Settings, path: "/settings" },
];

export function AppSidebar() {
  const { sidebarOpen, setSidebarOpen } = useAppContext();
  const location = useLocation();
  const { data: me } = useMe();
  const { data: certs } = useCertifications({ page_size: 1 });
  const { data: subs }  = useSubmissions({ page_size: 1 });

  const badges: Record<string, number | undefined> = {
    "/submissions": subs?.count,
  };

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-foreground/30 z-30 lg:hidden glass"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 z-40 h-screen flex-col gradient-sidebar transition-all duration-300 ease-in-out border-r border-sidebar-border/30 hidden lg:flex",
          sidebarOpen ? "w-[240px]" : "w-[64px]"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 gap-3 flex-shrink-0 border-b border-sidebar-border/20">
          <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0 shadow-glow">
            <Zap className="w-4.5 h-4.5 text-primary-foreground" />
          </div>
          {sidebarOpen && (
            <div className="min-w-0">
              <p className="font-display font-bold text-sm text-sidebar-primary-foreground leading-tight truncate">CPTec Academy</p>
              <p className="text-[10px] text-sidebar-foreground/40 font-semibold uppercase tracking-wider">Admin Panel</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="py-2 px-2 flex-shrink-0 space-y-0.5">
          {sidebarOpen && (
            <p className="px-3 pt-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-sidebar-foreground/30">Menu</p>
          )}
          {menuItems.map((item) => {
            const active = location.pathname === item.path;
            const badge = badges[item.path];
            return (
              <Link
                key={item.path}
                to={item.path}
                title={!sidebarOpen ? item.label : undefined}
                className={cn(
                  "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 relative",
                  active
                    ? "bg-sidebar-accent text-sidebar-primary-foreground shadow-card"
                    : "text-sidebar-foreground/50 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground"
                )}
              >
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full bg-primary" />
                )}
                <item.icon className={cn("w-[18px] h-[18px] flex-shrink-0", active && "text-primary")} />
                {sidebarOpen && <span className="whitespace-nowrap flex-1">{item.label}</span>}
                {sidebarOpen && !!badge && (
                  <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-primary/20 text-primary text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                    {badge > 99 ? "99+" : badge}
                  </span>
                )}
                {!sidebarOpen && !!badge && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Estatísticas rápidas */}
        {sidebarOpen && (
          <div className="mx-3 mt-3 p-3 rounded-xl bg-sidebar-accent/15 border border-sidebar-border/20">
            <p className="text-[10px] font-bold uppercase tracking-wider text-sidebar-foreground/30 mb-2">Resumo</p>
            <div className="flex items-center justify-between py-1">
              <span className="text-[12px] text-sidebar-foreground/60">Certificações</span>
              <span className="text-xs font-bold text-sidebar-primary-foreground">{certs?.count}</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-[12px] text-sidebar-foreground/60">Submissões</span>
              <span className="text-xs font-bold text-sidebar-primary-foreground">{subs?.count}</span>
            </div>
          </div>
        )}

        <div className="flex-1" />

        {/* User */}
        <Link
          to="/settings"
          className={cn(
            "mx-2 mb-2 p-2.5 rounded-xl bg-sidebar-accent/20 hover:bg-sidebar-accent/40 transition-colors flex items-center gap-2.5",
            !sidebarOpen && "justify-center"
          )}
        >
          <div className="relative flex-shrink-0">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
              {(me?.username ?? "A")[0].toUpperCase()}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-success border-2 border-sidebar" />
          </div>
          {sidebarOpen && (
            <>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-sidebar-foreground truncate">{me?.username ?? "Admin"}</p>
                <p className="text-[10px] text-sidebar-foreground/40 font-medium">{me?.is_superuser ? "Superuser" : "CPTec Academy"}</p>
              </div>
              <ChevronsUpDown className="w-3.5 h-3.5 text-sidebar-foreground/30 flex-shrink-0" />
            </>
          )}
        </Link>

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="hidden lg:flex items-center justify-center h-9 mx-2 mb-2 rounded-lg border border-sidebar-border/20 text-sidebar-foreground/30 hover:text-sidebar-foreground/60 hover:bg-sidebar-accent/30 transition-colors flex-shrink-0"
        >
          {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </aside>

      {/* Mobile sidebar drawer */}
      {sidebarOpen && (
        <aside className="fixed top-0 left-0 z-40 h-screen w-[280px] flex flex-col gradient-sidebar lg:hidden animate-slide-in-left">
          <div className="h-16 flex items-center justify-between px-4 flex-shrink-0 border-b border-sidebar-border/20">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
                <Zap className="w-4.5 h-4.5 text-primary-foreground" />
              </div>
              <div>
                <p className="font-display font-bold text-sm text-sidebar-primary-foreground leading-tight">CPTec Academy</p>
                <p className="text-[10px] text-sidebar-foreground/40 font-semibold uppercase tracking-wider">Admin Panel</p>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg text-sidebar-foreground/50 hover:text-sidebar-foreground">
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
          <nav className="flex-1 py-3 px-2 overflow-y-auto custom-scroll space-y-0.5">
            <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-sidebar-foreground/30">Menu</p>
            {menuItems.map((item) => {
              const active = location.pathname === item.path;
              const badge = badges[item.path];
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all relative",
                    active ? "bg-sidebar-accent text-sidebar-primary-foreground" : "text-sidebar-foreground/50 hover:bg-sidebar-accent/40"
                  )}
                >
                  {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full bg-primary" />}
                  <item.icon className={cn("w-[18px] h-[18px]", active && "text-primary")} />
                  <span className="flex-1">{item.label}</span>
                  {!!badge && (
                    <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-primary/20 text-primary text-[10px] font-bold flex items-center justify-center">
                      {badge > 99 ? "99+" : badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
          <Link
            to="/settings"
            onClick={() => setSidebarOpen(false)}
            className="mx-2 mb-3 p-2.5 rounded-xl bg-sidebar-accent/20 flex items-center gap-2.5 flex-shrink-0"
          >
            <div className="relative flex-shrink-0">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                {(me?.username ?? "A")[0].toUpperCase()}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-success border-2 border-sidebar" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-sidebar-foreground truncate">{me?.username ?? "Admin"}</p>
              <p className="text-[10px] text-sidebar-foreground/40 font-medium">{me?.is_superuser ? "Superuser" : "CPTec Academy"}</p>
            </div>
          </Link>
        </aside>
      )}
    </>
  );
}
