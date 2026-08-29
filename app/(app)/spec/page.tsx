"use client";

/* Specification — the brief this prototype was built from, and what was decided
 * about the questions it left open. Kept inside the app so the reasoning
 * travels with the code rather than living in a document nobody reopens. */

import { Badge, Callout, Card, PageHeader, SectionTitle, Table, Td } from "@/components/ui";

const DECISOES = [
  { q: "Qual formato de produto — A, B ou C?", d: "A — plataforma interna de operações.", porque: "É o único formato sem problema de partida a frio: o escritório é o próprio primeiro usuário. O modelo de dados já é escopado por firmId, então virar SaaS multi-inquilino (B) depois é mudança de query, não reescrita." },
  { q: "Stack técnica — o brief diz que é decisão de quem constrói", d: "Next.js 15 (App Router), TypeScript, Tailwind v4.", porque: "Vercel é restrição dada, e é o que a Vercel publica sem configuração. Ferramenta interna densa em dados, majoritariamente leitura — server components servem bem. TypeScript porque o modelo de entidades é a parte difícil deste produto." },
  { q: "Modelo de dados — \"nenhum schema existe ainda\"", d: "Doze entidades, com Competência de primeira classe, retenção por documento e um único responsável por tarefa.", porque: "Os três formatos carregam regra de negócio: o mês é a unidade de trabalho, os relógios de guarda são diferentes dentro do mesmo arquivo, e responsabilidade difusa é o modo de falha que a pesquisa aponta como central." },
  { q: "Autenticação", d: "Nenhuma, deliberadamente, e sinalizada.", porque: "Auth real não tem questão de desenho em aberto. As consequências do papel — o que é visível, mascarado e logado — têm, e essas estão implementadas por completo." },
  { q: "Quanto do roadmap construir", d: "Fase 1 inteira; Fases 2 e 3 existem, desligadas atrás dos toggles.", porque: "Resolve o roadmap honestamente em vez de deixar link morto, e transforma o rollout faseado em funcionalidade real do produto." },
  { q: "CNPJ alfanumérico", d: "Os dois formatos desde a primeira linha.", porque: "O brief insiste que não seja migração v2. O validador usa o mod-11 oficial com valor de caractere = ASCII − 48, conferido contra o exemplo da Receita." },
];

const NAO_DECIDIDO = [
  { item: "Agregador Open Finance (Pluggy vs Celcoin)", motivo: "Depende de conversa de preço e cobertura." },
  { item: "Contratar o Integra Contador agora", motivo: "Vale checar o catálogo de serviços vigente antes — ele é liberado gradualmente." },
  { item: "Critério de saída da Fase 1", motivo: "É julgamento de negócio dos sócios, não técnico. A central de status já mede o número que eles escolherem." },
  { item: "Backup e recuperação de desastre", motivo: "Decisão de infraestrutura junto com o banco, no início da Fase 1 de verdade. A guarda de 30 anos do FGTS torna isso questão de conformidade, não de conveniência." },
];

export default function SpecPage() {
  return (
    <>
      <PageHeader
        title="Especificação e decisões"
        note="O que o brief deixou em aberto e o que foi decidido para conseguir construir. Todas as decisões abaixo são baratas de reverter."
      />

      <div className="mb-7">
        <Callout label="O que este protótipo é" tone="navy">
          <p>
            Uma plataforma interna de operações para escritório contábil brasileiro: quatro
            departamentos com cadeia de dependência real, base de clientes com os dois
            formatos de CNPJ, central de status por competência, painel da diretoria com
            integrações, procurações, auditoria e fila LGPD.
          </p>
          <p>
            Os dados são inventados. Nenhum CNPJ, CPF ou conta bancária real aparece aqui —
            os CNPJs têm dígito verificador válido apenas para exercitar o validador.
          </p>
        </Callout>
      </div>

      <SectionTitle note="Questões em aberto do brief, resolvidas por julgamento">
        Decisões tomadas
      </SectionTitle>
      <div className="mb-7 space-y-3">
        {DECISOES.map((d, i) => (
          <Card key={d.q} className="p-5">
            <p className="font-mono text-[11px] text-ink-3">
              {String(i + 1).padStart(2, "0")}
            </p>
            <p className="mt-1 font-display text-[15px] font-bold text-ink">{d.q}</p>
            <p className="mt-2 text-[14px] font-semibold text-green">{d.d}</p>
            <p className="mt-1.5 text-[13.5px] text-ink-2">{d.porque}</p>
          </Card>
        ))}
      </div>

      <SectionTitle note="Precisa de informação que o protótipo não tem como inventar">
        Deliberadamente não decidido
      </SectionTitle>
      <div className="mb-7">
        <Table head={["Item", "Por que fica em aberto"]}>
          {NAO_DECIDIDO.map((n) => (
            <tr key={n.item}>
              <Td className="text-ink">{n.item}</Td>
              <Td>{n.motivo}</Td>
            </tr>
          ))}
        </Table>
      </div>

      <SectionTitle note="Onde cada tela do rascunho original foi parar">
        Cobertura do rascunho
      </SectionTitle>
      <Table head={["Tela do rascunho", "Onde está", "Situação"]}>
        <tr><Td>01 Home e login</Td><Td>/ (seleção de papel)</Td><Td><Badge tone="green">construída</Badge></Td></tr>
        <tr><Td>02 Painel do escritório</Td><Td>/dashboard</Td><Td><Badge tone="green">construída</Badge></Td></tr>
        <tr><Td>03 Visões hierárquicas</Td><Td>/dashboard, por papel</Td><Td><Badge tone="green">construída</Badge></Td></tr>
        <tr><Td>04 Base de clientes</Td><Td>/clientes</Td><Td><Badge tone="green">construída</Badge></Td></tr>
        <tr><Td>05 Central de status</Td><Td>/status</Td><Td><Badge tone="green">construída</Badge></Td></tr>
        <tr><Td>06 Módulo contábil</Td><Td>/lancamentos</Td><Td><Badge tone="gold">Fase 2, desligado</Badge></Td></tr>
        <tr><Td>07 Camada de API governamental</Td><Td>/admin/integracoes, /admin/procuracoes</Td><Td><Badge tone="green">modelada</Badge></Td></tr>
        <tr><Td>08 Agentes automatizados</Td><Td>/agentes</Td><Td><Badge tone="gold">Fase 3, desligado</Badge></Td></tr>
        <tr><Td>Painel administrativo (adicionado)</Td><Td>/admin</Td><Td><Badge tone="green">construída</Badge></Td></tr>
      </Table>
    </>
  );
}
