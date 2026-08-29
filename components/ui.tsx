/* Primitivos de apresentação compartilhados. Seguros no servidor (sem hooks). */

import Link from "next/link";
import type { ReactNode } from "react";
import type { TaskStatus } from "@/lib/types";
import { TAREFA_STATUS_LABEL } from "@/lib/labels";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border border-line bg-surface ${className}`}>{children}</div>
  );
}

export function PageHeader({
  title,
  note,
  actions,
}: {
  title: string;
  note?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink">{title}</h1>
        {note && <p className="mt-1 max-w-2xl text-sm text-ink-3">{note}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function SectionTitle({ children, note }: { children: ReactNode; note?: string }) {
  return (
    <div className="mb-3">
      <h2 className="font-display text-base font-bold text-ink">{children}</h2>
      {note && <p className="mt-0.5 text-xs text-ink-3">{note}</p>}
    </div>
  );
}

export function Stat({
  label,
  value,
  sub,
  tone = "default",
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "default" | "green" | "gold" | "red";
}) {
  const toneClass = {
    default: "text-ink",
    green: "text-green",
    gold: "text-gold",
    red: "text-red",
  }[tone];
  return (
    <Card className="p-4">
      <p className="font-mono text-[11px] uppercase tracking-wider text-ink-3">{label}</p>
      <p className={`mt-1.5 font-display text-2xl font-extrabold tabular-nums ${toneClass}`}>
        {value}
      </p>
      {sub && <p className="mt-0.5 text-xs text-ink-3">{sub}</p>}
    </Card>
  );
}

const STATUS_STYLE: Record<TaskStatus, string> = {
  pendente: "bg-surface-2 text-ink-2 border-line",
  "aguardando-cliente": "bg-gold-soft text-gold border-gold/30",
  "em-andamento": "bg-navy-soft text-navy-ink border-navy/25",
  "em-revisao": "bg-navy-soft text-navy-ink border-navy/25",
  concluida: "bg-green-soft text-green border-green/30",
  atrasada: "bg-red-soft text-red border-red/30",
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-md border px-2 py-0.5 text-[11px] font-medium ${STATUS_STYLE[status]}`}
    >
      {TAREFA_STATUS_LABEL[status]}
    </span>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "green" | "gold" | "red" | "navy";
}) {
  const cls = {
    neutral: "bg-surface-2 text-ink-2 border-line",
    green: "bg-green-soft text-green border-green/30",
    gold: "bg-gold-soft text-gold border-gold/30",
    red: "bg-red-soft text-red border-red/30",
    navy: "bg-navy-soft text-navy-ink border-navy/25",
  }[tone];
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-md border px-2 py-0.5 text-[11px] font-medium ${cls}`}
    >
      {children}
    </span>
  );
}

export function Mono({ children }: { children: ReactNode }) {
  return (
    <span className="rounded border border-line bg-surface-2 px-1.5 py-0.5 font-mono text-[11.5px] text-ink-2">
      {children}
    </span>
  );
}

/** Barra de progresso. Verde só quando fecha — aqui verde significa confirmação. */
export function Progress({ pct }: { pct: number }) {
  const tone = pct === 100 ? "bg-green" : pct >= 50 ? "bg-navy" : "bg-gold";
  return (
    <div
      className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2"
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className={`h-full rounded-full ${tone}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Table({ head, children }: { head: string[]; children: ReactNode }) {
  return (
    <div className="scroll-x rounded-xl border border-line">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr>
            {head.map((h) => (
              <th
                key={h}
                className="whitespace-nowrap border-b border-line bg-surface-2 px-4 py-2.5 text-left font-display text-[11px] font-bold uppercase tracking-wider text-ink-2"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function Td({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <td className={`border-b border-line px-4 py-3 align-top text-ink-2 ${className}`}>
      {children}
    </td>
  );
}

export function Callout({
  label,
  tone = "navy",
  children,
}: {
  label: string;
  tone?: "navy" | "gold" | "green" | "red";
  children: ReactNode;
}) {
  const border = {
    navy: "border-l-navy",
    gold: "border-l-gold",
    green: "border-l-green",
    red: "border-l-red",
  }[tone];
  const text = {
    navy: "text-navy-ink",
    gold: "text-gold",
    green: "text-green",
    red: "text-red",
  }[tone];
  return (
    <div className={`rounded-lg border border-l-[3px] border-line bg-surface p-4 ${border}`}>
      <p className={`mb-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider ${text}`}>
        {label}
      </p>
      <div className="text-sm text-ink-2 [&_p]:mb-2 [&_p:last-child]:mb-0">{children}</div>
    </div>
  );
}

export function EmptyState({ title, note }: { title: string; note?: string }) {
  return (
    <Card className="p-10 text-center">
      <p className="font-display text-sm font-bold text-ink">{title}</p>
      {note && <p className="mx-auto mt-1 max-w-md text-sm text-ink-3">{note}</p>}
    </Card>
  );
}

/** Telas de Fase 2/3 renderizam isto quando o módulo está desligado. */
export function ModuleDisabled({ nome, fase, descricao }: { nome: string; fase: number; descricao: string }) {
  return (
    <Card className="p-10 text-center">
      <p className="font-mono text-[11px] uppercase tracking-wider text-gold">Fase {fase}</p>
      <p className="mt-2 font-display text-lg font-extrabold text-ink">{nome} está desativado</p>
      <p className="mx-auto mt-2 max-w-lg text-sm text-ink-2">{descricao}</p>
      <p className="mx-auto mt-4 max-w-lg text-sm text-ink-3">
        Capacidades de Fase 2 e 3 chegam desligadas por padrão. A diretoria liga cada uma em{" "}
        <Link href="/admin/modulos" className="text-navy-ink underline underline-offset-2">
          Admin › Módulos
        </Link>{" "}
        quando ela estiver de fato pronta — sem redeploy.
      </p>
    </Card>
  );
}

export function currency(v: number): string {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

export function shortDate(iso: string | null): string {
  if (!iso) return "—";
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
}

export function dateTime(iso: string | null): string {
  if (!iso) return "—";
  const [date, time] = iso.split("T");
  const [y, m, d] = date.split("-");
  return `${d}/${m}/${y} ${time ? time.slice(0, 5) : ""}`.trim();
}
