import { PageHeader } from "@/components/PageComponents";
import { Search, Eye, X, Mail, Phone } from "lucide-react";
import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { useSubmissions, type Submission } from "@/hooks/useSubmissions";

const SERVICE_COLORS = [
  { match: "ISO 14001", color: "bg-success/10 text-success" },
  { match: "ISO 9001",  color: "bg-primary/10 text-primary" },
  { match: "ISO 45001", color: "bg-destructive/10 text-destructive" },
  { match: "Higiene",   color: "bg-warning/10 text-warning" },
  { match: "Monitoria", color: "bg-info/10 text-info" },
  { match: "NEBOSH",    color: "bg-success/10 text-success" },
];

function serviceColor(service: string) {
  return SERVICE_COLORS.find((s) => service.includes(s.match))?.color ?? "bg-muted text-muted-foreground";
}

export default function SubmissionsPage() {
  const [search, setSearch]     = useState("");
  const [showView, setShowView] = useState<Submission | null>(null);

  const { data, isLoading } = useSubmissions(search ? { search } : undefined);
  const submissions = data?.results ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Submissões" description="Pedidos de contacto recebidos através do site" />

      <div className="flex-1 flex items-center gap-2 px-3 py-2.5 bg-card border border-border rounded-lg max-w-md">
        <Search className="w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Pesquisar por nome, email ou serviço..." title="Pesquisar submissões"
          className="bg-transparent outline-none text-sm flex-1 text-foreground placeholder:text-muted-foreground" />
        {search && <button type="button" onClick={() => setSearch("")}><X className="w-3.5 h-3.5 text-muted-foreground" /></button>}
      </div>

      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Nome</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">Contacto</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Serviço</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell">Data</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Consentimento</th>
                <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((s) => (
                <tr key={s.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-foreground">{s.name}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <p className="text-xs text-muted-foreground">{s.email}</p>
                    <p className="text-xs text-muted-foreground">{s.phone}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${serviceColor(s.service)}`}>
                      {s.service}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground hidden lg:table-cell">
                    {new Date(s.created_at).toLocaleString("pt-PT")}
                  </td>
                  <td className="px-4 py-3">
                    {s.consent ? (
                      <span className="text-success text-xs font-semibold">✓ Sim</span>
                    ) : (
                      <span className="text-destructive text-xs font-semibold">✗ Não</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button type="button" onClick={() => setShowView(s)}
                      className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground" title="Ver detalhes">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {!isLoading && submissions.length === 0 && (
                <tr><td colSpan={6} className="text-center py-8 text-sm text-muted-foreground">Nenhuma submissão encontrada</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-border text-xs text-muted-foreground">
          {data?.count ?? 0} submissões no total
        </div>
      </div>

      {/* ── View Modal ────────────────────────────────────────────────────── */}
      <Dialog open={!!showView} onOpenChange={() => setShowView(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Detalhes da Submissão</DialogTitle></DialogHeader>
          {showView && (
            <div className="space-y-4 py-2">
              <div>
                <h3 className="font-semibold text-foreground">{showView.name}</h3>
                <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                  <a href={`mailto:${showView.email}`} className="flex items-center gap-1 hover:text-primary">
                    <Mail className="w-3.5 h-3.5" /> {showView.email}
                  </a>
                  <a href={`tel:${showView.phone}`} className="flex items-center gap-1 hover:text-primary">
                    <Phone className="w-3.5 h-3.5" /> {showView.phone}
                  </a>
                </div>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-[10px] text-muted-foreground uppercase font-medium">Serviço</p>
                <p className="text-sm font-semibold text-foreground mt-0.5">{showView.service}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-[10px] text-muted-foreground uppercase font-medium">Mensagem</p>
                <p className="text-sm text-foreground mt-0.5 whitespace-pre-wrap">{showView.message}</p>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Recebida em {new Date(showView.created_at).toLocaleString("pt-PT")}</span>
                <span>{showView.consent ? "Consentiu comunicações" : "Não consentiu comunicações"}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
