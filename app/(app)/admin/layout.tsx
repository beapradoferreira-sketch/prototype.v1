"use client";

/* Admin — the Owner tier, above manager/executor.
 *
 * The brief is explicit that this is a different surface from the dashboard:
 * configuring integrations, who has access to what, and what the agents flagged
 * overnight is not the same job as seeing who is behind this competência.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "@/components/session";
import { Card } from "@/components/ui";
import { canAccessAdmin } from "@/lib/access";

const TABS = [
  { href: "/admin", label: "Visão geral" },
  { href: "/admin/equipe", label: "Equipe" },
  { href: "/admin/integracoes", label: "Integrações" },
  { href: "/admin/procuracoes", label: "Procurações" },
  { href: "/admin/seguranca", label: "Segurança" },
  { href: "/admin/auditoria", label: "Auditoria" },
  { href: "/admin/lgpd", label: "LGPD" },
  { href: "/admin/modulos", label: "Módulos" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { viewer } = useSession();
  const pathname = usePathname();

  if (!canAccessAdmin(viewer)) {
    return (
      <Card className="p-10 text-center">
        <p className="font-display text-base font-bold text-ink">Restrito à diretoria</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink-2">
          O painel administrativo é um quarto nível acima de gestor e executor. Troque o
          papel no topo para Diretoria para ver esta área.
        </p>
        <Link href="/dashboard" className="mt-4 inline-block text-sm text-navy-ink underline">
          Voltar ao painel
        </Link>
      </Card>
    );
  }

  return (
    <>
      <div className="mb-6 scroll-x -mx-1 border-b border-line px-1">
        <nav className="flex gap-1 pb-px">
          {TABS.map((t) => {
            const active = t.href === "/admin" ? pathname === t.href : pathname.startsWith(t.href);
            return (
              <Link
                key={t.href}
                href={t.href}
                className={`whitespace-nowrap border-b-2 px-3 py-2 text-[13.5px] transition-colors ${
                  active
                    ? "border-navy font-semibold text-navy-ink"
                    : "border-transparent text-ink-2 hover:text-ink"
                }`}
              >
                {t.label}
              </Link>
            );
          })}
        </nav>
      </div>
      {children}
    </>
  );
}
