/* Rótulos de exibição, em português do Brasil.
 *
 * Slugs internos ("nao-configurada", "em-analise", "contabil") nunca vão
 * direto para a tela: trocar hífen por espaço produz português quebrado, sem
 * acento e sem caixa correta. Todo texto visível sai daqui, então acento e
 * grafia ficam num lugar só.
 */

import type {
  AgentSlug, AuditAction, DepartmentSlug, DocumentKind, DSARKind, FlagSeverity,
  IntegrationStatus, ProcuracaoStatus, RegimeTributario, RetentionClass,
  TaskStatus,
} from "./types";

export const DEPARTAMENTO_LABEL: Record<DepartmentSlug, string> = {
  fiscal: "Fiscal",
  pessoal: "Pessoal / DP",
  contabil: "Contábil",
  societario: "Societário",
};

export const REGIME_LABEL: Record<RegimeTributario, string> = {
  "simples-nacional": "Simples Nacional",
  "lucro-presumido": "Lucro Presumido",
  "lucro-real": "Lucro Real",
  mei: "MEI",
};

export const TAREFA_STATUS_LABEL: Record<TaskStatus, string> = {
  pendente: "Pendente",
  "aguardando-cliente": "Aguardando cliente",
  "em-andamento": "Em andamento",
  "em-revisao": "Em revisão",
  concluida: "Concluída",
  atrasada: "Atrasada",
};

export const INTEGRACAO_STATUS_LABEL: Record<IntegrationStatus, string> = {
  conectada: "Conectada",
  atencao: "Atenção",
  erro: "Erro",
  "nao-configurada": "Não configurada",
};

export const PROCURACAO_STATUS_LABEL: Record<ProcuracaoStatus, string> = {
  ativa: "Ativa",
  pendente: "Pendente",
  expirada: "Expirada",
  "nao-solicitada": "Não solicitada",
};

export const SEVERIDADE_LABEL: Record<FlagSeverity, string> = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
};

export const DSAR_STATUS_LABEL: Record<"aberta" | "em-analise" | "respondida", string> = {
  aberta: "Aberta",
  "em-analise": "Em análise",
  respondida: "Respondida",
};

export const DSAR_TIPO_LABEL: Record<DSARKind, string> = {
  acesso: "Acesso",
  correcao: "Correção",
  anonimizacao: "Anonimização",
  portabilidade: "Portabilidade",
  eliminacao: "Eliminação",
  compartilhamento: "Compartilhamento",
};

export const ACAO_LABEL: Record<AuditAction, string> = {
  visualizou: "Visualizou",
  exportou: "Exportou",
  editou: "Editou",
  criou: "Criou",
  removeu: "Removeu",
  "rotacionou-credencial": "Rotacionou credencial",
  "alterou-papel": "Alterou papel",
};

export const CANAL_LABEL: Record<"whatsapp" | "email" | "portal", string> = {
  whatsapp: "WhatsApp",
  email: "E-mail",
  portal: "Portal",
};

export const AGENTE_LABEL: Record<AgentSlug, string> = {
  "acesso-anomalo": "Acesso anômalo",
  exfiltracao: "Exfiltração",
  credenciais: "Credenciais e procurações",
  "campos-sensiveis": "Campos sensíveis",
  "superficie-externa": "Superfície externa",
  "integridade-vendor": "Integridade de fornecedor",
};

export const RETENCAO_LABEL: Record<RetentionClass, string> = {
  "fiscal-5a": "Fiscal — 5 anos (CTN 173–174)",
  "folha-10a": "Folha — 10 anos (Dec. 3.048/1999)",
  "fgts-30a": "FGTS — 30 anos",
  "contrato-indeterminado": "Contrato — indeterminado",
  "rescisao-2a": "Rescisão — 2 anos",
  consentimento: "Consentimento — enquanto vigente",
};

export const DOCUMENTO_TIPO_LABEL: Record<DocumentKind, string> = {
  nfe: "NF-e",
  extrato: "Extrato bancário",
  folha: "Folha de pagamento",
  "guia-fgts": "Guia de FGTS",
  contrato: "Contrato",
  rescisao: "Rescisão",
  atestado: "Atestado",
  declaracao: "Declaração",
};

export const DIRECAO_LABEL: Record<"entrada" | "saida" | "bidirecional", string> = {
  entrada: "Entrada — lemos deles",
  saida: "Saída — empurramos para eles",
  bidirecional: "Bidirecional",
};
