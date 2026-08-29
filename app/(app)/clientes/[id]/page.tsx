"use client";

/* Detalhe do cliente.
 *
 * Onde três regras da especificação ficam visíveis de uma vez:
 *  - documento sensível é mascarado a menos que o departamento de quem vê seja
 *    o dono, e a linha continua existindo para o arquivo não parecer incompleto;
 *  - retenção é por documento, nunca por cliente — um arquivo aqui mistura os
 *    relógios de 5 anos (fiscal), 10 (folha) e 30 (FGTS);
 *  - o consentimento de Open Finance é itemizado, com prazo e revogável em uma
 *    única ação.
 */

import Link from "next/link";
import { use } from "react";
import { useSession } from "@/components/session";
import {
  Badge, Callout, Card, PageHeader, Progress, SectionTitle, StatusBadge,
  Table, Td, currency, shortDate,
} from "@/components/ui";
import { maskDocuments } from "@/lib/access";
import {
  COMPETENCIA_ATUAL, DEPARTMENTS, documentsFor, getClient, getUser,
  procuracaoFor, tasksFor,
} from "@/lib/data";
import { cnpjFormatLabel, formatCnpj } from "@/lib/cnpj";
import {
  CANAL_LABEL, DEPARTAMENTO_LABEL, REGIME_LABEL, RETENCAO_LABEL,
} from "@/lib/labels";

