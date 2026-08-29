# Decisions taken on the spec's open questions

The brief left several things explicitly undecided and listed six of them as
blocking a Phase 1 build. A prototype cannot be built without settling them, so
each is resolved below. These are judgment calls, not instructions received —
every one is cheap to reverse, and the reasoning is recorded so it can be argued
with.

---

## 1. Which product shape — A, B or C?

**Decided: A, the internal ops platform.**

The brief recommends A itself, and it is the only shape with no cold-start
problem: the firm is its own first user. The data model below is written so that
adding a `firmId` scope later turns it into B (multi-tenant SaaS) without a
rewrite; nothing in the prototype assumes a single firm in a way that would have
to be undone.

## 2. Tech stack — the brief says this is the builder's call

**Decided: Next.js 15 (App Router) + TypeScript + Tailwind v4.**

- Vercel is a stated constraint, and Next.js is what Vercel deploys with zero
  configuration — no build settings to get wrong.
- This is a data-dense internal tool, mostly reads. React Server Components
  render that well without shipping the whole dataset to the browser.
- TypeScript because the entity model *is* the hard part of this product. The
  types in `lib/types.ts` are the deliverable as much as the screens are.
- Tailwind because the design direction is already fixed as tokens; a token
  system maps onto CSS variables + utilities cleanly and there is no design
  system to fight.

It is a real foundation, not a throwaway mock — the same repo can grow into
Phase 1 proper by replacing `lib/data.ts` with a database.

## 3. Core data model — "no entity schema exists yet"

**Decided.** Eleven entities in `lib/types.ts`:

`Firm`, `User`, `Department`, `Client`, `Competencia`, `Task`, `Document`,
`Procuracao`, `IntegrationCredential`, `AuditEntry`, `SecurityFlag`,
`DSARRequest`.

Three shapes in that model are doing real work and are worth calling out:

- **`Competencia` is a first-class entity, not a date field.** The whole business
  runs in monthly reference periods; making it an entity is what lets the status
  hub ask "what is the state of *this* month for *this* client in *this*
  department" as a lookup rather than a scan.
- **Retention is tagged per document, not per client.** The brief is emphatic
  that a blanket purge job will either illegally delete or illegally retain,
  because one client file mixes 5-year fiscal, 10-year payroll and 30-year FGTS
  obligations. `Document.retention` carries its own class and computed expiry.
- **`Task` has exactly one `assigneeId`.** Diffuse ownership is named across the
  research as the industry's core failure mode. The type makes shared ownership
  unrepresentable rather than merely discouraged.

## 4. Authentication

**Decided: none, deliberately, and labelled.**

The prototype ships a role switcher (Owner / Manager / Executor) instead of a
login. Real auth is a Phase 1 task with no design questions left open in it,
whereas the *consequences* of role — what each role can see, what gets masked,
what gets logged — are the interesting part and are fully implemented. Every
screen renders through the same permission helpers a real session would feed.

The switcher is visible in the top bar and marked as prototype-only so nobody
mistakes it for an access control.

## 5. How much of the roadmap to build

**Decided: Phase 1 fully; Phases 2–3 present but gated behind the module
toggles the brief already specifies.**

Phase 1 screens (role-based home, dashboard, department workspaces, client
database, status hub) are built and populated. Auto-lançamento, the client
portal and the agents environment are built as real screens but ship disabled,
switchable from Admin → Módulos.

This resolves the roadmap honestly rather than leaving dead links: the phased
rollout becomes a working feature of the product instead of a note in a
document, and it demonstrates the module-toggle screen at the same time.

## 6. CNPJ alfanumérico

**Decided: dual-format from the first line of code**, per the brief's
insistence that it not be a v2 migration. `lib/cnpj.ts` validates both the
legacy all-numeric CNPJ and the alphanumeric format live since July 2026, using
the official mod-11 check where letters contribute `ASCII − 48`. Both formats
appear in the seed data so the UI is exercised against each.

## 7. Backup & disaster recovery

**Not built — out of scope for a UI prototype, and flagged rather than
silently dropped.** It is an infrastructure decision (managed Postgres with
PITR, tested restores) that belongs with the database choice at the start of
Phase 1 proper. The brief is right that the 30-year FGTS obligation makes it a
compliance question, not an ops convenience.

## 8. WhatsApp as a first-class channel

**Modelled, not integrated.** Clients carry a WhatsApp contact and document
requests record which channel they went out on, so the data model does not have
to change when a BSP is chosen. Actually sending messages needs a Meta Business
account and a vendor decision — neither is a prototype call.

---

## Things deliberately NOT decided here

- **Which Open Finance aggregator** (Pluggy vs Celcoin) — needs pricing and
  coverage conversations.
- **Whether to contract SERPRO Integra Contador now** — the brief's advice to
  check the current service catalogue first still stands.
- **Phase 1 exit criteria** — this is a business judgment about the firm's own
  tolerance, not a technical one. It needs a number from the founders; the
  status hub is instrumented to measure whatever number they pick.
