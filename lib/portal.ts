/* Visão do cliente.
 *
 * O portal é um público diferente, não a mesma tela com menos coisa. Um
 * cliente enxerga a própria competência e nada além dela, então o recorte é
 * feito aqui e não na interface — tela não deve ser o lugar onde se decide o
 * que vaza.
 *
 * O que o cliente NÃO vê, por decisão explícita:
 *  - qualquer outro cliente, em qualquer agregado;
 *  - nome de quem executa a tarefa dentro do escritório: é organização interna
 *    e vira cobrança pessoal se exposta;
 *  - o detalhe das tarefas internas — ele vê o que depende dele e o quanto do
 *    mês fechou, não a fila de trabalho do escritório;
 *  - conteúdo de documento sensível (saúde, filiação sindical). Mesmo sendo o
 *    empregador, o portal não é o canal certo para dado de saúde de
 *    colaborador; quem precisa disso pede pelo canal próprio.
 */

import {
  COMPETENCIA_ATUAL, DEPARTMENTS, documentsFor, getClient, getCompetencia,
  procuracaoFor, tasksFor,
} from "./data";
import type { Client, Competencia, ContaBancaria, Document, Procuracao } from "./types";

export interface PortalDepartamento {
  nome: string;
  /** Percentual do mês fechado neste departamento. Sem nomes, sem tarefas. */
  pct: number;
  /** Quantas frentes estão paradas esperando algo do cliente. */
  aguardandoCliente: number;
}

export interface PortalView {
  client: Client;
  competencia: Competencia;
  pctGeral: number;
  /** O que o escritório está esperando dele — a única lista acionável aqui. */
  pendencias: Document[];
  recebidos: Document[];
  /** Documentos sensíveis existem, mas só como contagem: nunca conteúdo. */
  sensiveisOcultos: number;
  departamentos: PortalDepartamento[];
  procuracao: Procuracao | undefined;
  contas: ContaBancaria[];
}

export function buildPortalView(
  clientId: string,
  competenciaId: string = COMPETENCIA_ATUAL,
): PortalView | null {
  const client = getClient(clientId);
  const competencia = getCompetencia(competenciaId);
  if (!client || !competencia) return null;

  const docs = documentsFor(client.id, competenciaId);
  const visiveis = docs.filter((d) => !d.sensivel);

  const tarefas = tasksFor({ competenciaId, clientId: client.id });
  const concluidas = tarefas.filter((t) => t.status === "concluida").length;

  const departamentos: PortalDepartamento[] = DEPARTMENTS.map((d) => {
    const ts = tarefas.filter((t) => t.departamento === d.slug);
    return {
      nome: d.nome,
      pct: ts.length ? Math.round((ts.filter((t) => t.status === "concluida").length / ts.length) * 100) : 0,
      aguardandoCliente: ts.filter((t) => t.status === "aguardando-cliente").length,
    };
  }).filter((d) => d.pct > 0 || d.aguardandoCliente > 0 || tarefas.length === 0);

  return {
    client,
    competencia,
    pctGeral: tarefas.length ? Math.round((concluidas / tarefas.length) * 100) : 0,
    pendencias: visiveis.filter((d) => !d.recebidoEm),
    recebidos: visiveis.filter((d) => !!d.recebidoEm),
    sensiveisOcultos: docs.filter((d) => d.sensivel).length,
    departamentos,
    procuracao: procuracaoFor(client.id),
    contas: client.contas,
  };
}

/** Tarefas paradas esperando documento — usado para o texto de cobrança. */
export function pendenciasDeTarefa(clientId: string, competenciaId = COMPETENCIA_ATUAL): string[] {
  const travadas = tasksFor({ competenciaId, clientId })
    .filter((t) => t.status === "aguardando-cliente" && t.bloqueadaPorDocumento)
    .map((t) => t.bloqueadaPorDocumento as string);
  return Array.from(new Set(travadas));
}

/** Garante que nenhum documento sensível saia daqui, mesmo se a chamada errar. */
export function assertSemSensiveis(docs: Document[]): Document[] {
  return docs.filter((d) => !d.sensivel);
}
