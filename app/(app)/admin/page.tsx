"use client";

/* Admin 08 — System health + overview. */

import Link from "next/link";
import { Badge, Card, PageHeader, SectionTitle, Stat, dateTime } from "@/components/ui";
import { CLIENTS, DSARS, FLAGS, INTEGRATIONS, PROCURACOES, USERS } from "@/lib/data";

const STATUS_TONE = {
  conectada: "green",
  atencao: "gold",
  erro: "red",
  "nao-configurada": "neutral",
} as const;

export default function AdminHome() {
  const abertas = FLAGS.filter((f) => !f.resolvida);
  const altas = abertas.filter((f) => f.severidade === "alta");
  const procPendentes = PROCURACOES.filter((p) => p.status !== "ativa");
  const dsarAbertas = DSARS.filter((d) => d.status !== "respondida");

  return (
    <>
      <PageHeader
        title="Painel administrativo"
        note="Onde a diretoria opera o sistema — não onde a equipe trabalha nele."
      />

      <div className="mb-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Sinalizações abertas"
          value={String(abertas.length)}
          sub={`${altas.length} de severidade alta`}
          tone={altas.length > 0 ? "red" : "green"}
        />
        <Stat
          label="Procurações não ativas"
          value={String(procPendentes.length)}
          sub={`de ${PROCURACOES.length} clientes`}
          tone={procPendentes.length > 0 ? "gold" : "green"}
        />
        <Stat label="Pedidos LGPD abertos" value={String(dsarAbertas.length)} sub="Art. 18" tone={dsarAbertas.length > 0 ? "gold" : "green"} />
        <Stat
          label="Assentos ativos"
          value={String(USERS.filter((u) => u.ativo).length)}
          sub={`${CLIENTS.filter((c) => c.ativo).length} clientes ativos`}
        />
      </div>

      <SectionTitle note="Status das dependências externas — o limite de confiança do sistema">
        Saúde do sistema
      </SectionTitle>
      <Card className="mb-7 divide-y divide-line">
        {INTEGRATIONS.map((i) => (
          <div key={i.id} className="flex flex-wrap items-center gap-3 p-4">
            <div className="min-w-0 flex-1">
              <p className="font-display text-sm font-bold text-ink">{i.nome}</p>
              <p className="mt-0.5 text-xs text-ink-3">{i.descricao}</p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <span className="font-mono text-[11px] text-ink-3">
                {i.ultimoSync ? `sync ${dateTime(i.ultimoSync)}` : "nunca sincronizou"}
              </span>
              <Badge tone={STATUS_TONE[i.status]}>{i.status.replace("-", " ")}</Badge>
            </div>
          </div>
        ))}
      </Card>

      {altas.length > 0 && (
        <>
          <SectionTitle note="Severidade alta, ainda abertas">Precisa de você agora</SectionTitle>
          <Card className="divide-y divide-line">
            {altas.map((f) => (
              <div key={f.id} className="p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="red">{f.severidade}</Badge>
                  {f.escalarParaEncarregado && <Badge tone="navy">encarregado</Badge>}
                  <span className="ml-auto font-mono text-[11px] text-ink-3">{dateTime(f.em)}</span>
                </div>
                <p className="mt-1.5 font-display text-sm font-bold text-ink">{f.titulo}</p>
                <p className="mt-1 text-[13px] text-ink-2">{f.detalhe}</p>
              </div>
            ))}
          </Card>
          <Link
            href="/admin/seguranca"
            className="mt-3 inline-block text-sm text-navy-ink underline underline-offset-2"
          >
            Abrir console de segurança
          </Link>
        </>
      )}
    </>
  );
}
