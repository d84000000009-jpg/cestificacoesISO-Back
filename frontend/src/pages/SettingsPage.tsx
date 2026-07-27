import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { PageHeader, DataCard } from "@/components/PageComponents";
import {
  Lock, Loader2, ShieldCheck, Users, Activity, LogIn, History,
  Plus, Edit, Trash2, UserRound, Mail,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  useMe, useChangePassword, useAdminUsers, useCreateUser, useUpdateUser, useDeleteUser,
  useLoginHistory, useChangeLog, type AuthUser, type UserPayload,
} from "@/hooks/useAuth";

const TABS = [
  { key: "seguranca",    label: "Segurança",    desc: "Palavra-passe da tua conta",       icon: ShieldCheck },
  { key: "utilizadores", label: "Utilizadores", desc: "Quem tem acesso ao painel",         icon: Users },
  { key: "atividade",    label: "Atividade",    desc: "Acessos e alterações recentes",     icon: Activity },
] as const;

type TabKey = typeof TABS[number]["key"];

function SecuritySection() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const changePassword = useChangePassword();

  const inputClass = "w-full pl-9 pr-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground outline-none focus:ring-2 focus:ring-ring";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) {
      toast.error("Preenche a password atual e a nova password"); return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("A confirmação não coincide com a nova password"); return;
    }
    changePassword.mutate({ old_password: oldPassword, new_password: newPassword }, {
      onSuccess: () => {
        toast.success("Password alterada com sucesso!");
        setOldPassword(""); setNewPassword(""); setConfirmPassword("");
      },
      onError: (e: Error) => toast.error(e.message || "Erro ao alterar a password"),
    });
  };

  return (
    <DataCard title="Trocar Password" className="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Password Atual</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="password" title="Password Atual" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} className={inputClass} />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Nova Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="password" title="Nova Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={inputClass} />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Confirmar Nova Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="password" title="Confirmar Nova Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={inputClass} />
          </div>
        </div>
        <button type="submit" disabled={changePassword.isPending}
          className="w-full py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-medium flex items-center justify-center gap-2 hover:shadow-elevated transition-shadow disabled:opacity-60">
          {changePassword.isPending && <Loader2 className="w-4 h-4 animate-spin" />} Guardar Nova Password
        </button>
      </form>
    </DataCard>
  );
}

const initUserForm = (): UserPayload => ({
  username: "", email: "", password: "", is_active: true, is_staff: true, is_superuser: false,
});

