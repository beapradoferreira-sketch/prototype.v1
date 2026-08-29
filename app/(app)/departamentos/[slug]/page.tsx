"use client";

/* Área do departamento.
 *
 * Uma rota atende os quatro departamentos. O comportamento importante é a
 * cadeia de dependência: o Contábil espera Fiscal e Pessoal, então a tela dele
 * mostra o preparo do que vem acima em vez de fingir que o trabalho pode
 * começar antes. Um executor que chega a um departamento fora do seu escopo é
 * recusado aqui, não apenas escondido do menu.
 */

import Link from "next/link";
import { Suspense, use, useState } from "react";
import { useSession } from "@/components/session";
import {
  Badge, Callout, Card, PageHeader, Progress, SectionTitle, StatusBadge,
  Table, Td, shortDate,
} from "@/components/ui";
import { canAccessDepartment } from "@/lib/access";
import { ClientFilter, ClientFilterBanner, useClientFilter } from "@/components/client-filter";
import {
  COMPETENCIAS, COMPETENCIA_ATUAL, departmentProgress,
  getClient, getDepartment, getUser, tasksFor,
} from "@/lib/data";
import type { TaskStatus } from "@/lib/types";

const FILTERS: { key: TaskStatus | "todas"; label: string }[] = [
  { key: "todas", label: "Todas" },
  { key: "atrasada", label: "Atrasadas" },
  { key: "aguardando-cliente", label: "Aguardando cliente" },
  { key: "em-andamento", label: "Em andamento" },
  { key: "em-revisao", label: "Em revisão" },
  { key: "concluida", label: "Concluídas" },
];

export default function DepartamentoPage({ params }: { params: Promise<{ slug: string }> }) {
  // useSearchParams exige fronteira de Suspense em rota pré-renderizada.
  return (
    <Suspense fallback={null}>
      <DepartamentoConteudo params={params} />
    </Suspense>
  );
}

