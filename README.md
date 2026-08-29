# Contabilidade Automatizada

Clickable prototype of an internal operations platform for a Brazilian
accounting firm — the application the brief specified, not the brief itself.

Four departments with the real dependency chain between them, a client base
carrying both CNPJ formats, a per-competência status hub, and a directors'
panel covering integrations, powers of attorney, audit and the LGPD queue.

> **Prototype, not production.** No authentication, no database, no real client
> data. Every CNPJ is invented; they carry valid check digits only so the
> validator is genuinely exercised.

## Running it

```bash
npm install
```

```bash
npm run dev
```

Then open <http://localhost:3000>. Production build: `npm run build && npm start`.

## Deploying on Vercel

Zero configuration. Import the repo at [vercel.com/new](https://vercel.com/new)
— Vercel detects Next.js and applies the right build and output settings
automatically. Nothing to fill in, no environment variables, no external
services.

```bash
npx vercel --prod
```

## What is where

```
app/
├── page.tsx                  Screen 01 — role selection (stands in for login)
├── layout.tsx                fonts, theme bootstrap, session provider
├── globals.css               design tokens (light + dark)
└── (app)/
    ├── layout.tsx            shell: sidebar, top bar, role switcher
    ├── dashboard/            Screen 02 + 03 — firm dashboard, scoped by role
    ├── status/               Screen 05 — the client × department matrix
    ├── clientes/             Screen 04 — client database
    │   └── [id]/             client detail: masking + per-doc retention
    ├── departamentos/[slug]/ the four department workspaces
    ├── lancamentos/          Screen 06 — auto-lançamento (Phase 2, gated)
    ├── agentes/              Screen 08 — agents environment (Phase 3, gated)
    ├── portal/               client portal preview (Phase 3, gated)
    ├── spec/                 the decisions, readable inside the app
    └── admin/                the Owner tier — 8 screens
lib/
├── types.ts                  the entity model the brief said was missing
├── data.ts                   seed dataset + accessors (swap for a DB)
├── cnpj.ts                   dual-format CNPJ validation
└── access.ts                 role scoping and LGPD field masking
docs/DECISIONS.md             every open question, and what was decided
```

## The parts worth looking at

**The status hub** (`/status`) is the screen the brief ranks highest: cheapest
to build, attacks the most-cited pain point, no external dependency. It answers
"which client is stuck at which department, this month" as a grid.

**Role scoping is enforced, not decorative.** Switch to *Executor — Rafael Lima*
in the top bar and visit `/departamentos/pessoal`: refused at the route, not
merely hidden from the nav. Visit `/clientes/c1` as the same user and the
atestado médico is masked — the row stays visible so the file does not look
incomplete, but the content does not.

**Retention is per document, not per client.** One client file mixes a 5-year
fiscal document, a 10-year payroll record and a 30-year FGTS guide. A
per-client purge rule would necessarily either delete or retain something
illegally.

**CNPJ accepts both formats** from the first schema. `lib/cnpj.ts` implements
the mod-11 check with character value = ASCII − 48, verified against Receita's
own worked example (`12ABC34501DE` → check digits `35`).

**Phases 2 and 3 ship disabled.** Auto-lançamento, the client portal and the
agents environment are built but switched off, and are turned on from
*Admin › Módulos* without a redeploy. That makes the phased roadmap a working
feature rather than a note in a document.

## Open questions from the brief

The brief left six items marked as blocking a Phase 1 build. All are resolved
in [`docs/DECISIONS.md`](docs/DECISIONS.md) — stack, entity model, auth,
roadmap scope, CNPJ handling — along with the four that were deliberately left
open because they need information a prototype cannot invent (aggregator
choice, whether to contract SERPRO now, Phase 1 exit criteria, and backup/DR).

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind v4 · no other runtime
dependencies. Fonts are self-hosted through `next/font`, so the deployed page
makes no third-party requests.
