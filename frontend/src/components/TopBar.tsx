import { useAppContext } from "./AppLayout";
import { Menu, Search, Sun, Moon, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useMe, useLogout } from "@/hooks/useAuth";

export function TopBar() {
  const { sidebarOpen, setSidebarOpen } = useAppContext();
  const [dark, setDark] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const navigate = useNavigate();
  const { data: me } = useMe();
  const logout = useLogout();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => { toast.success("Sessão terminada. Até logo!"); navigate("/login"); },
      onError:   () => toast.error("Erro ao terminar sessão"),
    });
  };

  return (
    <header className="h-14 border-b border-border bg-card/80 glass flex items-center px-3 md:px-5 gap-2 sticky top-0 z-20">

      <button
        type="button"
        title="Abrir menu"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Search */}
      <div className={`flex-1 max-w-md flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-300 ${searchFocused ? 'border-primary/30 bg-card shadow-glow' : 'border-transparent bg-muted/50'}`}>
        <Search className="w-3.5 h-3.5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Pesquisar..."
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          className="bg-transparent outline-none text-sm flex-1 text-foreground placeholder:text-muted-foreground/60"
        />
      </div>

      {/* ── Grupo canto direito ───────────────────────────────────────── */}
      <div className="ml-auto flex items-center gap-1">

        {/* Dark mode */}
        <button
          type="button"
          title={dark ? "Activar modo claro" : "Activar modo escuro"}
          onClick={() => {
            setDark(!dark);
            toast(dark ? "Modo claro activado" : "Modo escuro activado");
          }}
          className="p-2 rounded-xl hover:bg-muted transition-all duration-200 text-muted-foreground hover:text-foreground"
        >
          {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground text-xs font-bold shadow-glow" title={me?.username}>
          {(me?.username ?? "A")[0].toUpperCase()}
        </div>

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          title="Terminar sessão"
          className="p-2 rounded-xl hover:bg-destructive/10 transition-all duration-200 text-muted-foreground hover:text-destructive"
        >
          <LogOut className="w-4 h-4" />
        </button>

      </div>{/* fim grupo direito */}
    </header>
  );
}
