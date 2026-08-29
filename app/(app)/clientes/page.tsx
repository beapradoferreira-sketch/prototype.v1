"use client";

/* Tela 04 — Base de clientes.
 *
 * Cadastro por grupo, segmento e regime tributário, com os dois formatos de
 * CNPJ convivendo na mesma lista. A exportação em massa é limitada por papel: o
 * agente de exfiltração da especificação existe justamente porque um executor
 * puxando a base inteira é o evento que vale pegar.
 */

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSession } from "@/components/session";
import { Badge, Card, PageHeader, Table, Td, currency } from "@/components/ui";
import { canExportBulk } from "@/lib/access";
import { CLIENTS, COMPETENCIA_ATUAL, procuracaoFor, tasksFor } from "@/lib/data";
import { cnpjFormatLabel, formatCnpj, isValidCnpj } from "@/lib/cnpj";
import { REGIME_LABEL } from "@/lib/labels";

export default function ClientesPage() {
  const { viewer } = useSession();
  const [q, setQ] = useState("");
  const [regime, setRegime] = useState<string>("todos");
  const [somenteAtivos, setSomenteAtivos] = useState(true);

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return CLIENTS.filter((c) => {
      if (somenteAtivos && !c.ativo) return false;
      if (regime !== "todos" && c.regime !== regime) return false;
      if (!term) return true;
      return (
        c.razaoSocial.toLowerCase().includes(term) ||
        c.nomeFantasia.toLowerCase().includes(term) ||
        c.cnpj.toLowerCase().includes(term.replace(/[^0-9a-z]/gi, "")) ||
        (c.grupo ?? "").toLowerCase().includes(term)
      );
    });
  }, [q, regime, somenteAtivos]);

  return (
    <>
      <PageHeader
        title="Clientes"
        note="Cadastro por grupo, segmento e regime tributário. Aceita CNPJ numérico e alfanumérico — os dois formatos convivem na mesma base, permanentemente."
        actions={
          canExportBulk(viewer) ? (
            <button
              type="button"
              className="rounded-lg border border-line bg-surface-2 px-3 py-1.5 text-[13px] font-semibold text-navy-ink hover:border-navy"
            >
              Exportar CSV
            </button>
          ) : (
            <span className="rounded-lg border border-line px-3 py-1.5 text-[13px] text-ink-3">
              Exportação restrita ao seu papel
            </span>
          )
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nome, CNPJ ou grupo…"
          className="min-w-[220px] flex-1 rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-3"
        />
        <select
          value={regime}
          onChange={(e) => setRegime(e.target.value)}
          className="rounded-lg border border-line bg-surface px-2 py-2 text-[13px] text-ink"
        >
          <option value="todos">Todos os regimes</option>
          {Object.entries(REGIME_LABEL).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-[13px] text-ink-2">
          <input
            type="checkbox"
            checked={somenteAtivos}
            onChange={(e) => setSomenteAtivos(e.target.checked)}
            className="accent-[var(--navy)]"
          />
          Somente ativos
        </label>
      </div>

      <Table
        head={["Cliente", "CNPJ", "Regime", "Honorário", "Procuração", "Competência", ""]}
      >
        {rows.map((c) => {
          const proc = procuracaoFor(c.id);
          const ts = tasksFor({ competenciaId: COMPETENCIA_ATUAL, clientId: c.id });
          const pct = ts.length
            ? Math.round((ts.filter((t) => t.status === "concluida").length / ts.length) * 100)
            : 0;
          return (
            <tr key={c.id} className="hover:bg-surface-2">
              <Td>
                <Link href={`/clientes/${c.id}`} className="font-semibold text-ink hover:text-navy-ink">
                  {c.nomeFantasia}
                </Link>
                <p className="mt-0.5 text-[11px] text-ink-3">
                  {c.razaoSocial}
                  {c.grupo && ` · ${c.grupo}`}
                </p>
              </Td>
              <Td>
                <span className="font-mono text-[12px]">{formatCnpj(c.cnpj)}</span>
                <p className="mt-0.5">
                  <span
                    className={`font-mono text-[10px] ${
                      cnpjFormatLabel(c.cnpj) === "alfanumérico" ? "text-green" : "text-ink-3"
                    }`}
                  >
                    {cnpjFormatLabel(c.cnpj)}
                    {isValidCnpj(c.cnpj) ? "" : " · inválido"}
                  </span>
                </p>
              </Td>
              <Td>{REGIME_LABEL[c.regime]}</Td>
              <Td className="tabular-nums">{currency(c.honorarioMensal)}</Td>
              <Td>
                {proc?.status === "ativa" && <Badge tone="green">ativa</Badge>}
                {proc?.status === "pendente" && <Badge tone="gold">pendente</Badge>}
                {proc?.status === "expirada" && <Badge tone="red">expirada</Badge>}
                {(!proc || proc.status === "nao-solicitada") && (
                  <Badge tone="neutral">não solicitada</Badge>
                )}
              </Td>
              <Td className="tabular-nums">{ts.length ? `${pct}%` : "—"}</Td>
              <Td>{!c.ativo && <Badge tone="neutral">encerrado</Badge>}</Td>
            </tr>
          );
        })}
      </Table>

      {rows.length === 0 && (
        <Card className="mt-4 p-8 text-center text-sm text-ink-3">
          Nenhum cliente corresponde ao filtro.
        </Card>
      )}

      <p className="mt-4 text-xs text-ink-3">
        {rows.length} de {CLIENTS.length} clientes.
      </p>
    </>
  );
}
