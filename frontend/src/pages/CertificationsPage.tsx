import { PageHeader } from "@/components/PageComponents";
import {
  Search, Plus, MoreHorizontal, Eye, Edit, Trash2, X, Loader2, Link as LinkIcon, Copy,
  UserRound, IdCard, BookOpen, Clock, Award, CalendarDays, Hash, KeyRound, ImagePlus,
  Sparkles, ChevronRight, ChevronLeft, Check, ClipboardCheck, Download, LayoutGrid, List,
  FileText, Layers,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
  useCertifications, useCertification, useCreateCertification, useUpdateCertification, useDeleteCertification,
  type Certification, type CertificationPayload, type CertificationStatus
} from "@/hooks/useCertifications";

const STATUS_LABELS: Record<CertificationStatus, string> = {
  Aprovado:      "Aprovado",
  Reprovado:     "Reprovado",
  "Em Andamento": "Em Andamento",
};

const STATUS_COLORS: Record<CertificationStatus, string> = {
  Aprovado:       "bg-success/10 text-success",
  Reprovado:      "bg-destructive/10 text-destructive",
  "Em Andamento": "bg-warning/10 text-warning",
};

const STATUS_BAR: Record<CertificationStatus, string> = {
  Aprovado:       "bg-success",
  Reprovado:      "bg-destructive",
  "Em Andamento": "bg-warning",
};

const initAddForm = (): CertificationPayload => ({
  nome_completo: "", documento: "", curso: "", duracao: "", carga_horaria: "",
  data_conclusao: "", ano: "", codigo: "", status: "Aprovado",
  declaracao: "", descricao: "", unique_link: "", foto: null,
});

const ADD_STEPS = [
  { label: "Dados do Estudante", sub: "Informações Básicas", icon: UserRound },
  { label: "Dados do Curso",     sub: "Duração e Avaliação",  icon: BookOpen },
  { label: "Certificação",       sub: "Código e Link",        icon: KeyRound },
  { label: "Revisão",            sub: "Confirmar e Criar",    icon: ClipboardCheck },
] as const;

const VIEW_TABS = [
  { key: "detalhes", label: "Detalhes", icon: UserRound },
  { key: "curso",    label: "Curso",    icon: BookOpen },
  { key: "modulos",  label: "Módulos",  icon: Layers },
] as const;

function ReviewItem({ label, value, full }: { label: string; value?: string | null; full?: boolean }) {
  return (
    <div className={`bg-muted/50 rounded-lg p-3 ${full ? "sm:col-span-2" : ""}`}>
      <p className="text-[10px] text-muted-foreground uppercase font-medium">{label}</p>
      <p className="text-sm font-semibold text-foreground mt-0.5 whitespace-pre-wrap break-words">
        {value?.trim() ? value : <span className="font-normal text-muted-foreground italic">Não preenchido</span>}
      </p>
    </div>
  );
}

interface CertificationCardProps {
  certification: Certification;
  onView:   (c: Certification) => void;
  onEdit:   (c: Certification) => void;
  onDelete: (c: Certification) => void;
}

