"use client";

/* Tela 06 / Fase 2 — Auto-lançamento.
 *
 * Chega desligada. A especificação coloca isto no teto de maior retorno, mas é
 * engenharia de verdade (parsear extratos, NF-e, vários layouts de relatório),
 * então fica atrás do toggle em Admin › Módulos em vez de meio construída.
 *
 * A regra que a tela codifica: lançamento entra como rascunho, nunca postado.
 * Automatizar sobre responsabilidade de revisão indefinida só automatiza a
 * responsabilidade difusa.
 */

import { useSession } from "@/components/session";
import { ModuleGate } from "@/components/module-gate";
import {
  Badge, Callout, Card, PageHeader, SectionTitle, Table, Td, currency,
} from "@/components/ui";

const RASCUNHOS = [
  { id: "l1", data: "2026-08-12", historico: "Recebimento cliente — PIX", debito: "1.1.1.02 Banco c/ Movimento", credito: "1.1.2.01 Clientes", valor: 4820.5, origem: "Extrato BB", confianca: 0.97 },
  { id: "l2", data: "2026-08-12", historico: "Tarifa bancária", debito: "3.1.2.04 Despesas bancárias", credito: "1.1.1.02 Banco c/ Movimento", valor: 89.9, origem: "Extrato BB", confianca: 0.99 },
  { id: "l3", data: "2026-08-14", historico: "Compra de matéria-prima — NF 44120", debito: "1.1.3.01 Estoques", credito: "2.1.1.01 Fornecedores", valor: 18740.0, origem: "NF-e", confianca: 0.94 },
  { id: "l4", data: "2026-08-18", historico: "Pagamento não identificado", debito: "—", credito: "1.1.1.02 Banco c/ Movimento", valor: 1250.0, origem: "Extrato BB", confianca: 0.41 },
];

export default function LancamentosPage() {
  const { modules } = useSession();

  if (!modules["auto-lancamento"]) {
    return (
      <>
        <PageHeader title="Auto-lançamento" note="Fase 2 — núcleo de automação" />
        <ModuleGate slug="auto-lancamento" />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Auto-lançamento"
        note="Extratos, NF-e e relatórios convertidos em lançamentos de rascunho. Nada é postado sem revisão humana."
      />

      <div className="mb-6">
        <Callout label="Rascunho, nunca lançamento definitivo" tone="gold">
          <p>
            Todo lançamento gerado aqui entra como rascunho e exige aprovação de um
            responsável nomeado. Se a automação errar, a responsabilidade pela revisão
            precisa estar definida antes — automatizar sobre responsabilidade difusa só
            acelera o problema que o produto existe para resolver.
          </p>
        </Callout>
      </div>

      <SectionTitle note="Confiança abaixo de 60% nunca é auto-aprovável">
        Rascunhos aguardando revisão
      </SectionTitle>
      <Table head={["Data", "Histórico", "Débito", "Crédito", "Valor", "Origem", "Confiança"]}>
        {RASCUNHOS.map((l) => (
          <tr key={l.id}>
            <Td className="tabular-nums">{l.data.slice(8)}/{l.data.slice(5, 7)}</Td>
            <Td className="text-ink">{l.historico}</Td>
            <Td className="font-mono text-[11.5px]">{l.debito}</Td>
            <Td className="font-mono text-[11.5px]">{l.credito}</Td>
            <Td className="tabular-nums">{currency(l.valor)}</Td>
            <Td>{l.origem}</Td>
            <Td>
              <Badge tone={l.confianca >= 0.9 ? "green" : l.confianca >= 0.6 ? "gold" : "red"}>
                {Math.round(l.confianca * 100)}%
              </Badge>
            </Td>
          </tr>
        ))}
      </Table>

      <Card className="mt-4 p-4">
        <p className="text-sm text-ink-2">
          O lançamento de 18/08 ficou em 41% porque o extrato não traz contrapartida
          identificável. Ele fica na fila para classificação manual em vez de ser adivinhado —
          é exatamente o caso que a camada de OCR e o mapa de conciliação precisam resolver
          antes desta fase sair do papel.
        </p>
      </Card>
    </>
  );
}