export default function ClientePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { viewer } = useSession();
  const client = getClient(id);

  if (!client) {
    return (
      <Card className="p-10 text-center">
        <p className="font-display font-bold text-ink">Cliente não encontrado</p>
        <Link href="/clientes" className="mt-2 inline-block text-sm text-navy-ink underline">
          Voltar para a lista
        </Link>
      </Card>
    );
  }

  const proc = procuracaoFor(client.id);
  const docs = maskDocuments(viewer, documentsFor(client.id, COMPETENCIA_ATUAL));
  const tasks = tasksFor({ competenciaId: COMPETENCIA_ATUAL, clientId: client.id });
  const maskedCount = docs.filter((d) => d.masked).length;

  return (
    <>
      <PageHeader
        title={client.nomeFantasia}
        note={`${client.razaoSocial}${client.grupo ? ` · ${client.grupo}` : ""} · cliente desde ${shortDate(client.desde)}`}
        actions={<Link href="/clientes" className="text-sm text-navy-ink underline underline-offset-2">Todos os clientes</Link>}
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <p className="font-mono text-[11px] uppercase tracking-wider text-ink-3">CNPJ</p>
          <p className="mt-1 font-mono text-[15px] font-semibold text-ink">{formatCnpj(client.cnpj)}</p>
          <p className="mt-1">
            <Badge tone={cnpjFormatLabel(client.cnpj) === "alfanumérico" ? "green" : "neutral"}>
              {cnpjFormatLabel(client.cnpj)}
            </Badge>
          </p>
        </Card>
        <Card className="p-4">
          <p className="font-mono text-[11px] uppercase tracking-wider text-ink-3">Regime</p>
          <p className="mt-1 font-display text-[15px] font-bold text-ink">
            {REGIME_LABEL[client.regime]}
          </p>
          <p className="mt-1 text-xs text-ink-3">{client.segmento}</p>
        </Card>
        <Card className="p-4">
          <p className="font-mono text-[11px] uppercase tracking-wider text-ink-3">Honorário</p>
          <p className="mt-1 font-display text-[15px] font-bold tabular-nums text-ink">
            {currency(client.honorarioMensal)}
          </p>
          <p className="mt-1 text-xs text-ink-3">mensal</p>
        </Card>
        <Card className="p-4">
          <p className="font-mono text-[11px] uppercase tracking-wider text-ink-3">Procuração SERPRO</p>
          <p className="mt-1.5">
            {proc?.status === "ativa" && <Badge tone="green">ativa até {shortDate(proc.expiraEm)}</Badge>}
            {proc?.status === "pendente" && <Badge tone="gold">pendente</Badge>}
            {proc?.status === "expirada" && <Badge tone="red">expirada</Badge>}
            {(!proc || proc.status === "nao-solicitada") && <Badge tone="neutral">não solicitada</Badge>}
          </p>
          <p className="mt-1.5 text-xs text-ink-3">
            {proc?.servicos.length ? proc.servicos.join(", ") : "Sem serviços habilitados"}
          </p>
        </Card>
      </div>

      {proc && proc.status !== "ativa" && (
        <div className="mb-6">
          <Callout label="Integra Contador indisponível para este cliente" tone="gold">
            <p>
              O contrato SERPRO é preso ao e-CNPJ do escritório. Sem procuração eletrônica
              vigente deste cliente, consultas de declarações, parcelamentos e restituição
              de IR para este CNPJ vão falhar — não é um problema de credencial, é um passo
              de onboarding por cliente.
            </p>
          </Callout>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SectionTitle note={`Competência aberta · ${tasks.length} tarefas`}>
            Andamento por departamento
          </SectionTitle>
          <Card className="divide-y divide-line">
            {DEPARTMENTS.map((d) => {
              const ts = tasks.filter((t) => t.departamento === d.slug);
              if (ts.length === 0) return null;
              const concl = ts.filter((t) => t.status === "concluida").length;
              const pct = Math.round((concl / ts.length) * 100);
              const resp = getUser(client.responsaveis[d.slug] ?? "");
              return (
                <div key={d.slug} className="p-4">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="font-display text-sm font-bold text-ink">{d.nome}</p>
                    <p className="font-mono text-xs text-ink-3">
                      {resp ? resp.nome : "sem responsável"}
                    </p>
                  </div>
                  <div className="mt-2"><Progress pct={pct} /></div>
                  <div className="mt-3 space-y-1.5">
                    {ts.map((t) => (
                      <div key={t.id} className="flex items-center justify-between gap-3">
                        <span className="text-[13px] text-ink-2">{t.titulo}</span>
                        <StatusBadge status={t.status} />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </Card>

          <div className="mt-7">
            <SectionTitle note="Prazo de guarda por documento, não por cliente">
              Documentos da competência
            </SectionTitle>
            {maskedCount > 0 && (
              <div className="mb-3">
                <Callout label="Campos mascarados" tone="navy">
                  <p>
                    {maskedCount} documento(s) sensível(is) estão ocultos para o seu papel —
                    dados de saúde ou filiação sindical pertencentes a outro departamento
                    (LGPD Art. 5º, II). A linha continua visível para que o arquivo não pareça
                    incompleto; o conteúdo, não.
                  </p>
                </Callout>
              </div>
            )}
            <Table head={["Documento", "Departamento", "Recebido", "Guarda"]}>
              {docs.map((d) => (
                <tr key={d.id}>
                  <Td>
                    <span className={d.masked ? "italic text-ink-3" : "font-medium text-ink"}>
                      {d.displayName}
                    </span>
                    {d.sensivel && (
                      <span className="ml-2"><Badge tone="navy">sensível</Badge></span>
                    )}
                    {!d.recebidoEm && d.solicitadoEm && (
                      <p className="mt-1 font-mono text-[10.5px] text-gold">
                        solicitado {shortDate(d.solicitadoEm)} via{" "}
                        {d.canalSolicitacao ? CANAL_LABEL[d.canalSolicitacao] : "—"}
                      </p>
                    )}
                  </Td>
                  <Td>{DEPARTAMENTO_LABEL[d.departamento]}</Td>
                  <Td>
                    {d.recebidoEm ? shortDate(d.recebidoEm) : <Badge tone="gold">pendente</Badge>}
                  </Td>
                  <Td className="text-xs">{RETENCAO_LABEL[d.retention]}</Td>
                </tr>
              ))}
            </Table>
            {docs.length === 0 && (
              <Card className="p-6 text-center text-sm text-ink-3">
                Nenhum documento registrado nesta competência.
              </Card>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <SectionTitle>Contatos</SectionTitle>
            <Card className="divide-y divide-line">
              {client.contatos.map((c) => (
                <div key={c.email} className="p-4">
                  <p className="font-display text-sm font-bold text-ink">{c.nome}</p>
                  <p className="text-xs text-ink-3">{c.cargo}</p>
                  <p className="mt-1.5 break-all text-[13px] text-ink-2">{c.email}</p>
                  {c.whatsapp ? (
                    <p className="mt-1 font-mono text-[12px] text-green">{c.whatsapp}</p>
                  ) : (
                    <p className="mt-1 font-mono text-[11px] text-gold">sem WhatsApp cadastrado</p>
                  )}
                </div>
              ))}
            </Card>
          </div>

          <div>
            <SectionTitle>Sócios</SectionTitle>
            <Card className="divide-y divide-line">
              {client.socios.map((s) => (
                <div key={s.nome} className="flex items-baseline justify-between p-3.5">
                  <div>
                    <p className="text-[13px] font-semibold text-ink">{s.nome}</p>
                    <p className="font-mono text-[11px] text-ink-3">{s.cpf}</p>
                  </div>
                  <p className="font-mono text-[13px] tabular-nums text-ink-2">{s.participacao}%</p>
                </div>
              ))}
            </Card>
          </div>

          <div>
            <SectionTitle note="Via agregador licenciado, nunca raspagem direta">
              Bancos & Open Finance
            </SectionTitle>
            <Card className="divide-y divide-line">
              {client.contas.length === 0 && (
                <p className="p-4 text-sm text-ink-3">Nenhuma conta cadastrada.</p>
              )}
              {client.contas.map((c) => (
                <div key={`${c.banco}-${c.conta}`} className="p-4">
                  <p className="font-display text-sm font-bold text-ink">{c.banco}</p>
                  <p className="font-mono text-[11px] text-ink-3">
                    ag. {c.agencia} · cc. {c.conta}
                  </p>
                  <div className="mt-2">
                    {c.openFinance.conectado ? (
                      <>
                        <Badge tone="green">consentimento vigente</Badge>
                        <p className="mt-1.5 text-xs text-ink-3">
                          Expira {shortDate(c.openFinance.expiraEm)} · revogável em uma ação
                          pelo cliente
                        </p>
                      </>
                    ) : (
                      <Badge tone="neutral">não conectado</Badge>
                    )}
                  </div>
                </div>
              ))}
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
