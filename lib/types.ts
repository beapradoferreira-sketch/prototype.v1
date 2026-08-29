/* Core entity model.
 *
 * The brief listed "no entity schema exists yet" as blocking a Phase 1 build.
 * This is that schema. Notes on the three shapes that are load-bearing:
 *
 *  - Competencia is an entity, not a date field on Task. The business runs in
 *    monthly reference periods and the status hub needs to ask "state of this
 *    month, this client, this department" as a lookup.
 *  - Retention is tagged per Document. One client file legitimately mixes
 *    5-year fiscal, 10-year payroll and 30-year FGTS obligations; a per-client
 *    purge rule would either delete or retain something illegally.
 *  - Task.assigneeId is singular and required. Diffuse ownership is the failure
 *    mode the research named; shared ownership is made unrepresentable.
 *
 * Everything is scoped by firmId even though the prototype runs one firm, so
 * shape (B) — multi-tenant SaaS — is a query change rather than a migration.
 */

export type DepartmentSlug = "fiscal" | "pessoal" | "contabil" | "societario";

export type Role = "owner" | "manager" | "executor";

export type RegimeTributario =
  | "simples-nacional"
  | "lucro-presumido"
  | "lucro-real"
  | "mei";

export interface Firm {
  id: string;
  nome: string;
  cnpj: string;
  encarregadoId: string; // LGPD Art. 41 — DPO must exist before launch
}

export interface Department {
  slug: DepartmentSlug;
  nome: string;
  descricao: string;
  /** Departments this one waits on. The chain is document-gated and sequential. */
  dependeDe: DepartmentSlug[];
}

export interface User {
  id: string;
  firmId: string;
  nome: string;
  email: string;
  role: Role;
  /** Owners span every department; executors are scoped to exactly one. */
  departamentos: DepartmentSlug[];
  ativo: boolean;
  ultimoAcesso: string | null;
}

export interface Socio {
  nome: string;
  cpf: string;
  participacao: number; // percent
}

export interface Contato {
  nome: string;
  cargo: string;
  email: string;
  /** Document delay is the #1 bottleneck; WhatsApp is where requests land. */
  whatsapp: string | null;
}

export interface ContaBancaria {
  banco: string;
  agencia: string;
  conta: string;
  /** Connected via a licensed aggregator, never direct bank scraping. */
  openFinance: {
    conectado: boolean;
    consentimentoId: string | null;
    /** Consent is time-bound and revocable in one action. */
    expiraEm: string | null;
  };
}

export interface Client {
  id: string;
  firmId: string;
  razaoSocial: string;
  nomeFantasia: string;
  /** Accepts both legacy numeric and alphanumeric (live July 2026) formats. */
  cnpj: string;
  grupo: string | null;
  segmento: string;
  regime: RegimeTributario;
  honorarioMensal: number;
  ativo: boolean;
  desde: string;
  contatos: Contato[];
  socios: Socio[];
  contas: ContaBancaria[];
  /** Denormalised for list performance; derived from Task in a real backend. */
  responsaveis: Partial<Record<DepartmentSlug, string>>;
}

/** A monthly reference period. Competencia + client + department is the grain. */
export interface Competencia {
  id: string; // "2026-08"
  ano: number;
  mes: number;
  label: string; // "Agosto 2026"
  /** Closed periods are read-only. */
  encerrada: boolean;
}

export type TaskStatus =
  | "pendente"
  | "aguardando-cliente"
  | "em-andamento"
  | "em-revisao"
  | "concluida"
  | "atrasada";

export interface Task {
  id: string;
  firmId: string;
  clientId: string;
  departamento: DepartmentSlug;
  competenciaId: string;
  titulo: string;
  /** Exactly one owner, always. See the note at the top of this file. */
  assigneeId: string;
  status: TaskStatus;
  prazo: string;
  /** Set when the task is blocked on a document the client has not sent. */
  bloqueadaPorDocumento: string | null;
  concluidaEm: string | null;
}

/** Retention classes carry different legal clocks — see DECISIONS.md §3. */
export type RetentionClass =
  | "fiscal-5a"
  | "folha-10a"
  | "fgts-30a"
  | "contrato-indeterminado"
  | "rescisao-2a"
  | "consentimento";

