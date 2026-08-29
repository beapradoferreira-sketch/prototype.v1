"use client";

/* Admin 07 — Module toggles.
 *
 * Phase 2/3 capabilities are switched on here as they are actually built,
 * without a redeploy. This is what turns the roadmap from a note in a document
 * into a working feature of the product.
 */

import Link from "next/link";
import { useSession } from "@/components/session";
import { Badge, Callout, Card, PageHeader } from "@/components/ui";
import { MODULES } from "@/lib/data";

const DESTINO: Record<string, string> = {
  "auto-lancamento": "/lancamentos",
  "portal-cliente": "/portal",
  agentes: "/agentes",
  "open-finance": "/clientes",
};

export default function ModulosPage() {
  const { modules, toggleModule } = useSession();

  return (
    <>
      <PageHeader
        title="Módulos"
        note="Capacidades de Fase 2 e 3 chegam desligadas e são ligadas quando estiverem prontas de verdade."
      />

      <div className="mb-6">
        <Callout label="Por que desligado por padrão" tone="navy">
          <p>
            A Fase 1 precisa ser validada contra a rotina real de um escritório antes de
            qualquer automação entrar. Ligar auto-lançamento sobre um fluxo que ninguém
            conferiu é a versão em software do problema que a pesquisa descreve: tecnologia
            sobre processo inexistente só acelera o caos.
          </p>
        </Callout>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {MODULES.map((m) => {
          const on = modules[m.slug];
          return (
            <Card key={m.slug} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Badge tone="neutral">Fase {m.fase}</Badge>
                  <p className="mt-2 font-display text-[15px] font-bold text-ink">{m.nome}</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={on}
                  aria-label={`${on ? "Desativar" : "Ativar"} ${m.nome}`}
                  onClick={() => toggleModule(m.slug)}
                  className={`relative h-6 w-11 shrink-0 rounded-full border transition-colors ${
                    on ? "border-green bg-green" : "border-line bg-surface-2"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${
                      on ? "left-[26px]" : "left-0.5"
                    }`}
                  />
                </button>
              </div>
              <p className="mt-2 text-[13px] text-ink-2">{m.descricao}</p>
              <p className="mt-3">
                {on ? (
                  <Link
                    href={DESTINO[m.slug]}
                    className="text-[13px] text-navy-ink underline underline-offset-2"
                  >
                    Abrir {m.nome.toLowerCase()}
                  </Link>
                ) : (
                  <span className="text-[13px] text-ink-3">Tela existe, mas está bloqueada.</span>
                )}
              </p>
            </Card>
          );
        })}
      </div>

      <Card className="mt-6 p-4">
        <p className="text-sm text-ink-2">
          No protótipo o estado fica no navegador de quem está olhando, para que a
          demonstração seja reversível. Em produção isso é uma flag por escritório no banco,
          com a mesma tela.
        </p>
      </Card>
    </>
  );
}
