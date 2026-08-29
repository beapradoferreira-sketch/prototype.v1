"use client";

/* Porta de módulo desligado.
 *
 * As capacidades de Fase 2/3 chegam desligadas de propósito, mas a versão
 * anterior desta tela só mandava a pessoa procurar o interruptor em outro lugar
 * — o que na prática faz a funcionalidade parecer inexistente. Quem tem
 * permissão para ligar liga daqui mesmo; quem não tem, ao menos entende o que
 * existe atrás da porta e a quem pedir.
 */

import Link from "next/link";
import { useSession } from "./session";
import { Card } from "./ui";
import { canAccessAdmin } from "@/lib/access";
import { MODULES } from "@/lib/data";
import type { ModuleSlug } from "@/lib/types";

export function ModuleGate({ slug }: { slug: ModuleSlug }) {
  const { modules, toggleModule, viewer } = useSession();
  const mod = MODULES.find((m) => m.slug === slug);
  if (!mod || modules[slug]) return null;

  return (
    <Card className="p-10 text-center">
      <p className="font-mono text-[11px] uppercase tracking-wider text-gold">Fase {mod.fase}</p>
      <p className="mt-2 font-display text-lg font-extrabold text-ink">
        {mod.nome} está desativado
      </p>
      <p className="mx-auto mt-2 max-w-lg text-sm text-ink-2">{mod.descricao}</p>

      {canAccessAdmin(viewer) ? (
        <>
          <button
            type="button"
            onClick={() => toggleModule(slug)}
            className="mt-5 rounded-lg border border-navy bg-navy px-4 py-2 text-[13.5px] font-semibold text-white hover:opacity-90"
          >
            Ativar agora
          </button>
          <p className="mx-auto mt-3 max-w-lg text-xs text-ink-3">
            Liga só para você, neste navegador — dá para desligar de novo em{" "}
            <Link href="/admin/modulos" className="text-navy-ink underline underline-offset-2">
              Admin › Módulos
            </Link>
            . Em produção seria uma flag por escritório, com a mesma tela.
          </p>
        </>
      ) : (
        <p className="mx-auto mt-4 max-w-lg text-sm text-ink-3">
          Capacidades de Fase 2 e 3 chegam desligadas por padrão. Só a diretoria liga cada
          uma, quando ela estiver de fato pronta — sem redeploy.
        </p>
      )}
    </Card>
  );
}