function CertificationCard({ certification: c, onView, onEdit, onDelete }: CertificationCardProps) {
  return (
    <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden hover:shadow-elevated transition-all">
      <div className={`h-1.5 ${STATUS_BAR[c.status]}`} />
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="relative flex-shrink-0">
            <div className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
              {c.nome_completo.split(" ").map((n) => n[0]).slice(0, 2).join("")}
            </div>
            <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card ${STATUS_BAR[c.status]}`} />
          </div>
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => onEdit(c)} title="Editar"
              className="p-1.5 rounded-full bg-muted text-muted-foreground hover:bg-muted/80 transition-colors">
              <Edit className="w-3.5 h-3.5" />
            </button>
            <button type="button" onClick={() => onDelete(c)} title="Remover"
              className="p-1.5 rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <p className="text-sm font-bold text-foreground truncate" title={c.nome_completo}>{c.nome_completo}</p>
        <span className={`inline-flex mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium ${STATUS_COLORS[c.status]}`}>
          {STATUS_LABELS[c.status]}
        </span>

        <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{c.curso}</span>
          </div>
          <div className="flex items-center gap-2">
            <IdCard className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{c.documento}</span>
          </div>
          <div className="h-px bg-border my-1.5" />
          <div className="flex items-center gap-2">
            <CalendarDays className="w-3.5 h-3.5 flex-shrink-0" />
            {new Date(c.data_conclusao).toLocaleDateString("pt-PT")}
          </div>
        </div>

        <button type="button" onClick={() => onView(c)}
          className="mt-4 w-full py-2 rounded-lg border border-border text-xs font-semibold text-foreground hover:bg-muted transition-colors flex items-center justify-center gap-1.5">
          <Eye className="w-3.5 h-3.5" /> Ver Detalhes
        </button>
      </div>
    </div>
  );
}

export default function CertificationsPage() {
  const [search, setSearch]             = useState("");
  const [filterStatus, setFilterStatus] = useState<"Todos" | CertificationStatus>("Todos");
  const [viewMode, setViewMode]         = useState<"grid" | "list">("grid");
  const [showAdd, setShowAdd]           = useState(false);
  const [addStep, setAddStep]           = useState(0);
  const [viewId, setViewId]             = useState<number | null>(null);
  const [viewTab, setViewTab]           = useState<typeof VIEW_TABS[number]["key"]>("detalhes");
  const [showEdit, setShowEdit]         = useState<Certification | null>(null);
  const [showDelete, setShowDelete]     = useState<Certification | null>(null);
  const [addForm, setAddForm]           = useState<CertificationPayload>(initAddForm());
  const [editForm, setEditForm]         = useState<Partial<CertificationPayload>>({});

  const params = {
    ...(search && { search }),
    ...(filterStatus !== "Todos" && { status: filterStatus }),
  };

  const { data, isLoading }   = useCertifications(params);
  const { data: viewData }    = useCertification(viewId ?? 0);
  const createCertification   = useCreateCertification();
  const updateCertification   = useUpdateCertification(showEdit?.id ?? 0);
  const deleteCertification   = useDeleteCertification();

  // Contagens por estado (respeitam a pesquisa atual) para o dropdown de filtro
  const searchParam = search ? { search } : {};
  const { data: countTodos }       = useCertifications({ ...searchParam, page_size: 1 });
  const { data: countAprovado }    = useCertifications({ ...searchParam, status: "Aprovado", page_size: 1 });
  const { data: countEmAndamento } = useCertifications({ ...searchParam, status: "Em Andamento", page_size: 1 });
  const { data: countReprovado }   = useCertifications({ ...searchParam, status: "Reprovado", page_size: 1 });

  const certifications = data?.results ?? [];

  const exportCsv = () => {
    if (certifications.length === 0) { toast.error("Não há certificações para exportar"); return; }
    const header = ["Nome", "Documento", "Curso", "Duração", "Carga Horária", "Data de Conclusão", "Ano", "Código", "Estado", "Link"];
    const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const rows = certifications.map((c) => [
      c.nome_completo, c.documento, c.curso, c.duracao, c.carga_horaria,
      c.data_conclusao, c.ano, c.codigo, c.status, c.link_completo ?? "",
    ]);
    const csv = [header, ...rows].map((r) => r.map(escape).join(",")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `certificacoes_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exportado!");
  };

  const handleAdd = () => {
    if (!addForm.nome_completo.trim() || !addForm.documento.trim() || !addForm.curso.trim() ||
        !addForm.data_conclusao || !addForm.codigo.trim()) {
      toast.error("Preencha nome, documento, curso, data de conclusão e código"); return;
    }
    createCertification.mutate(addForm, {
      onSuccess: () => { toast.success(`Certificação de "${addForm.nome_completo}" criada!`); setShowAdd(false); setAddForm(initAddForm()); },
      onError:   (e: Error) => toast.error(e.message || "Erro ao criar certificação"),
    });
  };

  const handleEdit = () => {
    if (!showEdit) return;
    updateCertification.mutate(editForm, {
      onSuccess: () => { toast.success("Certificação atualizada!"); setShowEdit(null); setEditForm({}); },
      onError:   (e: Error) => toast.error(e.message || "Erro ao atualizar certificação"),
    });
  };

  const handleDelete = () => {
    if (!showDelete) return;
    deleteCertification.mutate(showDelete.id, {
      onSuccess: () => { toast.success("Certificação removida"); setShowDelete(null); },
      onError:   () => toast.error("Erro ao remover certificação"),
    });
  };

  const openView = (id: number) => {
    setViewTab("detalhes");
    setViewId(id);
  };

  const openEdit = (c: Certification) => {
    setEditForm({
      nome_completo: c.nome_completo, documento: c.documento, curso: c.curso, duracao: c.duracao,
      carga_horaria: c.carga_horaria, data_conclusao: c.data_conclusao, ano: c.ano, codigo: c.codigo,
      status: c.status, declaracao: c.declaracao ?? "", descricao: c.descricao ?? "", unique_link: c.unique_link ?? "",
    });
    setShowEdit(c);
  };

  const copyLink = (link: string | null) => {
    if (!link) return;
    navigator.clipboard.writeText(link);
    toast.success("Link copiado!");
  };

  const initials = (name: string) => name.split(" ").map((n) => n[0]).slice(0, 2).join("");

  const inputClass = "w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground outline-none focus:ring-2 focus:ring-ring";

  // ── Estilo do assistente "Nova Certificação" (wizard de 3 passos) ──────────
  const wizInputClass = "w-full pl-3 pr-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-2 focus:ring-ring transition-colors";
  const wizInputIconClass = "w-full pl-9 pr-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-2 focus:ring-ring transition-colors";
  const wizLabelClass = "text-sm font-bold text-foreground mb-1.5 flex items-center gap-1";

  const canSubmitAdd = addForm.nome_completo.trim() && addForm.documento.trim() && addForm.curso.trim() &&
    addForm.data_conclusao && addForm.codigo.trim();

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Certificações" description={`${data?.count ?? 0} certificações no sistema`}>
        <button type="button" onClick={exportCsv}
          className="px-4 py-2 rounded-lg border border-border bg-card text-foreground text-sm font-medium hover:bg-muted transition-colors flex items-center gap-2">
          <Download className="w-4 h-4" /> Exportar CSV
        </button>
        <button type="button" onClick={() => { setAddForm(initAddForm()); setAddStep(0); setShowAdd(true); }}
          className="px-4 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-medium shadow-card hover:shadow-elevated transition-shadow flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nova Certificação
        </button>
      </PageHeader>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-center gap-2 px-4 py-2.5 bg-muted/40 border border-border rounded-full">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar por nome, documento ou curso..." title="Pesquisar certificações"
            className="bg-transparent outline-none text-sm flex-1 text-foreground placeholder:text-muted-foreground" />
          {search && <button type="button" onClick={() => setSearch("")}><X className="w-3.5 h-3.5 text-muted-foreground" /></button>}
        </div>

        <select title="Filtrar por estado" value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as "Todos" | CertificationStatus)}
          className="px-4 py-2.5 rounded-full border border-border bg-card text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-ring">
          <option value="Todos">Todos ({countTodos?.count ?? 0})</option>
          <option value="Aprovado">Aprovado ({countAprovado?.count ?? 0})</option>
          <option value="Em Andamento">Em Andamento ({countEmAndamento?.count ?? 0})</option>
          <option value="Reprovado">Reprovado ({countReprovado?.count ?? 0})</option>
        </select>

        <div className="flex items-center bg-muted/40 border border-border rounded-full p-1">
          <button type="button" onClick={() => setViewMode("grid")} title="Ver em grelha"
            className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors ${
              viewMode === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}>
            <LayoutGrid className="w-3.5 h-3.5" /> Grelha
          </button>
          <button type="button" onClick={() => setViewMode("list")} title="Ver em lista"
            className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors ${
              viewMode === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}>
            <List className="w-3.5 h-3.5" /> Lista
          </button>
        </div>
      </div>

      {viewMode === "grid" && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {certifications.map((c) => (
              <CertificationCard key={c.id} certification={c} onView={(c) => openView(c.id)} onEdit={openEdit} onDelete={setShowDelete} />
            ))}
          </div>
          {!isLoading && certifications.length === 0 && (
            <div className="text-center py-10 text-sm text-muted-foreground">Nenhuma certificação encontrada</div>
          )}
        </>
      )}

      {viewMode === "list" && (
      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Estudante</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">Curso</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Estado</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell">Conclusão</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell">Link</th>
                <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {certifications.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-sm font-bold flex-shrink-0">
                        {c.nome_completo.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{c.nome_completo}</p>
                        <p className="text-xs text-muted-foreground">{c.documento}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground hidden md:table-cell">{c.curso}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[c.status]}`}>
                      {STATUS_LABELS[c.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground hidden lg:table-cell">
                    {new Date(c.data_conclusao).toLocaleDateString("pt-PT")}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    {c.link_completo ? (
                      <button type="button" onClick={() => copyLink(c.link_completo)}
                        className="text-xs text-primary flex items-center gap-1 hover:underline">
                        <LinkIcon className="w-3 h-3" /> Copiar
                      </button>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button type="button" className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openView(c.id)}><Eye className="w-4 h-4 mr-2" /> Ver Detalhes</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEdit(c)}><Edit className="w-4 h-4 mr-2" /> Editar</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setShowDelete(c)} className="text-destructive"><Trash2 className="w-4 h-4 mr-2" /> Remover</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
              {!isLoading && certifications.length === 0 && (
                <tr><td colSpan={6} className="text-center py-8 text-sm text-muted-foreground">Nenhuma certificação encontrada</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-border text-xs text-muted-foreground">
          {data?.count ?? 0} certificações no total
        </div>
      </div>
      )}

      {/* ── Add Modal (assistente em 3 passos) ──────────────────────────────── */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="p-0 gap-0 max-w-4xl w-[95vw] overflow-hidden [&>button]:hidden">
          <DialogTitle className="sr-only">Nova Certificação</DialogTitle>
          <DialogDescription className="sr-only">Assistente para criar uma nova certificação em 3 passos.</DialogDescription>
          <div className="flex max-h-[85vh]">
            {/* Sidebar */}
            <div className="w-[260px] gradient-sidebar text-white flex-shrink-0 flex-col p-5 hidden sm:flex">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm leading-tight">Nova Certificação</p>
                  <p className="text-[10px] text-white/50 tracking-wide uppercase">Certificação</p>
                </div>
              </div>

              <nav className="space-y-1.5 flex-1">
                {ADD_STEPS.map((s, i) => (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => setAddStep(i)}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-colors ${
                      i === addStep ? "bg-sidebar-accent" : "opacity-60 hover:opacity-90"
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      i === addStep ? "bg-primary" : "bg-white/10"
                    }`}>
                      <s.icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{s.label}</p>
                      <p className="text-[10px] text-white/50 truncate">{s.sub}</p>
                    </div>
                  </button>
                ))}
              </nav>

              <div className="mt-6 bg-white/5 border border-white/10 rounded-xl p-3 flex gap-2 items-start">
                <Sparkles className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-white/70 leading-relaxed">
                  Se deixar o link em branco, ele é gerado automaticamente ao guardar a certificação.
                </p>
              </div>
            </div>

            {/* Conteúdo */}
            <div className="flex-1 flex flex-col min-w-0 bg-background">
              <div className="flex items-start justify-between px-5 sm:px-6 pt-5 sm:pt-6 pb-4 border-b border-border">
                <div className="min-w-0">
                  <h2 className="text-lg sm:text-xl font-display font-semibold text-foreground tracking-tight">Nova Certificação</h2>
                  <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1.5">
                    <span>Certificação</span>
                    <ChevronRight className="w-3 h-3 opacity-60" />
                    <span className="text-primary font-medium uppercase tracking-wider text-[11px]">{ADD_STEPS[addStep].label}</span>
                  </p>
                </div>
                <DialogClose asChild>
                  <button type="button" title="Fechar" className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors flex-shrink-0">
                    <X className="w-4 h-4" />
                  </button>
                </DialogClose>
              </div>

              <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5">
                {addStep === 0 && (
                  <div className="bg-card rounded-2xl border border-border p-4 sm:p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                        <UserRound className="w-4 h-4" />
                      </div>
                      <h3 className="font-bold text-foreground">Identificação</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className={wizLabelClass}>Nome Completo <span className="text-red-500">*</span></label>
                        <input title="Nome Completo" placeholder="Nome completo do estudante" value={addForm.nome_completo}
                          onChange={(e) => setAddForm({ ...addForm, nome_completo: e.target.value })} className={wizInputClass} />
                      </div>
                      <div>
                        <label className={wizLabelClass}>Documento <span className="text-red-500">*</span></label>
                        <div className="relative">
                          <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <input title="Documento" placeholder="BI, Passaporte..." value={addForm.documento}
                            onChange={(e) => setAddForm({ ...addForm, documento: e.target.value })} className={wizInputIconClass} />
                        </div>
                      </div>
                      <div>
                        <label className={wizLabelClass}>Estado</label>
                        <select title="Estado" value={addForm.status}
                          onChange={(e) => setAddForm({ ...addForm, status: e.target.value as CertificationStatus })} className={wizInputClass}>
                          <option value="Aprovado">Aprovado</option>
                          <option value="Em Andamento">Em Andamento</option>
                          <option value="Reprovado">Reprovado</option>
                        </select>
                      </div>
                      <div className="sm:col-span-2">
                        <label className={wizLabelClass}>Curso <span className="text-red-500">*</span></label>
                        <div className="relative">
                          <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <input title="Curso" placeholder="Nome do curso realizado" value={addForm.curso}
                            onChange={(e) => setAddForm({ ...addForm, curso: e.target.value })} className={wizInputIconClass} />
                        </div>
                      </div>
                      <div className="sm:col-span-2">
                        <label className={wizLabelClass}>Foto (opcional)</label>
                        <div className="relative">
                          <ImagePlus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <input title="Foto" type="file" accept="image/*"
                            onChange={(e) => setAddForm({ ...addForm, foto: e.target.files?.[0] ?? null })}
                            className={`${wizInputIconClass} file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-primary file:text-primary-foreground file:text-xs file:font-medium`} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {addStep === 1 && (
                  <div className="bg-card rounded-2xl border border-border p-4 sm:p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                        <Clock className="w-4 h-4" />
                      </div>
                      <h3 className="font-bold text-foreground">Duração e Avaliação</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={wizLabelClass}>Duração</label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <input title="Duração" placeholder="ex: 40 horas" value={addForm.duracao}
                            onChange={(e) => setAddForm({ ...addForm, duracao: e.target.value })} className={wizInputIconClass} />
                        </div>
                      </div>
                      <div>
                        <label className={wizLabelClass}>Carga Horária</label>
                        <div className="relative">
                          <Award className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <input title="Carga Horária" placeholder="ex: 40h" value={addForm.carga_horaria}
                            onChange={(e) => setAddForm({ ...addForm, carga_horaria: e.target.value })} className={wizInputIconClass} />
                        </div>
                      </div>
                      <div>
                        <label className={wizLabelClass}>Data de Conclusão <span className="text-red-500">*</span></label>
                        <div className="relative">
                          <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <input title="Data de Conclusão" type="date" value={addForm.data_conclusao}
                            onChange={(e) => setAddForm({ ...addForm, data_conclusao: e.target.value })} className={wizInputIconClass} />
                        </div>
                      </div>
                      <div>
                        <label className={wizLabelClass}>Ano</label>
                        <div className="relative">
                          <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <input title="Ano" placeholder="ex: 2026" value={addForm.ano}
                            onChange={(e) => setAddForm({ ...addForm, ano: e.target.value })} className={wizInputIconClass} />
                        </div>
                      </div>
                      <div className="sm:col-span-2">
                        <label className={wizLabelClass}>Descrição</label>
                        <textarea title="Descrição" rows={3} placeholder="Informações adicionais sobre a certificação..." value={addForm.descricao}
                          onChange={(e) => setAddForm({ ...addForm, descricao: e.target.value })} className={wizInputClass} />
                      </div>
                    </div>
                  </div>
                )}

                {addStep === 2 && (
                  <div className="space-y-4">
                    <div className="bg-card rounded-2xl border border-border p-4 sm:p-5 shadow-sm">
                      <div className="flex items-center gap-3 mb-5">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                          <KeyRound className="w-4 h-4" />
                        </div>
                        <h3 className="font-bold text-foreground">Código e Partilha</h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                          <label className={wizLabelClass}>Código <span className="text-red-500">*</span></label>
                          <div className="relative">
                            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input title="Código" placeholder="Código único da certificação" value={addForm.codigo}
                              onChange={(e) => setAddForm({ ...addForm, codigo: e.target.value })} className={wizInputIconClass} />
                          </div>
                        </div>
                        <div className="sm:col-span-2">
                          <label className={wizLabelClass}>Link Único (opcional)</label>
                          <div className="relative">
                            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input title="Link Único" placeholder="Deixe em branco para gerar automaticamente" value={addForm.unique_link}
                              onChange={(e) => setAddForm({ ...addForm, unique_link: e.target.value })} className={wizInputIconClass} />
                          </div>
                        </div>
                        <div className="sm:col-span-2">
                          <label className={wizLabelClass}>Declaração</label>
                          <textarea title="Declaração" rows={3} placeholder="Texto personalizado exibido na declaração pública..." value={addForm.declaracao}
                            onChange={(e) => setAddForm({ ...addForm, declaracao: e.target.value })} className={wizInputClass} />
                        </div>
                      </div>
                    </div>

                    <div className="bg-primary/5 border border-primary/15 rounded-2xl p-4 sm:p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <LinkIcon className="w-4 h-4 text-primary" />
                        <h4 className="font-bold text-sm text-foreground">Como funciona o link de partilha?</h4>
                      </div>
                      <div className="space-y-2.5">
                        {[
                          "O código identifica a certificação de forma única no sistema.",
                          "O link é usado para partilhar a declaração publicamente com o estudante.",
                          "Se deixar o link em branco, ele é gerado automaticamente ao guardar.",
                        ].map((text, i) => (
                          <div key={i} className="flex items-start gap-2.5">
                            <span className="w-5 h-5 rounded-full bg-primary/15 text-primary text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            <p className="text-xs text-muted-foreground leading-relaxed">{text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {addStep === 3 && (
                  <div className="bg-card rounded-2xl border border-border p-4 sm:p-5 shadow-sm space-y-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                        <ClipboardCheck className="w-4 h-4" />
                      </div>
                      <h3 className="font-bold text-foreground">Reveja os dados antes de criar</h3>
                    </div>

                    <div>
                      <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide mb-2">Estudante</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <ReviewItem label="Nome Completo" value={addForm.nome_completo} />
                        <ReviewItem label="Documento" value={addForm.documento} />
                        <ReviewItem label="Foto" value={addForm.foto?.name} />
                        <ReviewItem label="Estado" value={addForm.status} />
                      </div>
                    </div>

                    <div className="h-px bg-border" />

                    <div>
                      <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide mb-2">Curso</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <ReviewItem label="Curso" value={addForm.curso} />
                        <ReviewItem label="Duração" value={addForm.duracao} />
                        <ReviewItem label="Carga Horária" value={addForm.carga_horaria} />
                        <ReviewItem label="Data de Conclusão" value={addForm.data_conclusao} />
                        <ReviewItem label="Ano" value={addForm.ano} />
                        <ReviewItem label="Descrição" value={addForm.descricao} full />
                      </div>
                    </div>

                    <div className="h-px bg-border" />

                    <div>
                      <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide mb-2">Certificação</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <ReviewItem label="Código" value={addForm.codigo} />
                        <ReviewItem label="Link Único" value={addForm.unique_link || "Gerado automaticamente"} />
                        <ReviewItem label="Declaração" value={addForm.declaracao} full />
                      </div>
                    </div>

                    <div className="bg-muted/50 rounded-xl p-3 text-xs text-muted-foreground">
                      Nota: os módulos do curso ainda não podem ser adicionados por aqui — use o Django Admin para essa parte, por enquanto.
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-t border-border">
                <button type="button" onClick={() => setShowAdd(false)}
                  className="px-4 sm:px-5 py-2.5 rounded-full border border-border text-sm font-medium hover:bg-muted transition-colors">
                  Cancelar
                </button>
                <div className="flex items-center gap-2">
                  {addStep > 0 && (
                    <button type="button" onClick={() => setAddStep(addStep - 1)}
                      className="px-4 sm:px-5 py-2.5 rounded-full border border-border text-sm font-medium flex items-center gap-1 hover:bg-muted transition-colors">
                      <ChevronLeft className="w-4 h-4" /> Anterior
                    </button>
                  )}
                  {addStep < ADD_STEPS.length - 1 ? (
                    <button type="button" onClick={() => setAddStep(addStep + 1)}
                      className="px-4 sm:px-5 py-2.5 rounded-full gradient-primary text-primary-foreground text-sm font-medium flex items-center gap-1 hover:shadow-elevated transition-shadow">
                      Próximo <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button type="button" onClick={handleAdd} disabled={createCertification.isPending || !canSubmitAdd}
                      className="px-4 sm:px-5 py-2.5 rounded-full gradient-primary text-primary-foreground text-sm font-medium flex items-center gap-2 hover:shadow-elevated transition-shadow disabled:opacity-60">
                      {createCertification.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      Criar Certificação
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── View Modal (perfil com abas) ────────────────────────────────────── */}
      <Dialog open={viewId !== null} onOpenChange={() => setViewId(null)}>
        <DialogContent className="p-0 gap-0 max-w-3xl w-[95vw] overflow-hidden [&>button]:hidden">
          <DialogTitle className="sr-only">Detalhes da Certificação</DialogTitle>
          <DialogDescription className="sr-only">Ficha da certificação com informações do estudante, curso e módulos.</DialogDescription>
          {viewData && (
            <div className="flex max-h-[85vh]">
              {/* Sidebar */}
              <div className="w-[220px] gradient-sidebar text-white flex-shrink-0 flex-col p-4 hidden sm:flex">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                    <UserRound className="w-4 h-4" />
                  </div>
                  <p className="text-sm font-bold truncate">{viewData.nome_completo}</p>
                </div>

                <div className="mb-6 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 w-fit">
                  <span className={`w-1.5 h-1.5 rounded-full ${STATUS_BAR[viewData.status]}`} />
                  <span className="text-[11px] font-semibold">{STATUS_LABELS[viewData.status]}</span>
                </div>

                <nav className="space-y-1.5 flex-1">
                  {VIEW_TABS.map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => setViewTab(t.key)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-sm font-semibold transition-colors ${
                        viewTab === t.key ? "bg-primary text-primary-foreground" : "text-white/60 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <t.icon className="w-4 h-4" /> {t.label}
                    </button>
                  ))}
                </nav>

                <div className="mt-auto pt-4 border-t border-white/10 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-primary-foreground text-xs font-bold flex-shrink-0">
                    {initials(viewData.nome_completo)}
                  </div>
                  <p className="text-xs font-medium text-white/70 truncate">{viewData.nome_completo}</p>
                </div>
              </div>

              {/* Conteúdo */}
              <div className="flex-1 flex flex-col min-w-0 bg-background overflow-hidden">
                <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-border flex-shrink-0">
                  <h2 className="text-lg font-display font-semibold text-foreground tracking-tight">Perfil da Certificação</h2>
                  <DialogClose asChild>
                    <button type="button" title="Fechar" className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </DialogClose>
                </div>

                <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 space-y-5">
                  {/* Banner */}
                  <div className="rounded-2xl gradient-primary p-5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-primary-foreground/5 -translate-y-12 translate-x-12" />
                    <div className="relative flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center text-primary-foreground text-xl font-bold flex-shrink-0 overflow-hidden">
                        {viewData.foto ? <img src={viewData.foto} alt="" className="w-full h-full object-cover" /> : initials(viewData.nome_completo)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-display font-bold text-primary-foreground truncate">{viewData.nome_completo}</h3>
                        <p className="text-primary-foreground/70 text-sm truncate">{viewData.curso}</p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/15 text-primary-foreground">
                            {STATUS_LABELS[viewData.status]}
                          </span>
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-mono bg-white/15 text-primary-foreground">
                            {viewData.codigo}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {viewTab === "detalhes" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-card border border-border rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                            <UserRound className="w-4 h-4" />
                          </div>
                          <h4 className="font-bold text-sm text-foreground">Informações do Estudante</h4>
                        </div>
                        <div className="space-y-3">
                          <ReviewItem label="Nome Completo" value={viewData.nome_completo} />
                          <ReviewItem label="Documento" value={viewData.documento} />
                        </div>
                      </div>
                      <div className="bg-card border border-border rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-lg bg-warning/10 text-warning flex items-center justify-center flex-shrink-0">
                            <Award className="w-4 h-4" />
                          </div>
                          <h4 className="font-bold text-sm text-foreground">Situação da Certificação</h4>
                        </div>
                        <div className="space-y-3">
                          <ReviewItem label="Estado" value={STATUS_LABELS[viewData.status]} />
                          <ReviewItem label="Código" value={viewData.codigo} />
                          <ReviewItem label="Ano" value={viewData.ano} />
                        </div>
                      </div>
                    </div>
                  )}

                  {viewTab === "curso" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-card border border-border rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                            <BookOpen className="w-4 h-4" />
                          </div>
                          <h4 className="font-bold text-sm text-foreground">Dados do Curso</h4>
                        </div>
                        <div className="space-y-3">
                          <ReviewItem label="Curso" value={viewData.curso} />
                          <ReviewItem label="Duração" value={viewData.duracao} />
                          <ReviewItem label="Carga Horária" value={viewData.carga_horaria} />
                          <ReviewItem label="Data de Conclusão" value={new Date(viewData.data_conclusao).toLocaleDateString("pt-PT")} />
                        </div>
                      </div>
                      <div className="bg-card border border-border rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <h4 className="font-bold text-sm text-foreground">Descrição e Declaração</h4>
                        </div>
                        <div className="space-y-3">
                          <ReviewItem label="Descrição" value={viewData.descricao} />
                          <ReviewItem label="Declaração" value={viewData.declaracao} />
                        </div>
                      </div>
                    </div>
                  )}

                  {viewTab === "modulos" && (
                    <div className="space-y-4">
                      <div className="bg-card border border-border rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                            <Layers className="w-4 h-4" />
                          </div>
                          <h4 className="font-bold text-sm text-foreground">Módulos do Curso</h4>
                        </div>
                        {viewData.modulos.length > 0 ? (
                          <ul className="space-y-2">
                            {viewData.modulos.map((m) => (
                              <li key={m.id} className="flex items-center gap-2 text-sm text-foreground bg-muted/50 rounded-lg px-3 py-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" /> {m.nome}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-muted-foreground">Sem módulos associados.</p>
                        )}
                        <p className="text-[11px] text-muted-foreground mt-3">
                          Os módulos só podem ser adicionados ou editados no Django Admin, por agora.
                        </p>
                      </div>

                      {viewData.link_completo && (
                        <div className="bg-card border border-border rounded-2xl p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                              <LinkIcon className="w-4 h-4" />
                            </div>
                            <h4 className="font-bold text-sm text-foreground">Link de Partilha</h4>
                          </div>
                          <button type="button" onClick={() => copyLink(viewData.link_completo)}
                            className="w-full px-4 py-2.5 rounded-lg border border-border text-sm hover:bg-muted transition-colors flex items-center justify-center gap-2">
                            <Copy className="w-3.5 h-3.5" /> Copiar link de partilha
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 px-5 sm:px-6 py-4 border-t border-border flex-shrink-0">
                  <button type="button" onClick={() => setViewId(null)}
                    className="px-4 py-2.5 rounded-full border border-border text-sm font-medium hover:bg-muted transition-colors">
                    Fechar
                  </button>
                  <button type="button" onClick={() => { setViewId(null); openEdit(viewData); }}
                    className="px-4 py-2.5 rounded-full gradient-primary text-primary-foreground text-sm font-medium flex items-center gap-2 hover:shadow-elevated transition-shadow">
                    <Edit className="w-3.5 h-3.5" /> Editar
                  </button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Edit Modal ────────────────────────────────────────────────────── */}
      <Dialog open={!!showEdit} onOpenChange={() => setShowEdit(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Certificação</DialogTitle>
            <DialogDescription>Altere os dados da certificação.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Nome Completo</label>
              <input title="Nome Completo" value={editForm.nome_completo ?? ""}
                onChange={(e) => setEditForm({ ...editForm, nome_completo: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Documento</label>
              <input title="Documento" value={editForm.documento ?? ""}
                onChange={(e) => setEditForm({ ...editForm, documento: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Nova Foto (opcional)</label>
              <input title="Foto" type="file" accept="image/*"
                onChange={(e) => setEditForm({ ...editForm, foto: e.target.files?.[0] ?? null })} className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Curso</label>
              <input title="Curso" value={editForm.curso ?? ""}
                onChange={(e) => setEditForm({ ...editForm, curso: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Duração</label>
              <input title="Duração" value={editForm.duracao ?? ""}
                onChange={(e) => setEditForm({ ...editForm, duracao: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Carga Horária</label>
              <input title="Carga Horária" value={editForm.carga_horaria ?? ""}
                onChange={(e) => setEditForm({ ...editForm, carga_horaria: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Data de Conclusão</label>
              <input title="Data de Conclusão" type="date" value={editForm.data_conclusao ?? ""}
                onChange={(e) => setEditForm({ ...editForm, data_conclusao: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Ano</label>
              <input title="Ano" value={editForm.ano ?? ""}
                onChange={(e) => setEditForm({ ...editForm, ano: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Código</label>
              <input title="Código" value={editForm.codigo ?? ""}
                onChange={(e) => setEditForm({ ...editForm, codigo: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Estado</label>
              <select title="Estado" value={editForm.status ?? "Aprovado"}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value as CertificationStatus })} className={inputClass}>
                <option value="Aprovado">Aprovado</option>
                <option value="Em Andamento">Em Andamento</option>
                <option value="Reprovado">Reprovado</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Link Único</label>
              <input title="Link Único" value={editForm.unique_link ?? ""}
                onChange={(e) => setEditForm({ ...editForm, unique_link: e.target.value })} className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Declaração</label>
              <textarea title="Declaração" rows={3} value={editForm.declaracao ?? ""}
                onChange={(e) => setEditForm({ ...editForm, declaracao: e.target.value })} className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Descrição</label>
              <textarea title="Descrição" rows={3} value={editForm.descricao ?? ""}
                onChange={(e) => setEditForm({ ...editForm, descricao: e.target.value })} className={inputClass} />
            </div>
          </div>
          <DialogFooter>
            <button type="button" onClick={() => setShowEdit(null)} className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors">Cancelar</button>
            <button type="button" onClick={handleEdit} disabled={updateCertification.isPending}
              className="px-4 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-medium flex items-center gap-2 disabled:opacity-60">
              {updateCertification.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Guardar
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Modal ──────────────────────────────────────────────────── */}
      <Dialog open={!!showDelete} onOpenChange={() => setShowDelete(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Remover Certificação</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja remover a certificação de <strong>{showDelete?.nome_completo}</strong>? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button type="button" onClick={() => setShowDelete(null)} className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors">Cancelar</button>
            <button type="button" onClick={handleDelete} disabled={deleteCertification.isPending}
              className="px-4 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium flex items-center gap-2 disabled:opacity-60">
              {deleteCertification.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Remover
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
