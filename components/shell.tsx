"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useSession } from "./session";
import { ROLE_LABEL, canAccessAdmin, visibleDepartments } from "@/lib/access";
import { COMPETENCIAS, COMPETENCIA_ATUAL, DEPARTMENTS, FIRM } from "@/lib/data";

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = href === "/dashboard" ? pathname === href : pathname.startsWith(href);
  return (
    <Link
      href={href}
      className={`block rounded-lg px-3 py-1.5 text-[13.5px] transition-colors ${
        active
          ? "bg-navy-soft font-semibold text-navy-ink"
          : "text-ink-2 hover:bg-surface-2 hover:text-ink"
      }`}
    >
      {children}
    </Link>
  );
}

function NavGroup({ label }: { label: string }) {
  return (
    <p className="mt-5 mb-1.5 px-3 font-mono text-[10.5px] uppercase tracking-wider text-ink-3">
      {label}
    </p>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  const { viewer, candidates, userId, setUserId, theme, toggleTheme } = useSession();
  const [open, setOpen] = useState(false);
  const depts = visibleDepartments(viewer);
  const comp = COMPETENCIAS.find((c) => c.id === COMPETENCIA_ATUAL)!;

  const nav = (
    <>
      <NavGroup label="Escritório" />
      <NavLink href="/dashboard">Painel</NavLink>
      <NavLink href="/status">Central de status</NavLink>
      <NavLink href="/clientes">Clientes</NavLink>

      <NavGroup label="Departamentos" />
      {DEPARTMENTS.filter((d) => depts.includes(d.slug)).map((d) => (
        <NavLink key={d.slug} href={`/departamentos/${d.slug}`}>
          {d.nome}
        </NavLink>
      ))}

      <NavGroup label="Automação" />
      <NavLink href="/lancamentos">Auto-lançamento</NavLink>
      <NavLink href="/agentes">Agentes</NavLink>
      <NavLink href="/portal">Portal do cliente</NavLink>

      {canAccessAdmin(viewer) && (
        <>
          <NavGroup label="Diretoria" />
          <NavLink href="/admin">Painel administrativo</NavLink>
        </>
      )}

      <NavGroup label="Documentação" />
      <NavLink href="/spec">Especificação</NavLink>
    </>
  );

  return (
    <div className="min-h-dvh">
      {/* Barra superior */}
      <header className="sticky top-0 z-30 border-b border-line bg-surface/95 backdrop-blur">
        <div className="flex items-center gap-3 px-4 py-2.5">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Alternar menu"
            aria-expanded={open}
            className="rounded-lg border border-line p-1.5 text-ink-2 lg:hidden"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            </svg>
          </button>

          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-md bg-navy font-display text-[13px] font-extrabold text-white">
              CA
            </span>
            <span className="hidden font-display text-sm font-bold text-ink sm:block">
              {FIRM.nome}
            </span>
          </Link>

          <span className="ml-2 hidden rounded-md border border-line bg-surface-2 px-2 py-0.5 font-mono text-[11px] text-ink-2 md:inline">
            Competência {comp.label}
          </span>

          <div className="ml-auto flex items-center gap-2">
            {/* Seletor de papel — no lugar da autenticação. Rotulado para nunca
                ser confundido com controle de acesso. */}
            <label className="hidden items-center gap-2 sm:flex">
              <span className="font-mono text-[10.5px] uppercase tracking-wider text-ink-3">
                Protótipo · papel
              </span>
              <select
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="rounded-lg border border-line bg-surface px-2 py-1.5 text-[13px] text-ink"
              >
                {candidates.map((u) => (
                  <option key={u.id} value={u.id}>
                    {ROLE_LABEL[u.role]} — {u.nome}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "Usar tema claro" : "Usar tema escuro"}
              className="rounded-lg border border-line p-1.5 text-ink-2 hover:text-navy-ink"
            >
              {theme === "dark" ? (
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1400px]">
        {/* Menu lateral */}
        <aside
          className={`${
            open ? "block" : "hidden"
          } fixed inset-x-0 top-[53px] z-20 max-h-[calc(100dvh-53px)] overflow-y-auto border-b border-line bg-surface px-3 pb-6 lg:sticky lg:top-[53px] lg:block lg:h-[calc(100dvh-53px)] lg:w-60 lg:shrink-0 lg:border-b-0 lg:border-r`}
          onClick={() => setOpen(false)}
        >
          {/* O seletor de papel é o ponto central do protótipo, então precisa
              ser alcançável no celular também — no topo não cabe nessa largura. */}
          <label className="mt-2 block px-3 sm:hidden" onClick={(e) => e.stopPropagation()}>
            <span className="font-mono text-[10.5px] uppercase tracking-wider text-ink-3">
              Protótipo · papel
            </span>
            <select
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-line bg-surface px-2 py-1.5 text-[13px] text-ink"
            >
              {candidates.map((u) => (
                <option key={u.id} value={u.id}>
                  {ROLE_LABEL[u.role]} — {u.nome}
                </option>
              ))}
            </select>
          </label>

          <nav className="pt-2">{nav}</nav>
          <p className="mt-6 px-3 text-[11px] leading-relaxed text-ink-3">
            Papel atual: <strong className="text-ink-2">{ROLE_LABEL[viewer.role]}</strong>.
            {viewer.role === "executor" && " Vê apenas o próprio departamento."}
          </p>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
