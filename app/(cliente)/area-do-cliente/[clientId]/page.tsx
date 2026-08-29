"use client";

/* Fase 3 — Área do cliente.
 *
 * O que o titular do CNPJ enxerga: a própria competência, o que ainda falta
 * dele, o que já chegou, e os controles que são dele por direito — consentimento
 * de Open Finance e pedidos do Art. 18. Nada sobre outro cliente, nenhum nome
 * de quem trabalha no escritório, nenhum documento sensível.
 *
 * O recorte é feito em lib/portal.ts. Esta tela só desenha o que chega.
 */

import Link from "next/link";
import { use, useState } from "react";
import { useSession } from "@/components/session";
import {
  Badge, Callout, Card, ModuleDisabled, Progress, SectionTitle, currency, shortDate,
} from "@/components/ui";
import { CLIENTS, COMPETENCIAS, COMPETENCIA_ATUAL, FIRM, MODULES, getUser } from "@/lib/data";
import { buildPortalView } from "@/lib/portal";
import { formatCnpj } from "@/lib/cnpj";
import { REGIME_LABEL } from "@/lib/labels";
import type { DSARKind } from "@/lib/types";

const PEDIDOS: { tipo: DSARKind; label: string; nota: string }[] = [
  { tipo: "acesso", label: "Acesso aos meus dados", nota: "Quais dados o escritório trata a meu respeito." },
  { tipo: "correcao", label: "Correção", nota: "Algum dado está errado ou desatualizado." },
  { tipo: "portabilidade", label: "Portabilidade", nota: "Quero meus dados em formato utilizável." },
  { tipo: "eliminacao", label: "Eliminação", nota: "Parte pode ser negada: guarda fiscal e trabalhista é obrigação legal." },
];

