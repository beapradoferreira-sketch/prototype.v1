"use client";

/* Admin 02 — Integrações e credenciais.
 *
 * O lado humano dos agentes de higiene de credencial e integridade de
 * fornecedor: eles observam, você age aqui. A direção aparece por integração
 * porque é o detalhe mais frequentemente presumido errado — a API pública do
 * Domínio só aceita entrada, não devolve o razão para leitura.
 */

import { Badge, Callout, Card, PageHeader, SectionTitle, dateTime, shortDate } from "@/components/ui";
import { INTEGRATIONS } from "@/lib/data";
import { DIRECAO_LABEL, INTEGRACAO_STATUS_LABEL } from "@/lib/labels";

const TONE = { conectada: "green", atencao: "gold", erro: "red", "nao-configurada": "neutral" } as const;

function diasAte(iso: string | null): number | null {
  if (!iso) return null;
  const hoje = new Date("2026-08-29");
  const alvo = new Date(iso);
  return Math.round((alvo.getTime() - hoje.getTime()) / 86400000);
}

export default function IntegracoesPage() {
  return (
    <>
      <PageHeader
        title="Integrações e credenciais"
        note="Situação, validade de certificado, última sincronização e rotação. Um painel por dependência externa."
      />

      <div className="mb-6">
        <Callout label="Domínio permanece o sistema de registro" tone="navy">
          <p>
            A API pública do Domínio é de entrada apenas: serve para empurrar XML fiscal
            para dentro dele, não para ler razão, cadastro ou lançamentos de volta. O
            desenho aqui trata este sistema como fonte da verdade de <em>fluxo e status</em> —
            o que o Domínio não faz — e mantém o Domínio como razão contábil de registro,
            sem ninguém digitar duas vezes.
          </p>
        </Callout>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {INTEGRATIONS.map((i) => {
          const dias = diasAte(i.expiraEm);
          return (
            <Card key={i.id} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <p className="font-display text-[15px] font-bold text-ink">{i.nome}</p>
                <Badge tone={TONE[i.status]}>{INTEGRACAO_STATUS_LABEL[i.status]}</Badge>
              </div>
              <p className="mt-1.5 text-[13px] text-ink-2">{i.descricao}</p>

              <dl className="mt-4 space-y-1.5 font-mono text-[11.5px] text-ink-3">
                <div className="flex justify-between gap-3">
                  <dt>direção</dt>
                  <dd className="text-right text-ink-2">{DIRECAO_LABEL[i.direcao]}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt>última sincronização</dt>
                  <dd className="text-right text-ink-2">
                    {i.ultimoSync ? dateTime(i.ultimoSync) : "nunca"}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt>expira</dt>
                  <dd className={`text-right ${dias !== null && dias < 30 ? "text-red" : "text-ink-2"}`}>
                    {i.expiraEm ? `${shortDate(i.expiraEm)} · ${dias}d` : "—"}
                  </dd>
                </div>
              </dl>

              <div className="mt-4 flex gap-2">
                <button className="rounded-lg border border-line bg-surface-2 px-2.5 py-1.5 text-[12.5px] font-semibold text-navy-ink hover:border-navy">
                  {i.status === "nao-configurada" ? "Configurar" : "Reconectar"}
                </button>
                {i.expiraEm && (
                  <button className="rounded-lg border border-line px-2.5 py-1.5 text-[12.5px] text-ink-2 hover:border-line-strong">
                    Rotacionar credencial
                  </button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <div className="mt-7">
        <SectionTitle>Antes de contratar</SectionTitle>
        <Card className="p-5">
          <ul className="space-y-2 text-sm text-ink-2">
            <li>
              <strong className="text-ink">SERPRO</strong> — o catálogo de serviços é liberado
              gradualmente. Vale abrir conta de desenvolvedor e conferir o que está de fato
              exposto hoje antes de escopar uma declaração específica.
            </li>
            <li>
              <strong className="text-ink">Domínio</strong> — confirmar com a equipe de API da
              Thomson Reuters se existe leitura em massa além do que a documentação pública
              mostra. É um e-mail de quinze minutos que evita escopar em cima de suposição.
            </li>
            <li>
              <strong className="text-ink">Open Finance</strong> — roteie por agregador
              licenciado. Move parte da superfície de LGPD e BACEN para quem tem isso como
              negócio inteiro.
            </li>
          </ul>
        </Card>
      </div>
    </>
  );
}
