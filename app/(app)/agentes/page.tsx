"use client";

/* Screen 08 / Phase 3 — Automated agents.
 *
 * Two families in one environment, kept visually distinct because they differ
 * in risk: process agents chase documents (safe to automate), defence agents
 * watch the system (the vendor-integrity one deliberately has no auto-remediate
 * tier — a wrong auto-retry against a government API causes its own problems).
 */

import { useSession } from "@/components/session";
import {
  Badge, Callout, Card, ModuleDisabled, PageHeader, SectionTitle, dateTime,
} from "@/components/ui";
import { FLAGS, MODULES } from "@/lib/data";
import type { AgentSlug } from "@/lib/types";

const DEFESA: {
  slug: AgentSlug; n: string; nome: string; observa: string; dispara: string; age: string;
}[] = [
  { slug: "acesso-anomalo", n: "01", nome: "Acesso anômalo", observa: "Padrões de login, uso de privilégio, consultas entre departamentos.", dispara: "Horário ou local atípico; executor lendo fora do próprio escopo.", age: "Desafio de autenticação, marcação de sessão, alerta na reincidência." },
  { slug: "exfiltracao", n: "02", nome: "Vigilância de exfiltração", observa: "Ações de exportação e download em massa.", dispara: "Volume acima do limite do papel — por exemplo, a base inteira de clientes.", age: "Limita taxa, exige justificativa, bloqueia acima do teto e alerta." },
  { slug: "credenciais", n: "03", nome: "Higiene de credenciais e procurações", observa: "Validade do e-CNPJ, procurações por cliente, uso de chaves de API.", dispara: "Vencimento próximo, chave órfã, uso fora do fluxo esperado.", age: "Lembrete de renovação, revogação automática de credencial órfã." },
  { slug: "campos-sensiveis", n: "04", nome: "Auditor de campos sensíveis", observa: "Toda leitura ou exportação de dados de saúde, sindicais ou de dependente IRPF.", dispara: "Papel acessando fora da necessidade legítima do departamento.", age: "Marca o log na hora; relatório periódico ao encarregado." },
  { slug: "superficie-externa", n: "05", nome: "Superfície externa", observa: "Endpoints de autenticação e as integrações SERPRO/SEFAZ/Domínio.", dispara: "Força bruta, payload anômalo, CVE em dependência no scan agendado.", age: "Bloqueia IP ou conta, aciona o plantão." },
  { slug: "integridade-vendor", n: "06", nome: "Integridade de fornecedor", observa: "As integrações externas: validade de certificado, mudança de schema, falha silenciosa de auth.", dispara: "Integração ficando muda — o modo de falha que só aparece quando o prazo estoura.", age: "Só alerta. Sem camada de auto-remediação: retry errado contra API de governo cria problema novo." },
];

const PROCESSO = [
  { nome: "Cobrança de documento", descricao: "Regra por competência: se o documento não chegou até D-5 do prazo, dispara pedido no canal que o cliente responde.", estado: "regra" },
  { nome: "Mapa de conciliação", descricao: "Aprende a contrapartida contábil recorrente por cliente e histórico, alimentando os rascunhos do auto-lançamento.", estado: "regra" },
  { nome: "Aviso de prazo", descricao: "Escala para o gestor do departamento quando uma tarefa entra em risco de atraso.", estado: "regra" },
];

export default function AgentesPage() {
  const { modules } = useSession();
  const mod = MODULES.find((m) => m.slug === "agentes")!;

  if (!modules.agentes) {
    return (
      <>
        <PageHeader title="Agentes automatizados" note="Fase 3" />
        <ModuleDisabled nome={mod.nome} fase={mod.fase} descricao={mod.descricao} />
      </>
    );
  }

  const abertas = FLAGS.filter((f) => !f.resolvida);

  return (
    <>
      <PageHeader
        title="Agentes automatizados"
        note="Cada agente é um trabalho permanente com gatilho e escalonamento definidos — não uma camada vaga de IA."
      />

      <div className="mb-6">
        <Callout label="Comece por regra, não por modelo" tone="navy">
          <p>
            Os agentes de processo saem primeiro como regras determinísticas. Cobrança de
            documento e aviso de prazo não precisam de LLM, e colocar um modelo na
            comunicação com cliente antes de a regra funcionar adiciona risco sem adicionar
            capacidade.
          </p>
        </Callout>
      </div>

      <SectionTitle note={`${abertas.length} sinalizações abertas`}>
        Agentes de defesa
      </SectionTitle>
      <div className="mb-8 grid gap-3 md:grid-cols-2">
        {DEFESA.map((a) => {
          const flags = abertas.filter((f) => f.agente === a.slug);
          return (
            <Card key={a.slug} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="font-mono text-[11px] text-ink-3">{a.n}</p>
                {flags.length > 0 && (
                  <Badge tone={flags.some((f) => f.severidade === "alta") ? "red" : "gold"}>
                    {flags.length} aberta(s)
                  </Badge>
                )}
              </div>
              <p className="mt-1.5 font-display text-[14.5px] font-bold text-ink">{a.nome}</p>
              <dl className="mt-2 space-y-1.5 text-[13px] text-ink-2">
                <div><dt className="inline font-semibold text-ink">Observa: </dt><dd className="inline">{a.observa}</dd></div>
                <div><dt className="inline font-semibold text-ink">Dispara: </dt><dd className="inline">{a.dispara}</dd></div>
                <div><dt className="inline font-semibold text-ink">Age: </dt><dd className="inline">{a.age}</dd></div>
              </dl>
            </Card>
          );
        })}
      </div>

      <SectionTitle note="Determinísticos por enquanto — sem modelo na comunicação com cliente">
        Agentes de processo
      </SectionTitle>
      <div className="mb-8 grid gap-3 md:grid-cols-3">
        {PROCESSO.map((p) => (
          <Card key={p.nome} className="p-4">
            <Badge tone="neutral">{p.estado}</Badge>
            <p className="mt-2 font-display text-[14.5px] font-bold text-ink">{p.nome}</p>
            <p className="mt-1.5 text-[13px] text-ink-2">{p.descricao}</p>
          </Card>
        ))}
      </div>

      <SectionTitle>Sinalizações recentes</SectionTitle>
      <Card className="divide-y divide-line">
        {abertas.map((f) => (
          <div key={f.id} className="p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={f.severidade === "alta" ? "red" : f.severidade === "media" ? "gold" : "neutral"}>
                {f.severidade}
              </Badge>
              {f.escalarParaEncarregado && <Badge tone="navy">escalar ao encarregado</Badge>}
              <span className="ml-auto font-mono text-[11px] text-ink-3">{dateTime(f.em)}</span>
            </div>
            <p className="mt-1.5 font-display text-sm font-bold text-ink">{f.titulo}</p>
            <p className="mt-1 text-[13px] text-ink-2">{f.detalhe}</p>
          </div>
        ))}
      </Card>
    </>
  );
}
