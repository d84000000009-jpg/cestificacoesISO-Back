import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, Lock, User, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useLogin } from "@/hooks/useAuth";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const login = useLogin();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? "/";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      toast.error("Preenche utilizador e password");
      return;
    }
    login.mutate({ username, password }, {
      onSuccess: () => { toast.success("Sessão iniciada!"); navigate(from, { replace: true }); },
      onError:   (e: Error) => toast.error(e.message || "Erro ao iniciar sessão"),
    });
  };

  const inputClass = "w-full pl-10 pr-10 py-3 rounded-xl border border-border bg-muted/40 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring focus:bg-background transition-colors";

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-4xl rounded-2xl shadow-elevated overflow-hidden flex bg-card">

        {/* ── Painel esquerdo ──────────────────────────────────────────────── */}
        <div className="hidden md:flex md:w-[42%] gradient-primary relative flex-col items-center justify-center p-10 text-center">
          <div className="absolute top-0 right-0 w-56 h-56 rounded-full bg-primary-foreground/5 -translate-y-16 translate-x-16" />
          <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full bg-primary-foreground/5 translate-y-16 -translate-x-16" />

          <div className="relative flex flex-col items-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 rounded-2xl bg-white/30 blur-xl scale-110" />
              <div className="relative bg-white rounded-2xl shadow-elevated p-4">
                <img src="/cptec-logo.png" alt="CPTec" className="w-40 h-auto object-contain" />
              </div>
            </div>

            <h1 className="text-2xl font-display font-extrabold text-white tracking-tight">CPTEC</h1>
            <p className="text-primary-foreground font-bold text-xs tracking-wider mt-1 uppercase">Centro Profissional de Tecnologia</p>
            <p className="text-white/60 text-xs mt-0.5">Empreendedorismo e Comunicação</p>

            <div className="flex items-center gap-2 my-6">
              <span className="h-px w-10 border-t border-dashed border-white/30" />
              <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
              <span className="h-px w-10 border-t border-dashed border-white/30" />
            </div>

            <p className="text-white/70 text-sm leading-relaxed max-w-[220px]">
              Sistema de gestão de certificações integrado para uma administração completa e eficiente.
            </p>
          </div>
        </div>

        {/* ── Painel direito ───────────────────────────────────────────────── */}
        <div className="flex-1 p-8 sm:p-10 md:p-12">
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-primary">Bem-vindo</h2>
          <p className="text-sm text-muted-foreground mt-1.5">Entra com as tuas credenciais institucionais</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="text-sm font-semibold text-foreground mb-1.5 block">Nome de Utilizador</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input autoFocus title="Nome de Utilizador" value={username} onChange={(e) => setUsername(e.target.value)} className={inputClass} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-semibold text-foreground">Senha</label>
                <span className="text-xs font-medium text-primary">Esqueceste a senha?</span>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  title="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={login.isPending}
              className="w-full py-3 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2 shadow-card hover:shadow-elevated transition-shadow disabled:opacity-60">
              {login.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Entrar <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <span className="h-px flex-1 border-t border-dashed border-border" />
            <span className="text-[11px] text-muted-foreground uppercase tracking-wide">Acesso Restrito</span>
            <span className="h-px flex-1 border-t border-dashed border-border" />
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Sistema exclusivo para <span className="font-semibold text-primary">administradores</span> da{" "}
            <span className="font-semibold text-primary">CPTec Academy</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