export type DocumentKind =
  | "nfe"
  | "extrato"
  | "folha"
  | "guia-fgts"
  | "contrato"
  | "rescisao"
  | "atestado"
  | "declaracao";

export interface Document {
  id: string;
  firmId: string;
  clientId: string;
  competenciaId: string;
  nome: string;
  tipo: DocumentKind;
  departamento: DepartmentSlug;
  recebidoEm: string | null;
  solicitadoEm: string | null;
  /** Which channel the request went out on — WhatsApp, e-mail, portal. */
  canalSolicitacao: "whatsapp" | "email" | "portal" | null;
  retention: RetentionClass;
  /** LGPD Art. 5 II. Masked unless the viewer's department owns the record. */
  sensivel: boolean;
}

export type ProcuracaoStatus =
  | "ativa"
  | "pendente"
  | "expirada"
  | "nao-solicitada";

/**
 * SERPRO contracts are scoped to one e-CNPJ. Acting for a client requires that
 * client's electronic power of attorney first — a per-client onboarding step,
 * so it needs its own entity and its own screen.
 */
export interface Procuracao {
  id: string;
  firmId: string;
  clientId: string;
  status: ProcuracaoStatus;
  concedidaEm: string | null;
  expiraEm: string | null;
  servicos: string[];
}

export type IntegrationSlug =
  | "serpro"
  | "sefaz"
  | "dominio"
  | "open-finance"
  | "whatsapp";

export type IntegrationStatus = "conectada" | "atencao" | "erro" | "nao-configurada";

export interface IntegrationCredential {
  id: string;
  firmId: string;
  slug: IntegrationSlug;
  nome: string;
  descricao: string;
  status: IntegrationStatus;
  /** Certificate or API key expiry — what the hygiene agent watches. */
  expiraEm: string | null;
  ultimoSync: string | null;
  /** Direction matters: Dominio's public API is push-only. */
  direcao: "entrada" | "saida" | "bidirecional";
}

export type AuditAction =
  | "visualizou"
  | "exportou"
  | "editou"
  | "criou"
  | "removeu"
  | "rotacionou-credencial"
  | "alterou-papel";

export interface AuditEntry {
  id: string;
  firmId: string;
  userId: string;
  acao: AuditAction;
  entidade: string;
  entidadeId: string;
  /** Reads of sensitive fields are logged, not just writes. */
  sensivel: boolean;
  tela: string;
  em: string;
}

export type AgentSlug =
  | "acesso-anomalo"
  | "exfiltracao"
  | "credenciais"
  | "campos-sensiveis"
  | "superficie-externa"
  | "integridade-vendor";

export type FlagSeverity = "baixa" | "media" | "alta";

export interface SecurityFlag {
  id: string;
  firmId: string;
  agente: AgentSlug;
  severidade: FlagSeverity;
  titulo: string;
  detalhe: string;
  em: string;
  /** Anything touching personal data escalates to the encarregado, not an engineer. */
  escalarParaEncarregado: boolean;
  resolvida: boolean;
}

/** LGPD Art. 18 rights, handled as a queue rather than a policy PDF. */
export type DSARKind =
  | "acesso"
  | "correcao"
  | "anonimizacao"
  | "portabilidade"
  | "eliminacao"
  | "compartilhamento";

export interface DSARRequest {
  id: string;
  firmId: string;
  titular: string;
  clientId: string | null;
  tipo: DSARKind;
  recebidoEm: string;
  prazoResposta: string;
  status: "aberta" | "em-analise" | "respondida";
  /** Deletion often cannot be honoured — legal retention wins. */
  bloqueadaPorRetencao: boolean;
}

/** Phase 2/3 capabilities ship disabled and are switched on from Admin. */
export type ModuleSlug =
  | "auto-lancamento"
  | "portal-cliente"
  | "agentes"
  | "open-finance";

export interface ModuleState {
  slug: ModuleSlug;
  nome: string;
  fase: 2 | 3;
  descricao: string;
  habilitado: boolean;
}
