"use client";

/* Fase 3 — Portal do cliente, lado do escritório.
 *
 * Esta tela já se chamou "Portal do cliente" e mostrava só uma fila interna de
 * solicitações — o nome prometia a visão do cliente e entregava outra coisa.
 * Agora ela é o que de fato é: a régua do escritório sobre o portal. A visão do
 * cliente vive em /area-do-cliente/[clientId], com chrome próprio, e cada linha
 * aqui leva até ela.
 */

import Link from "next/link";
import { useSession } from "@/components/session";
import {
  Badge, Callout, Card, ModuleDisabled, PageHeader, SectionTitle, Stat,
  Table, Td, shortDate,
} from "@/components/ui";
import { CLIENTS, COMPETENCIA_ATUAL, DOCUMENTS, MODULES, getClient } from "@/lib/data";
import { CANAL_LABEL } from "@/lib/labels";
import { buildPortalView } from "@/lib/portal";

export default function PortalPage() {
  const { modules } = useSession();
  const mod = MODULES.find((m) => m.slug === "portal-cliente")!;

  if (!modules["portal-cliente"]) {
    return (
      <>
        <PageHeader title="Portal do cliente" note="Fase 3" />
        <ModuleDisabled nome={mod.nome} fase={mod.fase} descricao={mod.descricao} />
      </>
    );
  }

  const solicitados = DOCUMENTS.filter((d) => d.solicitadoEm);
  const pendentes = solicitados.filter((d) => !d.recebidoEm);
  const ativos = CLIENTS.filter((c) => c.ativo);
  const porWhatsapp = solicitados.filter((d) => d.canalSolicitacao === "whatsapp");
  const respondidosWhats = porWhatsapp.filter((d) => d.recebidoEm).length;

  return (
    <>
      <PageHeader
        title="Portal do cliente"
        note="A régua do escritório sobre o portal: o que foi pedido, por qual canal, e o que cada cliente está vendo do próprio lado."
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Stat label="Solicitações abertas" value={String(pendentes.length)} sub={`de ${solicitados.length} enviadas`} tone={pendentes.length ? "gold" : "green"} />
        <Stat label="Respondidas via WhatsApp" value={`${respondidosWhats}/${porWhatsapp.length}`} sub="Canal com melhor retorno" tone="green" />
        <Stat label="Clientes com área ativa" value={String(ativos.length)} sub="Todos os clientes ativos" />
      </div>

      <div className="mb-7">
        <Callout label="WhatsApp não é um extra" tone="gold">
          <p>
            O atraso de documento é o gargalo nº 1, e ele não fecha se o pedido chega onde
            o cliente não olha. O modelo de dados já registra o canal de cada solicitação;
            falta contratar um provedor — decisão de fornecedor, não de protótipo.
          </p>
        </Callout>
      </div>

      <SectionTitle note="Abre a área do cliente exatamente como ele a enxerga">
        O que cada cliente está vendo
      </SectionTitle>
      <div className="mb-7 grid gap-3 md:grid-cols-2">
        {ativos.map((c) => {
          const v = buildPortalView(c.id, COMPETENCIA_ATUAL);
          if (!v) return null;
          return (
            <Card key={c.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-display text-sm font-bold text-ink">{c.nomeFantasia}</p>
                  <p className="mt-0.5 text-xs text-ink-3">
                    {v.pctGeral}% da competência · {v.recebidos.length} documento(s) recebido(s)
                  </p>
                </div>
                {v.pendencias.length > 0 ? (
                  <Badge tone="gold">{v.pendencias.length} pendente(s)</Badge>
                ) : (
                  <Badge tone="green">em dia</Badge>
                )}
              </div>
              <Link
                href={`/area-do-cliente/${c.id}`}
                className="mt-3 inline-block rounded-lg border border-line bg-surface-2 px-2.5 py-1.5 text-[12.5px] font-semibold text-navy-ink hover:border-navy"
              >
                Ver como o cliente
              </Link>
            </Card>
          );
        })}
      </div>

      <SectionTitle note="Por canal de envio">Solicitações de documento</SectionTitle>
      <Table head={["Documento", "Cliente", "Canal", "Solicitado", "Recebido", "Situação"]}>
        {solicitados.map((d) => (
          <tr key={d.id}>
            <Td className="text-ink">{d.nome}</Td>
            <Td>
              <Link href={`/clientes/${d.clientId}`} className="hover:text-navy-ink">
                {getClient(d.clientId)?.nomeFantasia}
              </Link>
            </Td>
            <Td>
              <Badge tone={d.canalSolicitacao === "whatsapp" ? "green" : "neutral"}>
                {d.canalSolicitacao ? CANAL_LABEL[d.canalSolicitacao] : "—"}
              </Badge>
            </Td>
            <Td className="tabular-nums">{shortDate(d.solicitadoEm)}</Td>
            <Td className="tabular-nums">{shortDate(d.recebidoEm)}</Td>
            <Td>
              {d.recebidoEm ? <Badge tone="green">recebido</Badge> : <Badge tone="gold">pendente</Badge>}
            </Td>
          </tr>
        ))}
      </Table>

      <Card className="mt-4 p-4">
        <p className="text-sm text-ink-2">
          Documentos pedidos por WhatsApp voltaram; os pedidos por e-mail continuam
          pendentes. Com quatro solicitações isso é anedota, não evidência — mas é
          exatamente a métrica que a Fase 1 precisa instrumentar para justificar o custo
          de um provedor.
        </p>
      </Card>
    </>
  );
}
