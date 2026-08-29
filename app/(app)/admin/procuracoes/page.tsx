"use client";

/* Admin 03 — Procuração tracker.
 *
 * This is what operationalises the per-client onboarding step the SERPRO
 * section identified: a contract is scoped to one e-CNPJ, so acting for a
 * client needs that client's electronic power of attorney first. Collecting and
 * tracking it is as much a feature as the API call.
 */

import Link from "next/link";
import { Badge, Callout, PageHeader, Stat, Table, Td, shortDate } from "@/components/ui";
import { CLIENTS, PROCURACOES, getClient } from "@/lib/data";
import { formatCnpj } from "@/lib/cnpj";

const TONE = { ativa: "green", pendente: "gold", expirada: "red", "nao-solicitada": "neutral" } as const;

export default function ProcuracoesPage() {
  const ativas = PROCURACOES.filter((p) => p.status === "ativa");
  const semCobertura = CLIENTS.filter(
    (c) => c.ativo && !ativas.some((p) => p.clientId === c.id),
  );

  return (
    <>
      <PageHeader
        title="Procurações eletrônicas"
        note="Quem concedeu poderes ao e-CNPJ do escritório, quem não concedeu, e o que vence quando."
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Stat label="Ativas" value={String(ativas.length)} sub={`de ${CLIENTS.filter((c) => c.ativo).length} clientes ativos`} tone="green" />
        <Stat label="Sem cobertura" value={String(semCobertura.length)} sub="Integra Contador indisponível" tone={semCobertura.length ? "gold" : "green"} />
        <Stat label="Expiradas" value={String(PROCURACOES.filter((p) => p.status === "expirada").length)} tone="red" />
      </div>

      {semCobertura.length > 0 && (
        <div className="mb-6">
          <Callout label="Consequência prática" tone="gold">
            <p>
              Para {semCobertura.map((c) => c.nomeFantasia).join(", ")}, qualquer chamada ao
              Integra Contador falha — consulta de declaração, parcelamento, restituição de
              IR. Não é falha de credencial do escritório; é ausência de procuração daquele
              cliente. Automatizar a captura desses dados só faz sentido depois de fechar
              esta lista.
            </p>
          </Callout>
        </div>
      )}

      <Table head={["Cliente", "CNPJ", "Status", "Concedida", "Expira", "Serviços", ""]}>
        {PROCURACOES.map((p) => {
          const c = getClient(p.clientId);
          return (
            <tr key={p.id}>
              <Td>
                <Link href={`/clientes/${p.clientId}`} className="font-semibold text-ink hover:text-navy-ink">
                  {c?.nomeFantasia}
                </Link>
              </Td>
              <Td className="font-mono text-[11.5px]">{c ? formatCnpj(c.cnpj) : "—"}</Td>
              <Td><Badge tone={TONE[p.status]}>{p.status.replace("-", " ")}</Badge></Td>
              <Td className="tabular-nums">{shortDate(p.concedidaEm)}</Td>
              <Td className="tabular-nums">{shortDate(p.expiraEm)}</Td>
              <Td className="text-xs">{p.servicos.length ? p.servicos.join(", ") : "—"}</Td>
              <Td>
                {p.status !== "ativa" && (
                  <button className="whitespace-nowrap rounded-lg border border-line bg-surface-2 px-2.5 py-1 text-[12px] font-semibold text-navy-ink hover:border-navy">
                    Solicitar
                  </button>
                )}
              </Td>
            </tr>
          );
        })}
      </Table>
    </>
  );
}
