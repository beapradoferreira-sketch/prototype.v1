"use client";

/* Admin 06 — LGPD: Art. 18 queue plus the retention table, editable rather
 * than hardcoded. Deletion frequently cannot be honoured because legal
 * retention wins, and the queue has to show that rather than silently failing.
 */

import { Badge, Callout, Card, PageHeader, SectionTitle, Table, Td, shortDate } from "@/components/ui";
import { DSARS, FIRM, getClient, getUser } from "@/lib/data";

const RETENCAO = [
  { categoria: "Documentos fiscais", onde: "Notas, livros contábeis, declarações", prazo: "5 anos", base: "CTN Art. 173–174" },
  { categoria: "Folha de pagamento", onde: "Módulo Pessoal", prazo: "10 anos", base: "Decreto 3.048/1999" },
  { categoria: "Guias de FGTS", onde: "Módulo Pessoal", prazo: "30 anos", base: "Obrigação legal" },
  { categoria: "Contratos de trabalho", onde: "Cadastro de cliente", prazo: "Indeterminado", base: "Obrigação legal" },
  { categoria: "Documentos de rescisão", onde: "Módulo Pessoal", prazo: "2 anos", base: "Obrigação legal" },
  { categoria: "Saúde e filiação sindical", onde: "Atestados, dependentes IRPF", prazo: "Período do registro-pai", base: "Obrigação legal — nunca consentimento de conveniência" },
  { categoria: "Open Finance", onde: "Módulo bancário", prazo: "Vigência do consentimento", base: "Consentimento — revogável em uma ação" },
];

const TIPO_LABEL: Record<string, string> = {
  acesso: "Acesso", correcao: "Correção", anonimizacao: "Anonimização",
  portabilidade: "Portabilidade", eliminacao: "Eliminação", compartilhamento: "Compartilhamento",
};

export default function LgpdPage() {
  const encarregado = getUser(FIRM.encarregadoId);

  return (
    <>
      <PageHeader
        title="LGPD"
        note="Fila de direitos do titular e a tabela de retenção — como fluxo de trabalho, não como texto de política."
      />

      <div className="mb-6">
        <Callout label="Base legal, não caixinha de consentimento" tone="navy">
          <p>
            O serviço <em>é</em> conformidade fiscal e trabalhista, então quase todo
            tratamento se apoia em cumprimento de obrigação legal (Art. 7º, II) ou execução
            de contrato (Art. 7º, V). Consentimento fica reservado para o que vai além da
            necessidade legal — conexão Open Finance, e qualquer uso de dado de cliente para
            treinar modelo ou marketing. Um &quot;aceito os termos&quot; genérico na frente de tudo
            enfraquece o consentimento onde ele realmente importa.
          </p>
          <p>
            Encarregado (DPO), Art. 41: <strong className="text-ink">{encarregado?.nome}</strong>.
          </p>
        </Callout>
      </div>

      <SectionTitle note="Art. 18 — com prazo de resposta, não com PDF de política">
        Pedidos de titular
      </SectionTitle>
      <div className="mb-7">
        <Table head={["Titular", "Tipo", "Recebido", "Prazo", "Status", ""]}>
          {DSARS.map((d) => (
            <tr key={d.id}>
              <Td>
                <span className="text-ink">{d.titular}</span>
                {d.clientId && (
                  <p className="mt-0.5 text-[11px] text-ink-3">
                    {getClient(d.clientId)?.nomeFantasia}
                  </p>
                )}
              </Td>
              <Td>{TIPO_LABEL[d.tipo]}</Td>
              <Td className="tabular-nums">{shortDate(d.recebidoEm)}</Td>
              <Td className="tabular-nums">{shortDate(d.prazoResposta)}</Td>
              <Td>
                <Badge tone={d.status === "respondida" ? "green" : d.status === "em-analise" ? "gold" : "neutral"}>
                  {d.status.replace("-", " ")}
                </Badge>
              </Td>
              <Td>
                {d.bloqueadaPorRetencao && <Badge tone="red">retenção legal impede</Badge>}
              </Td>
            </tr>
          ))}
        </Table>
      </div>

      <Card className="mb-7 p-4">
        <p className="text-sm text-ink-2">
          O pedido de eliminação da Padaria Vila Nova não pode ser atendido integralmente: a
          folha do titular está sob guarda de 10 anos e a guia de FGTS sob 30. A resposta
          correta é eliminar o que não tem amparo legal, explicar o que fica e por quê — não
          recusar em bloco nem apagar tudo.
        </p>
      </Card>

      <SectionTitle note="Por documento, nunca por cliente — editável, não cravado no código">
        Tabela de retenção
      </SectionTitle>
      <Table head={["Categoria", "Onde aparece", "Guarda", "Base legal"]}>
        {RETENCAO.map((r) => (
          <tr key={r.categoria}>
            <Td className="text-ink">{r.categoria}</Td>
            <Td>{r.onde}</Td>
            <Td className="whitespace-nowrap">{r.prazo}</Td>
            <Td className="text-xs">{r.base}</Td>
          </tr>
        ))}
      </Table>

      <Card className="mt-4 p-4">
        <p className="text-sm text-ink-2">
          Um único arquivo de cliente mistura os três relógios. Uma rotina de expurgo
          &quot;apagar depois de N anos&quot; por cliente vai, necessariamente, ou apagar algo
          ilegalmente ou reter algo ilegalmente — por isso a etiqueta de retenção fica no
          documento desde a primeira migração de schema.
        </p>
      </Card>
    </>
  );
}