function DepartamentoConteudo({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { viewer } = useSession();
  const [compId, setCompId] = useState(COMPETENCIA_ATUAL);
  const [filtro, setFiltro] = useState<TaskStatus | "todas">("todas");
  const { clienteId } = useClientFilter();

  const dept = getDepartment(slug);
  if (!dept) {
    return (
      <Card className="p-10 text-center">
        <p className="font-display font-bold text-ink">Departamento não encontrado</p>
      </Card>
    );
  }

  // O escopo é aplicado na rota, não apenas na navegação.
  if (!canAccessDepartment(viewer, dept.slug)) {
    return (
      <Card className="p-10 text-center">
        <p className="font-display text-base font-bold text-ink">Fora do seu escopo</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink-2">
          Seu papel é executor no departamento{" "}
          {viewer.departamentos.map((d) => getDepartment(d)?.nome).join(", ")}. O acesso a{" "}
          {dept.nome} é negado na rota, não apenas escondido do menu — e a tentativa fica
          registrada no log de auditoria.
        </p>
        <Link href="/dashboard" className="mt-4 inline-block text-sm text-navy-ink underline">
          Voltar ao painel
        </Link>
      </Card>
    );
  }

  const all = tasksFor({
    competenciaId: compId,
    departamento: dept.slug,
    clientId: clienteId || undefined,
  });
  const tasks = filtro === "todas" ? all : all.filter((t) => t.status === filtro);
  const progress = departmentProgress(compId, clienteId || undefined).find(
    (p) => p.slug === dept.slug,
  )!;

  // Preparo do que vem acima — a cadeia é sequencial e travada por documento.
  const upstreamProgress = departmentProgress(compId, clienteId || undefined);
  const upstream = dept.dependeDe.map((s) => ({
    dept: getDepartment(s)!,
    progress: upstreamProgress.find((p) => p.slug === s)!,
  }));

  return (
    <>
      <PageHeader
        title={dept.nome}
        note={dept.descricao}
        actions={
          <>
            <ClientFilter />
            <label className="flex items-center gap-2">
              <span className="font-mono text-[10.5px] uppercase tracking-wider text-ink-3">
                Competência
              </span>
              <select
                value={compId}
                onChange={(e) => setCompId(e.target.value)}
                className="rounded-lg border border-line bg-surface px-2 py-1.5 text-[13px] text-ink"
              >
                {COMPETENCIAS.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </label>
          </>
        }
      />

      <ClientFilterBanner />

      <div className="mb-6 grid gap-3 sm:grid-cols-4">
        <Card className="p-4">
          <p className="font-mono text-[11px] uppercase tracking-wider text-ink-3">Concluído</p>
          <p className="mt-1 font-display text-2xl font-extrabold tabular-nums text-ink">
            {progress.pct}%
          </p>
          <div className="mt-2"><Progress pct={progress.pct} /></div>
        </Card>
        <Card className="p-4">
          <p className="font-mono text-[11px] uppercase tracking-wider text-ink-3">Tarefas</p>
          <p className="mt-1 font-display text-2xl font-extrabold tabular-nums text-ink">
            {progress.total}
          </p>
          <p className="mt-1 text-xs text-ink-3">{progress.concluidas} concluídas</p>
        </Card>
        <Card className="p-4">
          <p className="font-mono text-[11px] uppercase tracking-wider text-ink-3">Aguardando cliente</p>
          <p className="mt-1 font-display text-2xl font-extrabold tabular-nums text-gold">
            {progress.aguardandoCliente}
          </p>
        </Card>
        <Card className="p-4">
          <p className="font-mono text-[11px] uppercase tracking-wider text-ink-3">Atrasadas</p>
          <p className={`mt-1 font-display text-2xl font-extrabold tabular-nums ${progress.atrasadas > 0 ? "text-red" : "text-green"}`}>
            {progress.atrasadas}
          </p>
        </Card>
      </div>

      {upstream.length > 0 && (
        <div className="mb-6">
          <Callout
            label="Cadeia de dependência"
            tone={upstream.every((u) => u.progress.pct === 100) ? "green" : "gold"}
          >
            <p>
              {dept.nome} depende de{" "}
              {upstream.map((u) => u.dept.nome).join(" e ")}. Sem documento em mãos, o fiscal
              não lança, o pessoal não processa a folha e a contabilidade não escritura — a
              escrituração não fecha antes do que vem acima.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {upstream.map((u) => (
                <Link key={u.dept.slug} href={`/departamentos/${u.dept.slug}`}>
                  <Badge tone={u.progress.pct === 100 ? "green" : "gold"}>
                    {u.dept.nome} {u.progress.pct}%
                  </Badge>
                </Link>
              ))}
            </div>
          </Callout>
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-1.5">
        {FILTERS.map((f) => {
          const count = f.key === "todas" ? all.length : all.filter((t) => t.status === f.key).length;
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setFiltro(f.key)}
              className={`rounded-lg border px-2.5 py-1 text-[12.5px] transition-colors ${
                filtro === f.key
                  ? "border-navy bg-navy-soft font-semibold text-navy-ink"
                  : "border-line bg-surface text-ink-2 hover:border-line-strong"
              }`}
            >
              {f.label} <span className="font-mono text-[11px] text-ink-3">{count}</span>
            </button>
          );
        })}
      </div>

      <Table head={["Tarefa", "Cliente", "Responsável", "Prazo", "Status"]}>
        {tasks.map((t) => (
          <tr key={t.id} className="hover:bg-surface-2">
            <Td>
              <span className="font-medium text-ink">{t.titulo}</span>
              {t.bloqueadaPorDocumento && (
                <p className="mt-1 font-mono text-[10.5px] text-gold">
                  travada: {t.bloqueadaPorDocumento}
                </p>
              )}
            </Td>
            <Td>
              <Link href={`/clientes/${t.clientId}`} className="hover:text-navy-ink">
                {getClient(t.clientId)?.nomeFantasia}
              </Link>
            </Td>
            {/* Exatamente um responsável, sempre — posse compartilhada é irrepresentável. */}
            <Td>{getUser(t.assigneeId)?.nome ?? "—"}</Td>
            <Td className="tabular-nums">{shortDate(t.prazo)}</Td>
            <Td><StatusBadge status={t.status} /></Td>
          </tr>
        ))}
      </Table>

      {tasks.length === 0 && (
        <Card className="mt-4 p-8 text-center text-sm text-ink-3">
          Nenhuma tarefa neste filtro.
        </Card>
      )}
    </>
  );
}
