/* Modelo de entidades.
 *
 * A especificação listava "nenhum schema existe ainda" como impeditivo para a
 * Fase 1. Este é o schema. Três formatos aqui carregam regra de negócio:
 *
 *  - Competencia é entidade, não um campo de data em Task. O negócio roda em
 *    períodos mensais de referência, e a central de status precisa perguntar
 *    "estado deste mês, deste cliente, neste departamento" como consulta direta.
 *  - Retenção é etiquetada por Document. Um arquivo de cliente legitimamente
 *    mistura obrigações de 5 anos (fiscal), 10 (folha) e 30 (FGTS); uma regra de
 *    expurgo por cliente apagaria ou reteria algo ilegalmente.
 *  - Task.assigneeId é singular e obrigatório. Responsabilidade difusa é o modo
 *    de falha apontado pela pesquisa; posse compartilhada fica irrepresentável.
 *
 * Tudo é escopado por firmId mesmo o protótipo rodando um único escritório,
 * para que o formato (B) — SaaS multi-inquilino — seja mudança de consulta e
 * não migração.
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
  /** Departamentos de que este depende. A cadeia é sequencial e travada por documento. */
  dependeDe: DepartmentSlug[];
}

export interface User {
  id: string;
  firmId: string;
  nome: string;
  email: string;
  role: Role;
  /** Diretoria abrange todos os departamentos; executor fica restrito a um. */
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
  /** Atraso de documento é o gargalo nº 1; o WhatsApp é onde o pedido chega. */
  whatsapp: string | null;
}

export interface ContaBancaria {
  banco: string;
  agencia: string;
  conta: string;
  /** Conectado por agregador licenciado, nunca raspagem direta de banco. */
  openFinance: {
    conectado: boolean;
    consentimentoId: string | null;
    /** Consentimento tem prazo e é revogável em uma única ação. */
    expiraEm: string | null;
  };
}

export interface Client {
  id: string;
  firmId: string;
  razaoSocial: string;
  nomeFantasia: string;
  /** Aceita o formato numérico clássico e o alfanumérico (vigente desde jul/2026). */
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
  /** Desnormalizado para a listagem; derivado de Task num backend real. */
  responsaveis: Partial<Record<DepartmentSlug, string>>;
}

/** Período mensal de referência. Competência + cliente + departamento é a granularidade. */
export interface Competencia {
  id: string; // "2026-08"
  ano: number;
  mes: number;
  label: string; // "Agosto 2026"
  /** Competência encerrada é somente leitura. */
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
  /** Exatamente um responsável, sempre. Ver a nota no topo do arquivo. */
  assigneeId: string;
  status: TaskStatus;
  prazo: string;
  /** Preenchido quando a tarefa trava em documento que o cliente não enviou. */
  bloqueadaPorDocumento: string | null;
  concluidaEm: string | null;
}

/** Classes de retenção têm relógios legais distintos — ver DECISOES.md §3. */
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
  /** Por qual canal a solicitação saiu — WhatsApp, e-mail, portal. */
  canalSolicitacao: "whatsapp" | "email" | "portal" | null;
  retention: RetentionClass;
  /** LGPD Art. 5º, II. Mascarado a menos que o departamento de quem vê seja o dono. */
  sensivel: boolean;
}

export type ProcuracaoStatus =
  | "ativa"
  | "pendente"
  | "expirada"
  | "nao-solicitada";

/**
 * O contrato SERPRO é preso a um único e-CNPJ. Agir em nome de um cliente exige
 * antes a procuração eletrônica daquele cliente — um passo de onboarding por
 * cliente, e por isso com entidade e tela próprias.
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
  /** Vencimento de certificado ou chave — o que o agente de higiene observa. */
  expiraEm: string | null;
  ultimoSync: string | null;
  /** Direção importa: a API pública do Domínio só aceita entrada. */
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
  /** Leitura de campo sensível também vai para o log, não só escrita. */
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
  /** O que toca dado pessoal escala para o encarregado, não para um engenheiro. */
  escalarParaEncarregado: boolean;
  resolvida: boolean;
}

/** Direitos do Art. 18 da LGPD, tratados como fila e não como PDF de política. */
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
  /** Eliminação muitas vezes não pode ser atendida — a retenção legal prevalece. */
  bloqueadaPorRetencao: boolean;
}

/** Capacidades de Fase 2/3 chegam desligadas e são ligadas no Admin. */
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
