"use client";

/* Phase 3 — Client portal (internal preview).
 *
 * This is what the firm sees of the client-facing surface. The portal proper is
 * a separate deployment target; what matters at this stage is that document
 * requests go out on the channel clients actually answer, and that Art. 18
 * requests have somewhere to land.
 */

import { useSession } from "@/components/session";
import {
  Badge, Callout, Card, ModuleDisabled, PageHeader, SectionTitle, Table, Td, shortDate,
} from "@/components/ui";
import { DOCUMENTS, MODULES, getClient } from "@/lib/data";

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

  return (
    <>
      <PageHeader
        title="Portal do cliente"
        note="Onde o cliente envia documento e acompanha a própria competência. Prévia interna do que ele enxerga."
      />

      <div className="mb-6">
        <Callout label="WhatsApp não é um extra" tone="gold">
          <p>
            O atraso de documento é o gargalo nº 1, e ele não fecha se o pedido chega onde
            o cliente não olha. O modelo de dados já registra o canal de cada solicitação;
            falta contratar um provedor — decisão de fornecedor, não de protótipo.
          </p>
        </Callout>
      </div>

      <SectionTitle note="Por canal de envio">Solicitações de documento</SectionTitle>
      <Table head={["Documento", "Cliente", "Canal", "Solicitado", "Recebido", "Situação"]}>
        {solicitados.map((d) => (
          <tr key={d.id}>
            <Td className="text-ink">{d.nome}</Td>
            <Td>{getClient(d.clientId)?.nomeFantasia}</Td>
            <Td>
              <Badge tone={d.canalSolicitacao === "whatsapp" ? "green" : "neutral"}>
                {d.canalSolicitacao}
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
