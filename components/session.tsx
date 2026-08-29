"use client";

/* Sessão do protótipo.
 *
 * Não há autenticação aqui de propósito (DECISOES.md §4): auth real não tem
 * questão de desenho em aberto, ao passo que as *consequências* do papel — o
 * que é visível, o que é mascarado, o que vai para o log — são a parte
 * interessante e estão inteiramente implementadas. Este provider faz o papel do
 * que uma sessão real forneceria, então ligar auth depois muda só este arquivo.
 *
 * Os toggles de módulo também moram aqui, porque as capacidades de Fase 2/3
 * chegam desligadas e são ligadas em Admin › Módulos.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { MODULES, USERS } from "@/lib/data";
import type { ModuleSlug, User } from "@/lib/types";
import type { Viewer } from "@/lib/access";

interface SessionValue {
  viewer: Viewer;
  userId: string;
  setUserId: (id: string) => void;
  candidates: User[];
  modules: Record<ModuleSlug, boolean>;
  toggleModule: (slug: ModuleSlug) => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
}

const SessionContext = createContext<SessionValue | null>(null);

const DEFAULT_MODULES = Object.fromEntries(
  MODULES.map((m) => [m.slug, m.habilitado]),
) as Record<ModuleSlug, boolean>;

/** Um usuário representativo por papel, para o seletor. */
const CANDIDATES = ["u1", "u3", "u5"].map((id) => USERS.find((u) => u.id === id)!).filter(Boolean);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserIdState] = useState("u1");
  const [modules, setModules] = useState<Record<ModuleSlug, boolean>>(DEFAULT_MODULES);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Restaura depois da montagem para o render do servidor seguir determinístico.
  useEffect(() => {
    try {
      const u = localStorage.getItem("ca.userId");
      if (u && USERS.some((x) => x.id === u)) setUserIdState(u);
      const m = localStorage.getItem("ca.modules");
      if (m) setModules({ ...DEFAULT_MODULES, ...JSON.parse(m) });
    } catch {
      /* aba anônima, storage bloqueado — os padrões servem */
    }
    const attr = document.documentElement.getAttribute("data-theme");
    setTheme(attr === "dark" ? "dark" : "light");
  }, []);

  const setUserId = useCallback((id: string) => {
    setUserIdState(id);
    try {
      localStorage.setItem("ca.userId", id);
    } catch {}
  }, []);

  const toggleModule = useCallback((slug: ModuleSlug) => {
    setModules((prev) => {
      const next = { ...prev, [slug]: !prev[slug] };
      try {
        localStorage.setItem("ca.modules", JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      try {
        localStorage.setItem("ca.theme", next);
      } catch {}
      return next;
    });
  }, []);

  const value = useMemo<SessionValue>(() => {
    const user = USERS.find((u) => u.id === userId) ?? USERS[0];
    return {
      viewer: { user, role: user.role, departamentos: user.departamentos },
      userId,
      setUserId,
      candidates: CANDIDATES,
      modules,
      toggleModule,
      theme,
      toggleTheme,
    };
  }, [userId, setUserId, modules, toggleModule, theme, toggleTheme]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used inside SessionProvider");
  return ctx;
}
