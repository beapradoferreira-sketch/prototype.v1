"use client";

/* Admin 05 — Audit log.
 *
 * Reads of sensitive fields are logged, not just writes. This is both the LGPD
 * evidence trail and what the sensitive-field auditor agent reads from.
 */

import { useState } from "react";
import { Badge, Card, PageHeader, Table, Td, dateTime } from "@/components/ui";
import { AUDIT, getUser } from "@/lib/data";

export default function AuditoriaPage() {
  const [somenteSensiveis, setSomenteSensiveis] = useState(false);
  const [q, setQ] = useState("");

  const rows = AUDIT.filter((a) => {
    if (somenteSensiveis && !a.sensivel) return false;
    if (!q.trim()) return true;
    const term = q.toLowerCase();
    const user = getUser(a.userId);
    return (
      (user?.nome ?? "").toLowerCase().includes(term) ||
      a.entidade.toLowerCase().includes(term) ||
      a.tela.toLowerCase().includes(term) ||
      a.acao.toLowerCase().includes(term)
    );
  });

  return (
    <>
      <PageHeader
        title="Log de auditoria"
        note="Toda leitura e exportação de campo sensível, mais as ações administrativas. É a trilha que o encarregado puxa numa solicitação LGPD ou numa análise de incidente."
      />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por pessoa, ação, entidade ou tela…"
          className="min-w-[220px] flex-1 rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-3"
        />
        <label className="flex items-center gap-2 text-[13px] text-ink-2">
          <input
            type="checkbox"
            checked={somenteSensiveis}
            onChange={(e) => setSomenteSensiveis(e.target.checked)}
            className="accent-[var(--navy)]"
          />
          Somente campos sensíveis
        </label>
      </div>

      <Table head={["Quando", "Quem", "Ação", "Entidade", "Tela", ""]}>
        {rows.map((a) => (
          <tr key={a.id}>
            <Td className="whitespace-nowrap font-mono text-[11.5px] tabular-nums">
              {dateTime(a.em)}
            </Td>
            <Td className="text-ink">{getUser(a.userId)?.nome}</Td>
            <Td className="capitalize">{a.acao.replace("-", " ")}</Td>
            <Td className="font-mono text-[11.5px]">
              {a.entidade} {a.entidadeId}
            </Td>
            <Td className="text-xs">{a.tela}</Td>
            <Td>{a.sensivel && <Badge tone="navy">sensível</Badge>}</Td>
          </tr>
        ))}
      </Table>

      <Card className="mt-4 p-4">
        <p className="text-sm text-ink-2">
          O log é append-only por desenho. Nenhum papel — diretoria incluída — edita ou
          apaga entrada: um registro que pode ser alterado por quem está sendo auditado não
          serve como evidência.
        </p>
      </Card>
    </>
  );
}
