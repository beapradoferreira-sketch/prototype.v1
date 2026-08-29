"use client";

/* Recorte por cliente nas telas internas.
 *
 * O filtro vive na URL (?cliente=c1) e não em estado local, para que um gestor
 * possa mandar "olha a Prado Metais no Fiscal" como link e a outra pessoa abrir
 * exatamente a mesma tela. Estado local não sobrevive a um copiar-e-colar.
 */

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CLIENTS } from "@/lib/data";

export function useClientFilter() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const clienteId = searchParams.get("cliente") ?? "";
  const cliente = clienteId ? CLIENTS.find((c) => c.id === clienteId) : undefined;

  function setCliente(id: string) {
    const next = new URLSearchParams(searchParams.toString());
    if (id) next.set("cliente", id);
    else next.delete("cliente");
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  // Um id inválido na URL não deve filtrar para o vazio silenciosamente.
  return { clienteId: cliente ? clienteId : "", cliente, setCliente };
}

export function ClientFilter() {
  const { clienteId, setCliente } = useClientFilter();

  return (
    <label className="flex items-center gap-2">
      <span className="font-mono text-[10.5px] uppercase tracking-wider text-ink-3">
        Cliente
      </span>
      <select
        value={clienteId}
        onChange={(e) => setCliente(e.target.value)}
        className="rounded-lg border border-line bg-surface px-2 py-1.5 text-[13px] text-ink"
      >
        <option value="">Todos os clientes</option>
        {CLIENTS.filter((c) => c.ativo).map((c) => (
          <option key={c.id} value={c.id}>
            {c.nomeFantasia}
          </option>
        ))}
      </select>
    </label>
  );
}

/** Faixa que deixa claro que a tela está recortada, com saída em um clique. */
export function ClientFilterBanner() {
  const { cliente, setCliente } = useClientFilter();
  if (!cliente) return null;

  return (
    <div className="mb-5 flex flex-wrap items-center gap-3 rounded-lg border border-navy/25 bg-navy-soft px-4 py-2.5">
      <span className="text-[13px] text-navy-ink">
        Recortado para <strong>{cliente.nomeFantasia}</strong> — os números abaixo são só
        deste cliente.
      </span>
      <button
        type="button"
        onClick={() => setCliente("")}
        className="ml-auto rounded-lg border border-navy/30 px-2.5 py-1 text-[12.5px] font-semibold text-navy-ink hover:bg-surface"
      >
        Ver todos
      </button>
    </div>
  );
}