export default function AreaDoClientePage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = use(params);
  const { modules } = useSession();
  const [compId, setCompId] = useState(COMPETENCIA_ATUAL);
  const [pedidoEnviado, setPedidoEnviado] = useState<string | null>(null);

  const mod = MODULES.find((m) => m.slug === "portal-cliente")!;
  const view = buildPortalView(clientId, compId);
  const encarregado = getUser(FIRM.encarregadoId);

  if (!modules["portal-cliente"]) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <ModuleDisabled nome={mod.nome} fase={mod.fase} descricao={mod.descricao} />
      </div>
    );
  }

  if (!view) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Card className="p-10 text-center">
          <p className="font-display font-bold text-ink">Cliente não encontrado</p>
        </Card>
      </div>
    );
  }

  const { client } = view;

  return (
    <>
      {/* Faixa de protótipo: deixa explícito que isto é uma prévia interna e
          permite trocar de cliente para demonstrar. Não existiria em produção. */}
      <div className="border-b border-gold/30 bg-gold-soft">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center gap-3 px-6 py-2.5">
          <span className="font-mono text-[10.5px] uppercase tracking-wider text-gold">
            Prévia interna · área do cliente
          </span>
          <label className="ml-auto flex items-center gap-2">
            <span className="font-mono text-[10.5px] uppercase tracking-wider text-gold">
              Ver como
            </span>
            <select
              value={clientId}
              onChange={(e) => {
                window.location.href = `/area-do-cliente/${e.target.value}`;
              }}
              className="rounded-lg border border-gold/40 bg-surface px-2 py-1 text-[13px] text-ink"
            >
              {CLIENTS.filter((c) => c.ativo).map((c) => (
                <option key={c.id} value={c.id}>{c.nomeFantasia}</option>
              ))}
            </select>
          </label>
          <Link href="/portal" className="text-[13px] text-gold underline underline-offset-2">
            Voltar ao sistema
          </Link>
        </div>
      </div>

      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center gap-3 px-6 py-4">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-navy font-display text-[13px] font-extrabold text-white">
            CA
          </span>
          <div>
            <p className="font-display text-[15px] font-bold text-ink">{client.nomeFantasia}</p>
            <p className="font-mono text-[11px] text-ink-3">{formatCnpj(client.cnpj)}</p>
          </div>
          <label className="ml-auto flex items-center gap-2">
            <span className="font-mono text-[10.5px] uppercase tracking-wider text-ink-3">
              Competência
            </span>
            <select
              value={compId}
              onChange={(e) => setCompId(e.target.value)}
              className="rounded-lg border border-line bg-surface px-2 py-1.5 text-[13px] text-ink"
            >
              {COMPETENCIAS.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </label>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink">
          Sua competência de {view.competencia.label.toLowerCase()}
        </h1>
        <p className="mt-1 text-sm text-ink-3">
          {view.pendencias.length > 0
            ? "Há documentos que dependem de você. Enquanto eles não chegam, o mês não fecha."
            : "Nada pendente do seu lado nesta competência."}
        </p>

        {/* A lista acionável vem primeiro. É a razão de o cliente abrir isto. */}
        {view.pendencias.length > 0 && (
          <div className="mt-6">
            <Callout label={`${view.pendencias.length} documento(s) aguardando você`} tone="gold">
              <p>
                A contabilidade é sequencial: sem o documento em mãos, a apuração não é
                lançada e a escrituração não fecha. Estes são os itens que estão
                segurando o seu mês.
              </p>
            </Callout>
            <Card className="mt-3 divide-y divide-line">
              {view.pendencias.map((d) => (
                <div key={d.id} className="flex flex-wrap items-center gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-sm font-bold text-ink">{d.nome}</p>
                    <p className="mt-0.5 text-xs text-ink-3">
                      {d.solicitadoEm
                        ? `Solicitado em ${shortDate(d.solicitadoEm)}`
                        : "Ainda não solicitado formalmente"}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="rounded-lg border border-navy bg-navy px-3 py-1.5 text-[13px] font-semibold text-white"
                  >
                    Enviar arquivo
                  </button>
                </div>
              ))}
            </Card>
          </div>
        )}

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <SectionTitle note="Sem nomes da equipe — é organização interna do escritório">
              Andamento do mês
            </SectionTitle>
            <Card className="p-5">
              <div className="flex items-baseline justify-between">
                <p className="text-sm text-ink-2">Geral</p>
                <p className="font-display text-2xl font-extrabold tabular-nums text-ink">
                  {view.pctGeral}%
                </p>
              </div>
              <div className="mt-2"><Progress pct={view.pctGeral} /></div>

              <div className="mt-5 space-y-3">
                {view.departamentos.map((d) => (
                  <div key={d.nome}>
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="text-[13px] text-ink-2">{d.nome}</p>
                      <p className="font-mono text-[12px] tabular-nums text-ink-3">{d.pct}%</p>
                    </div>
                    <div className="mt-1"><Progress pct={d.pct} /></div>
                    {d.aguardandoCliente > 0 && (
                      <p className="mt-1 font-mono text-[10.5px] text-gold">
                        {d.aguardandoCliente} frente(s) esperando documento seu
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            <div className="mt-6">
              <SectionTitle note={`${view.recebidos.length} nesta competência`}>
                Documentos recebidos
              </SectionTitle>
              {view.recebidos.length === 0 ? (
                <Card className="p-6 text-center text-sm text-ink-3">
                  Nenhum documento recebido nesta competência.
                </Card>
              ) : (
                <Card className="divide-y divide-line">
                  {view.recebidos.map((d) => (
                    <div key={d.id} className="flex items-center justify-between gap-3 p-3.5">
                      <p className="text-[13px] text-ink">{d.nome}</p>
                      <Badge tone="green">recebido {shortDate(d.recebidoEm)}</Badge>
                    </div>
                  ))}
                </Card>
              )}
              {view.sensiveisOcultos > 0 && (
                <p className="mt-2 text-xs text-ink-3">
                  {view.sensiveisOcultos} documento(s) com dado sensível (saúde ou filiação
                  sindical) não aparecem aqui. O portal não é canal para esse tipo de dado —
                  fale com o escritório pelo canal próprio.
                </p>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <SectionTitle>Seu contrato</SectionTitle>
              <Card className="p-4">
                <dl className="space-y-2 text-[13px]">
                  <div className="flex justify-between gap-3">
                    <dt className="text-ink-3">Regime</dt>
                    <dd className="text-right text-ink-2">{REGIME_LABEL[client.regime]}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-ink-3">Honorário</dt>
                    <dd className="text-right tabular-nums text-ink-2">
                      {currency(client.honorarioMensal)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-ink-3">Cliente desde</dt>
                    <dd className="text-right tabular-nums text-ink-2">{shortDate(client.desde)}</dd>
                  </div>
                </dl>
              </Card>
            </div>

            <div>
              <SectionTitle note="Você concede, e você revoga">Procuração eletrônica</SectionTitle>
              <Card className="p-4">
                {view.procuracao?.status === "ativa" ? (
                  <>
                    <Badge tone="green">ativa até {shortDate(view.procuracao.expiraEm)}</Badge>
                    <p className="mt-2 text-[13px] text-ink-2">
                      Permite ao escritório consultar {view.procuracao.servicos.join(", ").toLowerCase()} em
                      seu nome, junto à Receita.
                    </p>
                  </>
                ) : (
                  <>
                    <Badge tone="gold">
                      {view.procuracao?.status === "expirada" ? "expirada" : "não concedida"}
                    </Badge>
                    <p className="mt-2 text-[13px] text-ink-2">
                      Sem ela, o escritório não consegue consultar suas declarações e
                      parcelamentos automaticamente — o que vira trabalho manual e prazo mais
                      apertado.
                    </p>
                  </>
                )}
              </Card>
            </div>

            <div>
              <SectionTitle note="Revogável a qualquer momento, em uma ação">
                Consentimento bancário
              </SectionTitle>
              <Card className="divide-y divide-line">
                {view.contas.length === 0 && (
                  <p className="p-4 text-sm text-ink-3">Nenhuma conta cadastrada.</p>
                )}
                {view.contas.map((c) => (
                  <div key={`${c.banco}-${c.conta}`} className="p-4">
                    <p className="font-display text-sm font-bold text-ink">{c.banco}</p>
                    {c.openFinance.conectado ? (
                      <>
                        <p className="mt-1.5"><Badge tone="green">compartilhando</Badge></p>
                        <p className="mt-1.5 text-xs text-ink-3">
                          Expira {shortDate(c.openFinance.expiraEm)}
                        </p>
                        <button className="mt-2 rounded-lg border border-line px-2.5 py-1 text-[12.5px] text-ink-2 hover:border-red hover:text-red">
                          Revogar consentimento
                        </button>
                      </>
                    ) : (
                      <p className="mt-1.5"><Badge tone="neutral">não conectado</Badge></p>
                    )}
                  </div>
                ))}
              </Card>
            </div>
          </div>
        </div>

        {/* Art. 18 como fluxo de verdade, não como parágrafo de política. */}
        <div className="mt-8">
          <SectionTitle note="LGPD, Art. 18 — com prazo de resposta">
            Seus direitos sobre seus dados
          </SectionTitle>
          {pedidoEnviado ? (
            <Callout label="Pedido registrado" tone="green">
              <p>
                Seu pedido de <strong>{pedidoEnviado.toLowerCase()}</strong> entrou na fila do
                encarregado ({encarregado?.nome}). Você recebe resposta com prazo definido.
              </p>
            </Callout>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {PEDIDOS.map((p) => (
                <Card key={p.tipo} className="p-4">
                  <p className="font-display text-[14px] font-bold text-ink">{p.label}</p>
                  <p className="mt-1 text-[13px] text-ink-2">{p.nota}</p>
                  <button
                    type="button"
                    onClick={() => setPedidoEnviado(p.label)}
                    className="mt-3 rounded-lg border border-line bg-surface-2 px-2.5 py-1.5 text-[12.5px] font-semibold text-navy-ink hover:border-navy"
                  >
                    Solicitar
                  </button>
                </Card>
              ))}
            </div>
          )}
          <p className="mt-3 text-xs text-ink-3">
            Encarregado pelo tratamento de dados: {encarregado?.nome}. Pedidos de eliminação
            podem ser parcialmente negados — guarda fiscal e trabalhista é obrigação legal, e
            a resposta explica o que fica e por quê.
          </p>
        </div>
      </main>
    </>
  );
}