function UserCard({ user, isSelf, canManage, onEdit, onDelete }: {
  user: AuthUser; isSelf: boolean; canManage: boolean;
  onEdit: (u: AuthUser) => void; onDelete: (u: AuthUser) => void;
}) {
  return (
    <div className="bg-card rounded-2xl border border-border shadow-card p-4 hover:shadow-elevated transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
          {user.username.slice(0, 2).toUpperCase()}
        </div>
        {canManage && (
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => onEdit(user)} title="Editar"
              className="p-1.5 rounded-full bg-muted text-muted-foreground hover:bg-muted/80 transition-colors">
              <Edit className="w-3.5 h-3.5" />
            </button>
            <button type="button" onClick={() => onDelete(user)} title={isSelf ? "Não podes remover a tua própria conta" : "Remover"}
              disabled={isSelf}
              className="p-1.5 rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors disabled:opacity-30 disabled:pointer-events-none">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
      <p className="text-sm font-bold text-foreground truncate flex items-center gap-1.5">
        {user.username} {isSelf && <span className="text-[10px] font-normal text-muted-foreground">(tu)</span>}
      </p>
      <p className="text-xs text-muted-foreground truncate">{user.email || "Sem email"}</p>
      <div className="flex items-center gap-1.5 mt-3 flex-wrap">
        <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-primary/10 text-primary">
          {user.is_superuser ? "Superuser" : user.is_staff ? "Staff" : "Utilizador"}
        </span>
        <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${user.is_active ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
          {user.is_active ? "Ativo" : "Inativo"}
        </span>
      </div>
      <p className="text-[11px] text-muted-foreground mt-3">
        Último acesso: {user.last_login ? new Date(user.last_login).toLocaleString("pt-PT") : "Nunca"}
      </p>
    </div>
  );
}

function UsersSection() {
  const { data: me } = useMe();
  const { data, isLoading } = useAdminUsers();
  const createUser = useCreateUser();
  const [showEdit, setShowEdit] = useState<AuthUser | null>(null);
  const updateUser = useUpdateUser(showEdit?.id ?? 0);
  const deleteUser = useDeleteUser();

  const [showAdd, setShowAdd] = useState(false);
  const [showDelete, setShowDelete] = useState<AuthUser | null>(null);
  const [form, setForm] = useState<UserPayload>(initUserForm());

  const users = data?.results ?? [];
  const canManage = !!me?.is_superuser;

  const openAdd = () => { setForm(initUserForm()); setShowAdd(true); };

  const openEdit = (u: AuthUser) => {
    setForm({ username: u.username, email: u.email, password: "", is_active: u.is_active, is_staff: u.is_staff, is_superuser: u.is_superuser });
    setShowEdit(u);
  };

  const handleAdd = () => {
    if (!form.username.trim() || !form.password) {
      toast.error("Preenche o utilizador e a password"); return;
    }
    createUser.mutate(form, {
      onSuccess: () => { toast.success(`Utilizador "${form.username}" criado!`); setShowAdd(false); },
      onError:   (e: Error) => toast.error(e.message || "Erro ao criar utilizador"),
    });
  };

  const handleEdit = () => {
    if (!showEdit) return;
    const { password, ...rest } = form;
    updateUser.mutate({ ...rest, ...(password ? { password } : {}) }, {
      onSuccess: () => { toast.success("Utilizador atualizado!"); setShowEdit(null); },
      onError:   (e: Error) => toast.error(e.message || "Erro ao atualizar utilizador"),
    });
  };

  const handleDelete = () => {
    if (!showDelete) return;
    deleteUser.mutate(showDelete.id, {
      onSuccess: () => { toast.success("Utilizador removido"); setShowDelete(null); },
      onError:   (e: Error) => toast.error(e.message || "Erro ao remover utilizador"),
    });
  };

  const inputClass = "w-full pl-9 pr-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground outline-none focus:ring-2 focus:ring-ring";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display font-bold text-sm text-foreground">Utilizadores com Acesso ao Painel</h3>
          {!canManage && (
            <p className="text-[11px] text-muted-foreground mt-0.5">Apenas superusers podem criar, editar ou remover utilizadores.</p>
          )}
        </div>
        {canManage && (
          <button type="button" onClick={openAdd}
            className="px-4 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-medium shadow-card hover:shadow-elevated transition-shadow flex items-center gap-2">
            <Plus className="w-4 h-4" /> Novo Utilizador
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((u) => (
          <UserCard key={u.id} user={u} isSelf={u.id === me?.id} canManage={canManage} onEdit={openEdit} onDelete={setShowDelete} />
        ))}
        {!isLoading && users.length === 0 && (
          <div className="col-span-full text-center py-8 text-sm text-muted-foreground">Nenhum utilizador encontrado</div>
        )}
      </div>

      {/* ── Add/Edit Modal ────────────────────────────────────────────────── */}
      <Dialog open={showAdd || !!showEdit} onOpenChange={(open) => { if (!open) { setShowAdd(false); setShowEdit(null); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{showEdit ? "Editar Utilizador" : "Novo Utilizador"}</DialogTitle>
            <DialogDescription>
              {showEdit ? "Altera os dados de acesso do utilizador." : "Cria um novo acesso ao painel administrativo."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Utilizador *</label>
              <div className="relative">
                <UserRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input title="Utilizador" value={form.username} disabled={!!showEdit}
                  onChange={(e) => setForm({ ...form, username: e.target.value })} className={`${inputClass} disabled:opacity-60`} />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input title="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                {showEdit ? "Nova Password (opcional)" : "Password *"}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input title="Password" type="password" placeholder={showEdit ? "Deixar em branco para manter" : ""}
                  value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={inputClass} />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border p-3">
              <div>
                <p className="text-sm font-medium text-foreground">Ativo</p>
                <p className="text-[11px] text-muted-foreground">Pode iniciar sessão no painel</p>
              </div>
              <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border p-3">
              <div>
                <p className="text-sm font-medium text-foreground">Staff</p>
                <p className="text-[11px] text-muted-foreground">Acesso ao painel administrativo</p>
              </div>
              <Switch checked={form.is_staff} onCheckedChange={(v) => setForm({ ...form, is_staff: v })} />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border p-3">
              <div>
                <p className="text-sm font-medium text-foreground">Superuser</p>
                <p className="text-[11px] text-muted-foreground">Pode gerir outros utilizadores</p>
              </div>
              <Switch checked={form.is_superuser} onCheckedChange={(v) => setForm({ ...form, is_superuser: v })} />
            </div>
          </div>
          <DialogFooter>
            <button type="button" onClick={() => { setShowAdd(false); setShowEdit(null); }}
              className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors">Cancelar</button>
            <button type="button" onClick={showEdit ? handleEdit : handleAdd} disabled={createUser.isPending || updateUser.isPending}
              className="px-4 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-medium flex items-center gap-2 disabled:opacity-60">
              {(createUser.isPending || updateUser.isPending) && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {showEdit ? "Guardar" : "Criar"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Modal ──────────────────────────────────────────────────── */}
      <Dialog open={!!showDelete} onOpenChange={() => setShowDelete(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Remover Utilizador</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja remover <strong>{showDelete?.username}</strong>? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button type="button" onClick={() => setShowDelete(null)} className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors">Cancelar</button>
            <button type="button" onClick={handleDelete} disabled={deleteUser.isPending}
              className="px-4 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium flex items-center gap-2 disabled:opacity-60">
              {deleteUser.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Remover
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ActivitySection() {
  const { data: loginData, isLoading: loadingLogins } = useLoginHistory();
  const { data: changeData, isLoading: loadingChanges } = useChangeLog();
  const logins = loginData?.results ?? [];
  const changes = changeData?.results ?? [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <DataCard title="Últimos Acessos">
        <div className="space-y-2">
          {logins.map((l) => (
            <div key={l.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                <LogIn className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate">{l.username}</p>
                <p className="text-[11px] text-muted-foreground">
                  {new Date(l.timestamp).toLocaleString("pt-PT")}{l.ip_address ? ` · ${l.ip_address}` : ""}
                </p>
              </div>
            </div>
          ))}
          {!loadingLogins && logins.length === 0 && (
            <p className="text-center py-6 text-sm text-muted-foreground">Sem acessos registados</p>
          )}
        </div>
      </DataCard>

      <DataCard title="Últimas Alterações">
        <div className="space-y-2">
          {changes.map((c) => (
            <div key={c.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-warning/10 text-warning flex items-center justify-center flex-shrink-0">
                <History className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-foreground truncate">
                  <span className="font-medium">{c.username}</span> {c.action.toLowerCase()} <span className="text-muted-foreground">{c.object_repr}</span>
                </p>
                <p className="text-[11px] text-muted-foreground">{new Date(c.action_time).toLocaleString("pt-PT")}</p>
              </div>
            </div>
          ))}
          {!loadingChanges && changes.length === 0 && (
            <p className="text-center py-6 text-sm text-muted-foreground">Sem alterações registadas</p>
          )}
        </div>
      </DataCard>
    </div>
  );
}

export default function SettingsPage() {
  const [tab, setTab] = useState<TabKey>("seguranca");

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Definições" description="Segurança, utilizadores e atividade do sistema" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              "text-left p-4 rounded-2xl border transition-all duration-200",
              tab === t.key
                ? "gradient-primary border-transparent shadow-elevated"
                : "bg-card border-border hover:border-primary/30 hover:shadow-card"
            )}
          >
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center mb-3",
              tab === t.key ? "bg-white/15" : "bg-primary/10 text-primary"
            )}>
              <t.icon className={cn("w-5 h-5", tab === t.key && "text-primary-foreground")} />
            </div>
            <p className={cn("font-display font-semibold text-sm", tab === t.key ? "text-primary-foreground" : "text-foreground")}>
              {t.label}
            </p>
            <p className={cn("text-xs mt-0.5", tab === t.key ? "text-primary-foreground/70" : "text-muted-foreground")}>
              {t.desc}
            </p>
          </button>
        ))}
      </div>

      {tab === "seguranca" && <SecuritySection />}
      {tab === "utilizadores" && <UsersSection />}
      {tab === "atividade" && <ActivitySection />}
    </div>
  );
}
