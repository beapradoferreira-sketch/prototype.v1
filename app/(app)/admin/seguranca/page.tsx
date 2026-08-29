"use client";

/* Admin 04 — Console de segurança.
 *
 * Onde os seis agentes aparecem. A regra de escalonamento é o ponto: severidade
 * baixa auto-remedia com registro em log, qualquer coisa que toque dado pessoal
 * vai para o encarregado e não para um engenheiro — e o relógio da ANPD fica na
 * tela porque, sem detecção automática, o dia 1 da janela de 3 dias é quando
 * alguém por acaso reparar.
 */

import { useState } from "react";
import { Badge, Callout, Card, PageHeader, SectionTitle, dateTime } from "@/components/ui";
import { FLAGS, getUser, FIRM } from "@/lib/data";
import { AGENTE_LABEL, SEVERIDADE_LABEL } from "@/lib/labels";

export default function SegurancaPage() {
  const [mostrarResolvidas, setMostrarResolvidas] = useState(false);
  const flags = FLAGS.filter((f) => mostrarResolvidas || !f.resolvida);
  const encarregado = getUser(FIRM.encarregadoId);

  return (
    <>
      <PageHeader
        title="Console de segurança"
        note="Feed dos seis agentes, com limiares configuráveis e destino de escalonamento."
        actions={
          <label className="flex items-center gap-2 text-[13px] text-ink-2">
            <input
              type="checkbox"
              checked={mostrarResolvidas}
              onChange={(e) => setMostrarResolvidas(e.target.checked)}
              className="accent-[var(--navy)]"
            />
            Mostrar resolvidas
          </label>
        }
      />

      <div className="mb-6">
        <Callout label="O relógio da ANPD" tone="gold">
          <p>
            Incidente confirmado com risco relevante precisa chegar à ANPD e aos titulares
            em <strong>3 dias úteis</strong> — 6 para agente de pequeno porte, provavelmente
            o caso no lançamento. Comunicação preliminar basta dentro da janela, com o
            detalhe completo em até 20 dias úteis. Os agentes existem para que esse relógio
            seja cumprível: sem detecção automática, o dia 1 é quando alguém repara.
          </p>
          <p>
            Encarregado atual: <strong className="text-ink">{encarregado?.nome}</strong>.
          </p>
        </Callout>
      </div>

      <SectionTitle note={`${flags.length} sinalização(ões)`}>Feed</SectionTitle>
      <Card className="divide-y divide-line">
        {flags.map((f) => (
          <div key={f.id} className={`p-4 ${f.resolvida ? "opacity-60" : ""}`}>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={f.severidade === "alta" ? "red" : f.severidade === "media" ? "gold" : "neutral"}>
                {SEVERIDADE_LABEL[f.severidade]}
              </Badge>
              <Badge tone="neutral">{AGENTE_LABEL[f.agente]}</Badge>
              {f.escalarParaEncarregado && <Badge tone="navy">escalar ao encarregado</Badge>}
              {f.resolvida && <Badge tone="green">resolvida</Badge>}
              <span className="ml-auto font-mono text-[11px] text-ink-3">{dateTime(f.em)}</span>
            </div>
            <p className="mt-2 font-display text-sm font-bold text-ink">{f.titulo}</p>
            <p className="mt-1 text-[13px] text-ink-2">{f.detalhe}</p>
          </div>
        ))}
      </Card>

      <div className="mt-7">
        <SectionTitle note="Quem é avisado, e a partir de quê">Escalonamento</SectionTitle>
        <Card className="p-5">
          <ul className="space-y-2 text-sm text-ink-2">
            <li>
              <strong className="text-ink">Baixa</strong> — auto-remediação (limitar taxa,
              bloquear, revogar) com registro em log. Ninguém é acordado.
            </li>
            <li>
              <strong className="text-ink">Média</strong> — alerta para a diretoria no
              próximo expediente.
            </li>
            <li>
              <strong className="text-ink">Alta, ou qualquer coisa tocando dado pessoal</strong> —
              vai para o encarregado, não para um engenheiro. É ele que responde à ANPD.
            </li>
            <li>
              <strong className="text-ink">Integridade de fornecedor</strong> — só alerta,
              nunca auto-remedia. Retry automático errado contra API de governo cria um
              problema novo em cima do antigo.
            </li>
          </ul>
        </Card>
      </div>
    </>
  );
}
