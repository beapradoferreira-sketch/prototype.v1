/* Access rules and LGPD masking.
 *
 * The brief's rule: an executor in Fiscal has no legitimate reason to see a
 * colleague's atestado médico surfaced through DP. Sensitive fields are masked
 * unless the viewing role's department owns the data, and every view or export
 * of a sensitive field is logged — reads, not just writes.
 *
 * In the prototype the "session" comes from the role switcher rather than auth,
 * but every screen goes through these helpers, so wiring real sessions later
 * means changing where `viewer` comes from and nothing else.
 */

import type { DepartmentSlug, Document, Role, User } from "./types";

export interface Viewer {
  user: User;
  role: Role;
  departamentos: DepartmentSlug[];
}

/** Owners and managers see across; executors are scoped to their department. */
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

/** Admin is a fourth tier above manager/executor — the owners' surface. */
export function canAccessAdmin(viewer: Viewer): boolean {
  return viewer.role === "owner";
}

export function canExportBulk(viewer: Viewer): boolean {
  return viewer.role === "owner" || viewer.role === "manager";
}

/**
 * Whether a sensitive document is readable by this viewer.
 * Non-sensitive documents are readable by anyone in the firm; sensitive ones
 * only by the department that owns them (plus owners, who carry the DPO role).
 */
export function canReadDocument(viewer: Viewer, doc: Document): boolean {
  if (!doc.sensivel) return true;
  if (viewer.role === "owner") return true;
  return viewer.departamentos.includes(doc.departamento);
}

export interface MaskedDocument extends Document {
  masked: boolean;
  /** Shown in place of the name when masked, so the row still exists. */
  displayName: string;
}

export function maskDocuments(viewer: Viewer, docs: Document[]): MaskedDocument[] {
  return docs.map((d) => {
    const allowed = canReadDocument(viewer, d);
    return {
      ...d,
      masked: !allowed,
      // The record's existence is not hidden — only its content. Hiding the row
      // entirely would make the file look incomplete to whoever is working it.
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
