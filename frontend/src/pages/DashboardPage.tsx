import { StatCard } from "@/components/StatCard";
import { DataCard, PageHeader } from "@/components/PageComponents";
import { Award, CheckCircle, Clock, XCircle, Inbox, Plus, Pencil, Trash2, type LucideIcon } from "lucide-react";
import {
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, Tooltip, CartesianGrid,
} from "recharts";
import { useCertifications } from "@/hooks/useCertifications";
import { useSubmissions } from "@/hooks/useSubmissions";
import { useChangeLog } from "@/hooks/useAuth";

const STATUS_COLORS = {
  Aprovado:       "hsl(152, 60%, 42%)",
  "Em Andamento": "hsl(38, 92%, 50%)",
  Reprovado:      "hsl(0, 72%, 51%)",
};

const ACTION_STYLE: Record<string, { icon: LucideIcon; bg: string }> = {
  Criado:     { icon: Plus,   bg: "bg-success" },
  Atualizado: { icon: Pencil, bg: "bg-primary" },
  Removido:   { icon: Trash2, bg: "bg-destructive" },
};

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "agora mesmo";
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `há ${days} dia${days > 1 ? "s" : ""}`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `há ${weeks} semana${weeks > 1 ? "s" : ""}`;
  const months = Math.floor(days / 30);
  if (months < 12) return `há ${months} mês${months > 1 ? "es" : ""}`;
  const years = Math.floor(days / 365);
  return `há ${years} ano${years > 1 ? "s" : ""}`;
}

export default function DashboardPage() {
  // Lista base — usada também para a distribuição por ano do gráfico de barras.
  // A paginação do backend limita a 50 registos por página, por isso o gráfico
  // por ano reflete apenas os registos mais recentes quando há mais de 50 certificações.
  const { data: allCerts }      = useCertifications();
  const { data: aprovadas }     = useCertifications({ status: "Aprovado", page_size: 1 });
  const { data: emAndamento }   = useCertifications({ status: "Em Andamento", page_size: 1 });
  const { data: reprovadas }    = useCertifications({ status: "Reprovado", page_size: 1 });
  const { data: submissions }   = useSubmissions({ page_size: 1 });
  const { data: changeLog, isLoading: loadingChanges } = useChangeLog();
  const recentActions = (changeLog?.results ?? []).slice(0, 4);

  const totalCertifications = allCerts?.count ?? 0;
  const totalAprovadas      = aprovadas?.count ?? 0;
  const totalEmAndamento    = emAndamento?.count ?? 0;
  const totalReprovadas     = reprovadas?.count ?? 0;
  const totalSubmissions    = submissions?.count ?? 0;

  const statusPie = [
    { name: "Aprovado",      value: totalAprovadas,   color: STATUS_COLORS.Aprovado },
    { name: "Em Andamento",  value: totalEmAndamento, color: STATUS_COLORS["Em Andamento"] },
    { name: "Reprovado",     value: totalReprovadas,  color: STATUS_COLORS.Reprovado },
  ];

  const anoCounts = new Map<string, number>();
  (allCerts?.results ?? []).forEach((c) => {
    anoCounts.set(c.ano, (anoCounts.get(c.ano) ?? 0) + 1);
  });
  const anoChart = Array.from(anoCounts.entries())
    .map(([ano, total]) => ({ ano, total }))
    .sort((a, b) => a.ano.localeCompare(b.ano));

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in">

      <div className="rounded-2xl gradient-primary p-4 md:p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-primary-foreground/5 -translate-y-10 translate-x-10" />
        <div className="relative">
          <p className="text-primary-foreground/70 text-xs font-medium">Painel Administrativo</p>
          <h1 className="text-lg md:text-xl font-display font-bold text-primary-foreground mt-1">
            CPTec Academy
          </h1>
          <p className="text-primary-foreground/60 text-xs mt-1 max-w-md">
            {totalCertifications} certificações · {totalSubmissions} submissões
          </p>
        </div>
      </div>

      <PageHeader title="Visão Geral" />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 md:gap-3">
        <StatCard title="Total de Certificações" value={totalCertifications} icon={Award} variant="gradient" />
        <StatCard title="Aprovadas" value={totalAprovadas} icon={CheckCircle} variant="success" />
        <StatCard title="Em Andamento" value={totalEmAndamento} icon={Clock} variant="warning" />
        <StatCard title="Reprovadas" value={totalReprovadas} icon={XCircle} variant="default" />
        <StatCard title="Submissões" value={totalSubmissions} icon={Inbox} variant="default" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 md:gap-4">
        <DataCard title="Certificações por Ano" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={anoChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 18%, 91%)" />
              <XAxis dataKey="ano" tick={{ fontSize: 11 }} stroke="hsl(215, 14%, 50%)" />
              <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid hsl(214, 18%, 91%)", fontSize: "12px" }} />
              <Bar dataKey="total" fill="hsl(217, 91%, 50%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          {anoChart.length === 0 && (
            <p className="text-center text-xs text-muted-foreground">Sem dados suficientes</p>
          )}
        </DataCard>

        <DataCard title="Certificações por Estado">
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={statusPie}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={65}
                dataKey="value"
                paddingAngle={3}
                strokeWidth={0}
              >
                {statusPie.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-3 mt-1 flex-wrap">
            {statusPie.map((p) => (
              <div key={p.name} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                {p.name}
              </div>
            ))}
          </div>
        </DataCard>

        <DataCard title="Ações Recentes">
          {recentActions.length > 0 ? (
            <div>
              {recentActions.map((c, i) => {
                const style = ACTION_STYLE[c.action] ?? ACTION_STYLE.Atualizado;
                return (
                  <div key={c.id} className="flex gap-2.5">
                    <div className="flex flex-col items-center">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${style.bg}`}>
                        <style.icon className="w-3 h-3 text-white" />
                      </div>
                      {i < recentActions.length - 1 && <div className="w-px flex-1 bg-border my-1" />}
                    </div>
                    <div className="flex-1 pb-3 min-w-0">
                      <p className="text-xs font-bold text-primary truncate">{c.object_repr}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {c.username} {c.action.toLowerCase()}
                      </p>
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground/70 mt-0.5">
                        <Clock className="w-2.5 h-2.5" /> {relativeTime(c.action_time)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            !loadingChanges && <p className="text-center text-xs text-muted-foreground py-4">Sem ações recentes</p>
          )}
        </DataCard>
      </div>
    </div>
  );
}
