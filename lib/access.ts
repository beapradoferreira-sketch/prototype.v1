/* Regras de acesso e mascaramento LGPD.
 *
 * A regra da especificação: um executor do Fiscal não tem motivo legítimo para
 * ver o atestado médico de um colega que aparece pelo DP. Campos sensíveis são
 * mascarados a menos que o departamento de quem está vendo seja o dono do dado,
 * e toda visualização ou exportação de campo sensível vai para o log — leituras,
 * não apenas escritas.
 *
 * No protótipo a "sessão" vem do seletor de papel, e não de autenticação, mas
 * toda tela passa por estes helpers: ligar sessões reais depois significa mudar
 * de onde vem o `viewer`, e nada além disso.
 */

import type { DepartmentSlug, Document, Role, User } from "./types";

export interface Viewer {
  user: User;
  role: Role;
  departamentos: DepartmentSlug[];
}

/** Diretoria e gestor enxergam de forma transversal; executor fica no seu departamento. */
export function canSeeAllDepartments(role: Role): boolean {
  return role === "owner" || role === "manager";
}

export function visibleDepartments(viewer: Viewer): DepartmentSlug[] {
  if (viewer.role === "owner") return ["fiscal", "pessoal", "contabil", "societario"];
  return viewer.departamentos;
}

export function canAccessDepartment(viewer: Viewer, slug: DepartmentSlug): boolean {
  return visibleDepartments(viewer).includes(slug);
}

/** O Admin é um quarto nível acima de gestor/executor — a superfície da diretoria. */
export function canAccessAdmin(viewer: Viewer): boolean {
  return viewer.role === "owner";
}

export function canExportBulk(viewer: Viewer): boolean {
  return viewer.role === "owner" || viewer.role === "manager";
}

/**
 * Se um documento sensível pode ser lido por quem está vendo.
 * Documento não sensível é legível por qualquer pessoa do escritório; sensível,
 * só pelo departamento dono (e pela diretoria, que acumula o papel de DPO).
 */
export function canReadDocument(viewer: Viewer, doc: Document): boolean {
  if (!doc.sensivel) return true;
  if (viewer.role === "owner") return true;
  return viewer.departamentos.includes(doc.departamento);
}

export interface MaskedDocument extends Document {
  masked: boolean;
  /** Exibido no lugar do nome quando mascarado, para a linha continuar existindo. */
  displayName: string;
}

export function maskDocuments(viewer: Viewer, docs: Document[]): MaskedDocument[] {
  return docs.map((d) => {
    const allowed = canReadDocument(viewer, d);
    return {
      ...d,
      masked: !allowed,
      // A existência do registro não é escondida — só o conteúdo. Ocultar a
      // linha inteira faria o arquivo parecer incompleto para quem o trabalha.
      displayName: allowed ? d.nome : "Documento sensível — restrito ao departamento",
    };
  });
}

export const ROLE_LABEL: Record<Role, string> = {
  owner: "Diretoria",
  manager: "Gestor",
  executor: "Executor",
};

export const ROLE_DESCRIPTION: Record<Role, string> = {
  owner: "Vê tudo, configura integrações, papéis e módulos.",
  manager: "Vê todos os departamentos que gerencia, sem acesso ao painel administrativo.",
  executor: "Vê apenas o próprio departamento e as próprias tarefas.",
};
