"use client";

/* Admin 01 — Team & roles. Offboarding is the gap the access-anomaly agent
 * exists to catch, so deactivation is the primary action, not an edit form. */

import { Badge, Callout, PageHeader, Table, Td, dateTime } from "@/components/ui";
import { ROLE_LABEL } from "@/lib/access";
import { CLIENTS, DEPARTMENTS, USERS } from "@/lib/data";

export default function EquipePage() {
  const inativos = USERS.filter((u) => !u.ativo);

  return (
    <>
      <PageHeader
        title="Equipe e papéis"
        note="Convite, papel, departamento e desligamento. Reatribuir a carteira de quem sai é parte do desligamento, não um passo separado."
      />

      {inativos.length > 0 && (
        <div className="mb-5">
          <Callout label="Contas desativadas com carteira" tone="gold">
            <p>
              {inativos.map((u) => u.nome).join(", ")} está inativo mas ainda aparece como
              responsável em tarefas de competências anteriores. O histórico preserva quem
              fez o quê — o que precisa ser reatribuído é a carteira futura.
            </p>
          </Callout>
        </div>
      )}

      <Table head={["Pessoa", "Papel", "Departamentos", "Clientes", "Último acesso", "Situação"]}>
        {USERS.map((u) => {
          const carteira = CLIENTS.filter((c) =>
            Object.values(c.responsaveis).includes(u.id),
          ).length;
          return (
            <tr key={u.id}>
              <Td>
                <span className="font-semibold text-ink">{u.nome}</span>
                <p className="mt-0.5 break-all text-[11px] text-ink-3">{u.email}</p>
              </Td>
              <Td>
                <Badge tone={u.role === "owner" ? "navy" : "neutral"}>{ROLE_LABEL[u.role]}</Badge>
              </Td>
              <Td>
                {u.departamentos.length === DEPARTMENTS.length
                  ? "Todos"
                  : u.departamentos.map((d) => DEPARTMENTS.find((x) => x.slug === d)?.nome).join(", ")}
              </Td>
              <Td className="tabular-nums">{carteira || "—"}</Td>
              <Td className="tabular-nums text-xs">{dateTime(u.ultimoAcesso)}</Td>
              <Td>
                {u.ativo ? <Badge tone="green">ativo</Badge> : <Badge tone="red">desativado</Badge>}
              </Td>
            </tr>
          );
        })}
      </Table>
    </>
  );
}
