"use client";

/* Tela 05 — Central de status.
 *
 * A especificação coloca esta como a coisa de maior alavancagem a construir: a
 * mais barata de escrever, ataca a dor mais citada (ninguém sabe onde o cliente
 * travou) e não depende de API externa. É a matriz cliente × departamento da
 * competência, para o gestor ver o mês inteiro numa grade só.
 */

import Link from "next/link";
import { useState } from "react";
import { useSession } from "@/components/session";
import { Card, PageHeader, Progress, Badge } from "@/components/ui";
import { visibleDepartments } from "@/lib/access";
import {
  CLIENTS,
  COMPETENCIAS,
  COMPETENCIA_ATUAL,
  DEPARTMENTS,
  departmentProgress,
  getCompetencia,
  tasksFor,
} from "@/lib/data";
import { REGIME_LABEL } from "@/lib/labels";

function cellTone(pct: number, atrasadas: number, aguardando: number) {
  if (atrasadas > 0) return "bg-red-soft text-red border-red/30";
  if (pct === 100) return "bg-green-soft text-green border-green/30";
  if (aguardando > 0) return "bg-gold-soft text-gold border-gold/30";
  return "bg-surface-2 text-ink-2 border-line";
}

export default function StatusPage() {
  const { viewer } = useSession();
  const [compId, setCompId] = useState(COMPETENCIA_ATUAL);
  const depts = DEPARTMENTS.filter((d) => visibleDepartments(viewer).includes(d.slug));
  const comp = getCompetencia(compId)!;
  const ativos = CLIENTS.filter((c) => c.ativo);
  const totals = departmentProgress(compId).filter((p) => depts.some((d) => d.slug === p.slug));

  return (
    <>
      <PageHeader
        title="Central de status"
        note="Onde cada cliente está travado, por departamento e competência. A cadeia é sequencial: sem documento, o fiscal não lança, o pessoal não processa e a contabilidade não escritura."
        actions={
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
                <option key={c.id} value={c.id}>
                  {c.label}
                  {c.encerrada ? " (encerrada)" : ""}
                </option>
              ))}
            </select>
          </label>
        }
      />

      {comp.encerrada && (
        <div className="mb-5">
          <Badge tone="neutral">Competência encerrada — somente leitura</Badge>
        </div>
      )}

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {totals.map((t) => (
          <Card key={t.slug} className="p-4">
            <p className="font-mono text-[11px] uppercase tracking-wider text-ink-3">{t.nome}</p>
            <p className="mt-1 font-display text-2xl font-extrabold tabular-nums text-ink">
              {t.pct}%
            </p>
            <div className="mt-2">
              <Progress pct={t.pct} />
            </div>
            <p className="mt-2 text-xs text-ink-3">
              {t.concluidas}/{t.total} concluídas
            </p>
          </Card>
        ))}
      </div>

      <div className="scroll-x rounded-xl border border-line">
        <table className="w-full min-w-[760px] border-collapse text-sm">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 border-b border-line bg-surface-2 px-4 py-2.5 text-left font-display text-[11px] font-bold uppercase tracking-wider text-ink-2">
                Cliente
              </th>
              {depts.map((d) => (
                <th
                  key={d.slug}
                  className="border-b border-line bg-surface-2 px-4 py-2.5 text-left font-display text-[11px] font-bold uppercase tracking-wider text-ink-2"
                >
                  {d.nome}
                </th>
              ))}
              <th className="border-b border-line bg-surface-2 px-4 py-2.5 text-left font-display text-[11px] font-bold uppercase tracking-wider text-ink-2">
                Geral
              </th>
            </tr>
          </thead>
          <tbody>
            {ativos.map((c) => {
              const all = tasksFor({ competenciaId: compId, clientId: c.id });
              const done = all.filter((t) => t.status === "concluida").length;
              const pctGeral = all.length ? Math.round((done / all.length) * 100) : 0;
              return (
                <tr key={c.id}>
                  <td className="sticky left-0 z-10 border-b border-line bg-surface px-4 py-3">
                    <Link
                      href={`/clientes/${c.id}`}
                      className="font-semibold text-ink hover:text-navy-ink"
                    >
                      {c.nomeFantasia}
                    </Link>
                    <p className="mt-0.5 text-[11px] text-ink-3">{REGIME_LABEL[c.regime]}</p>
                  </td>
                  {depts.map((d) => {
                    const ts = tasksFor({
                      competenciaId: compId,
                      clientId: c.id,
                      departamento: d.slug,
                    });
                    if (ts.length === 0) {
                      return (
                        <td key={d.slug} className="border-b border-line px-4 py-3">
                          <span className="text-xs text-ink-3">—</span>
                        </td>
                      );
                    }
                    const concl = ts.filter((t) => t.status === "concluida").length;
                    const atras = ts.filter((t) => t.status === "atrasada").length;
                    const aguard = ts.filter((t) => t.status === "aguardando-cliente").length;
                    const pct = Math.round((concl / ts.length) * 100);
                    return (
                      <td key={d.slug} className="border-b border-line px-4 py-3">
                        <span
                          className={`inline-block rounded-md border px-2 py-0.5 text-[11px] font-semibold tabular-nums ${cellTone(
                            pct,
                            atras,
                            aguard,
                          )}`}
                        >
                          {pct}%
                        </span>
                        {(atras > 0 || aguard > 0) && (
                          <p className="mt-1 font-mono text-[10px] text-ink-3">
                            {atras > 0 && `${atras} atrasada`}
                            {atras > 0 && aguard > 0 && " · "}
                            {aguard > 0 && `${aguard} aguard.`}
                          </p>
                        )}
                      </td>
                    );
                  })}
                  <td className="border-b border-line px-4 py-3">
                    <div className="w-24">
                      <Progress pct={pctGeral} />
                      <p className="mt-1 font-mono text-[10.5px] tabular-nums text-ink-3">
                        {pctGeral}%
                      </p>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-4 max-w-3xl text-xs leading-relaxed text-ink-3">
        Vermelho é prazo vencido e significa exatamente isso — nada mais no produto usa
        vermelho, para que ele não perca o sentido. Âmbar é documento não enviado pelo
        cliente. Verde só aparece quando a carga do departamento fechou.
      </p>
    </>
  );
}
