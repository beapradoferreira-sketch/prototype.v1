"use client";

/* Prototype session.
 *
 * There is no authentication here on purpose (DECISIONS.md §4): real auth has
 * no open design questions, whereas the *consequences* of role — what is
 * visible, what is masked, what is logged — are the interesting part and are
 * fully implemented. This provider stands in for what a real session would
 * supply, so swapping in auth means changing this file only.
 *
 * Module toggles live here too, because Phase 2/3 capabilities ship disabled
 * and are switched on from Admin › Módulos.
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

/** One representative user per role, for the switcher. */
const CANDIDATES = ["u1", "u3", "u5"].map((id) => USERS.find((u) => u.id === id)!).filter(Boolean);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserIdState] = useState("u1");
  const [modules, setModules] = useState<Record<ModuleSlug, boolean>>(DEFAULT_MODULES);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Restore after mount so the server render stays deterministic.
  useEffect(() => {
    try {
      const u = localStorage.getItem("ca.userId");
      if (u && USERS.some((x) => x.id === u)) setUserIdState(u);
      const m = localStorage.getItem("ca.modules");
      if (m) setModules({ ...DEFAULT_MODULES, ...JSON.parse(m) });
    } catch {
      /* private mode, blocked storage — defaults are fine */
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
