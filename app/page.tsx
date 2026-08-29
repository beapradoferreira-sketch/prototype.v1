"use client";

/* Tela 01 — Home / login.
 *
 * O rascunho especifica acesso por papel, com departamento e diretoria
 * escolhidos na entrada. Não há autenticação real no protótipo (DECISOES.md
 * §4), então esta tela escolhe uma identidade em vez de verificá-la — e diz
 * isso com todas as letras, em vez de fingir um campo de senha.
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/components/session";
import { ROLE_DESCRIPTION, ROLE_LABEL } from "@/lib/access";
import { DEPARTMENTS, FIRM } from "@/lib/data";

export default function LoginPage() {
  const { candidates, userId, setUserId } = useSession();
  const router = useRouter();

  return (
    <main className="mx-auto flex min-h-dvh max-w-5xl flex-col justify-center px-6 py-16">
      <div className="mb-10">
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-navy font-display text-base font-extrabold text-white">
          CA
        </span>
        <h1 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          {FIRM.nome}
        </h1>
        <p className="mt-2 max-w-xl text-ink-2">
          Plataforma interna de operações. Escolha um papel para entrar — o que muda
          daqui para frente é o que cada papel enxerga, mascara e registra em log.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {candidates.map((u) => {
          const selected = u.id === userId;
          return (
            <button
              key={u.id}
              type="button"
              onClick={() => {
                setUserId(u.id);
                router.push("/dashboard");
              }}
              className={`rounded-xl border p-5 text-left transition-colors ${
                selected
                  ? "border-navy bg-navy-soft"
                  : "border-line bg-surface hover:border-line-strong"
              }`}
            >
              <p className="font-mono text-[11px] uppercase tracking-wider text-green">
                {ROLE_LABEL[u.role]}
              </p>
              <p className="mt-1.5 font-display text-base font-bold text-ink">{u.nome}</p>
              <p className="mt-1 text-[13px] leading-relaxed text-ink-2">
                {ROLE_DESCRIPTION[u.role]}
              </p>
              <p className="mt-3 font-mono text-[11px] text-ink-3">
                {u.departamentos.length === DEPARTMENTS.length
                  ? "Todos os departamentos"
                  : u.departamentos
                      .map((d) => DEPARTMENTS.find((x) => x.slug === d)?.nome)
                      .join(", ")}
              </p>
            </button>
          );
        })}
      </div>

      <div className="mt-8 rounded-lg border border-l-[3px] border-line border-l-gold bg-surface p-4">
        <p className="mb-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-gold">
          Protótipo — sem autenticação
        </p>
        <p className="text-sm text-ink-2">
          Este seletor substitui o login de verdade. Autenticação real não tem
          questão de desenho em aberto; as <em>consequências</em> do papel — o que
          é visível, o que é mascarado, o que vai para o log — têm, e essas estão
          implementadas. Nenhum dado real de cliente existe aqui.
        </p>
      </div>

      <p className="mt-6 text-sm text-ink-3">
        Vindo da especificação?{" "}
        <Link href="/spec" className="text-navy-ink underline underline-offset-2">
          As decisões tomadas sobre as questões em aberto estão documentadas aqui.
        </Link>
      </p>
    </main>
  );
}
