"use client";

/* Screen 02 — Firm dashboard.
 *
 * Cards for faturamento, índices, funcionários and per-department competency
 * status, per the draft. Screen 03 (hierarchical views) is not a separate
 * route: it is this screen rendering less for an executor, which is what the
 * draft actually describes.
 */

import Link from "next/link";
import { useSession } from "@/components/session";
import { Card, Progress, SectionTitle, Stat, StatusBadge, currency } from "@/components/ui";
import { canAccessAdmin, visibleDepartments } from "@/lib/access";
import {
  COMPETENCIA_ATUAL,
  DEPARTMENTS,
  bloqueiosPorCliente,
  departmentProgress,
  firmMetrics,
  getClient,
  tasksFor,
} from "@/lib/data";

export default function DashboardPage() {
  const { viewer } = useSession();
  const depts = visibleDepartments(viewer);
  const isExecutor = viewer.role === "executor";

  const metrics = firmMetrics(COMPETENCIA_ATUAL);
  const progress = departmentProgress(COMPETENCIA_ATUAL).filter((p) =>
    depts.includes(p.slug as never),
  );
  const minhasTarefas = tasksFor({
    competenciaId: COMPETENCIA_ATUAL,
    assigneeId: viewer.user.id,
  }).filter((t) => t.status !== "concluida");

  const bloqueios = bloqueiosPorCliente(COMPETENCIA_ATUAL).filter(
    (b) => b.bloqueadas + b.atrasadas > 0,
  );

  return (
    <>
      <div className="mb-7">
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink">
          Olá, {viewer.user.nome.split(" ")[0]}
        </h1>
        <p className="mt-1 text-sm text-ink-3">
          {isExecutor
            ? "Suas tarefas e o andamento do seu departamento nesta competência."
            : "Visão do escritório na competência aberta."}
        </p>
      </div>

      {/* Executors do not see firm-level financials — screen 03's rule. */}
      {!isExecutor && (
        <div className="mb-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat
            label="Faturamento mensal"
            value={currency(metrics.faturamentoMensal)}
            sub={`Ticket médio ${currency(metrics.ticketMedio)}`}
          />
          <Stat
            label="Clientes ativos"
            value={String(metrics.clientesAtivos)}
            sub={`${metrics.clientesEncerrados} encerrado(s)`}
          />
          <Stat label="Funcionários" value={String(metrics.funcionarios)} sub="Equipe ativa" />
          <Stat
            label="Competência concluída"
            value={`${metrics.pctConcluido}%`}
            sub={`${metrics.tarefasConcluidas} de ${metrics.tarefasTotal} tarefas`}
            tone={metrics.pctConcluido === 100 ? "green" : "default"}
          />
        </div>
      )}

      {/* The two numbers that actually predict a missed prazo. */}
      <div className="mb-7 grid gap-3 sm:grid-cols-2">
        <Stat
          label="Aguardando cliente"
          value={String(metrics.aguardandoCliente)}
          sub="Tarefas travadas em documento não enviado — o gargalo nº 1"
          tone="gold"
        />
        <Stat
          label="Atrasadas"
          value={String(metrics.atrasadas)}
          sub="Prazo já vencido nesta competência"
          tone={metrics.atrasadas > 0 ? "red" : "green"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SectionTitle note="Percentual da carga fechada nesta competência">
            {isExecutor ? "Meu departamento" : "Status por departamento"}
          </SectionTitle>
          <div className="grid gap-3 sm:grid-cols-2">
            {progress.map((p) => {
              const dept = DEPARTMENTS.find((d) => d.slug === p.slug)!;
              return (
                <Link key={p.slug} href={`/departamentos/${p.slug}`}>
                  <Card className="p-4 transition-colors hover:border-line-strong">
                    <div className="flex items-baseline justify-between">
                      <p className="font-display text-sm font-bold text-ink">{p.nome}</p>
                      <p className="font-display text-lg font-extrabold tabular-nums text-ink">
                        {p.pct}%
                      </p>
                    </div>
                    <div className="mt-2">
                      <Progress pct={p.pct} />
                    </div>
                    <p className="mt-2 text-xs text-ink-3">
                      {p.concluidas}/{p.total} concluídas
                      {p.aguardandoCliente > 0 && ` · ${p.aguardandoCliente} aguardando cliente`}
                      {p.atrasadas > 0 && ` · ${p.atrasadas} atrasada(s)`}
                    </p>
                    {dept.dependeDe.length > 0 && (
                      <p className="mt-2 font-mono text-[10.5px] text-ink-3">
                        depende de{" "}
                        {dept.dependeDe
                          .map((s) => DEPARTMENTS.find((d) => d.slug === s)?.nome)
                          .join(" + ")}
                      </p>
                    )}
                  </Card>
                </Link>
              );
            })}
          </div>

          <div className="mt-7">
            <SectionTitle note="Ordenado por quem está mais travado">
              Clientes que precisam de atenção
            </SectionTitle>
            {bloqueios.length === 0 ? (
              <Card className="p-6 text-center text-sm text-ink-3">
                Nenhum cliente travado nesta competência.
              </Card>
            ) : (
              <Card className="divide-y divide-line">
                {bloqueios.slice(0, 6).map((b) => (
                  <Link
                    key={b.client.id}
                    href={`/clientes/${b.client.id}`}
                    className="flex items-center gap-4 p-3.5 hover:bg-surface-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display text-sm font-bold text-ink">
                        {b.client.nomeFantasia}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-ink-3">
                        {b.documentos.length > 0
                          ? `Falta: ${b.documentos.join(", ")}`
                          : "Sem documento pendente registrado"}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {b.atrasadas > 0 && (
                        <span className="rounded-md border border-red/30 bg-red-soft px-2 py-0.5 text-[11px] font-medium text-red">
                          {b.atrasadas} atrasada(s)
                        </span>
                      )}
                      {b.bloqueadas > 0 && (
                        <span className="rounded-md border border-gold/30 bg-gold-soft px-2 py-0.5 text-[11px] font-medium text-gold">
                          {b.bloqueadas} aguardando
                        </span>
                      )}
                      <span className="w-10 text-right font-display text-sm font-bold tabular-nums text-ink-2">
                        {b.pct}%
                      </span>
                    </div>
                  </Link>
                ))}
              </Card>
            )}
          </div>
        </div>

        <div>
          <SectionTitle note={`${minhasTarefas.length} em aberto`}>Minhas tarefas</SectionTitle>
          {minhasTarefas.length === 0 ? (
            <Card className="p-6 text-center text-sm text-ink-3">
              Nada em aberto atribuído a você.
            </Card>
          ) : (
            <Card className="divide-y divide-line">
              {minhasTarefas.slice(0, 10).map((t) => (
                <div key={t.id} className="p-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-[13px] font-semibold text-ink">{t.titulo}</p>
                    <StatusBadge status={t.status} />
                  </div>
                  <p className="mt-1 text-xs text-ink-3">
                    {getClient(t.clientId)?.nomeFantasia} · vence {t.prazo.slice(8)}/
                    {t.prazo.slice(5, 7)}
                  </p>
                  {t.bloqueadaPorDocumento && (
                    <p className="mt-1 font-mono text-[10.5px] text-gold">
                      travada: {t.bloqueadaPorDocumento}
                    </p>
                  )}
                </div>
              ))}
            </Card>
          )}

          {canAccessAdmin(viewer) && (
            <div className="mt-6">
              <SectionTitle>Diretoria</SectionTitle>
              <Card className="p-4">
                <p className="text-sm text-ink-2">
                  Integrações, papéis, procurações, console de segurança e fila LGPD ficam
                  no painel administrativo.
                </p>
                <Link
                  href="/admin"
                  className="mt-3 inline-block rounded-lg border border-line bg-surface-2 px-3 py-1.5 text-[13px] font-semibold text-navy-ink hover:border-navy"
                >
                  Abrir painel administrativo
                </Link>
              </Card>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
