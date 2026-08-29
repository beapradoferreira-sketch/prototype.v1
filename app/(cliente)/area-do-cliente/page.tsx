"use client";

/* Entrada da área do cliente.
 *
 * Existe porque a visão do cliente estava alcançável só por dentro do /portal,
 * e portanto invisível para quem não soubesse que ela existia. Em produção o
 * cliente cai direto na própria área pelo login dele; aqui a lista faz o papel
 * do login para poder demonstrar qualquer cliente.
 */

import Link from "next/link";
import { useSession } from "@/components/session";
import { ModuleGate } from "@/components/module-gate";
import { Badge, Card } from "@/components/ui";
import { CLIENTS, COMPETENCIA_ATUAL } from "@/lib/data";
import { buildPortalView } from "@/lib/portal";
import { REGIME_LABEL } from "@/lib/labels";

export default function AreaDoClienteIndex() {
  const { modules } = useSession();

  if (!modules["portal-cliente"]) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <ModuleGate slug="portal-cliente" />
        <p className="mt-4 text-center text-sm text-ink-3">
          <Link href="/dashboard" className="text-navy-ink underline underline-offset-2">
            Voltar ao sistema
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <p className="font-mono text-[11px] uppercase tracking-wider text-gold">
        Prévia interna
      </p>
      <h1 className="mt-2 font-display text-2xl font-extrabold tracking-tight text-ink">
        Área do cliente
      </h1>
      <p className="mt-1 max-w-xl text-sm text-ink-2">
        Isto é o que o titular do CNPJ enxerga — a própria competência e nada além
        dela. Em produção ele entra pelo próprio login; aqui você escolhe por qual
        cliente quer ver.
      </p>

      <div className="mt-6 space-y-2">
        {CLIENTS.filter((c) => c.ativo).map((c) => {
          const v = buildPortalView(c.id, COMPETENCIA_ATUAL);
          if (!v) return null;
          return (
            <Link key={c.id} href={`/area-do-cliente/${c.id}`} className="block">
              <Card className="flex flex-wrap items-center gap-3 p-4 transition-colors hover:border-line-strong">
                <div className="min-w-0 flex-1">
                  <p className="font-display text-sm font-bold text-ink">{c.nomeFantasia}</p>
                  <p className="mt-0.5 text-xs text-ink-3">
                    {REGIME_LABEL[c.regime]} · {v.pctGeral}% da competência
                  </p>
                </div>
                {v.pendencias.length > 0 ? (
                  <Badge tone="gold">{v.pendencias.length} pendente(s)</Badge>
                ) : (
                  <Badge tone="green">em dia</Badge>
                )}
              </Card>
            </Link>
          );
        })}
      </div>

      <p className="mt-6 text-sm text-ink-3">
        <Link href="/dashboard" className="text-navy-ink underline underline-offset-2">
          Voltar ao sistema
        </Link>
      </p>
    </div>
  );
}
