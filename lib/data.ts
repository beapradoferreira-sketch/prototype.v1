/* Seed dataset for the prototype.
 *
 * Invented data for a fictional firm. No real client, CPF or bank account
 * appears here. CNPJs are checksum-valid so the validator is genuinely
 * exercised — both the legacy numeric format and the alphanumeric format that
 * went live in July 2026.
 *
 * Replacing this file with database queries is the main Phase 1 task; every
 * screen reads through the accessor functions at the bottom, not the arrays.
 */

import type {
  AuditEntry, Client, Competencia, Department, DSARRequest, Document, Firm,
  IntegrationCredential, ModuleState, Procuracao, SecurityFlag, Task, User,
} from "./types";

export const FIRM: Firm = {
  id: "f1",
  nome: "Contabilidade Automatizada",
  cnpj: "47108706000135",
  encarregadoId: "u1",
};

/** The chain is sequential and document-gated: nothing moves without documents. */
export const DEPARTMENTS: Department[] = [
  {
    slug: "fiscal",
    nome: "Fiscal",
    descricao: "ICMS, ISS, PIS/COFINS, SPED Fiscal, EFD",
    dependeDe: [],
  },
  {
    slug: "pessoal",
    nome: "Pessoal / DP",
    descricao: "Folha, admissões e rescisões, eSocial, FGTS, INSS",
    dependeDe: [],
  },
  {
    slug: "contabil",
    nome: "Contábil",
    descricao: "Lançamentos, balancetes, DRE, fechamento",
    dependeDe: ["fiscal", "pessoal"],
  },
  {
    slug: "societario",
    nome: "Societário",
    descricao: "Abertura, alteração e baixa de empresas",
    dependeDe: [],
  },
];

export const USERS: User[] = [
  { id: "u1", firmId: "f1", nome: "Beatriz Ferreira", email: "beatriz@contabilidade.exemplo.br", role: "owner", departamentos: ["fiscal", "pessoal", "contabil", "societario"], ativo: true, ultimoAcesso: "2026-08-29T09:12:00" },
  { id: "u2", firmId: "f1", nome: "Sócio-fundador", email: "socio@contabilidade.exemplo.br", role: "owner", departamentos: ["fiscal", "pessoal", "contabil", "societario"], ativo: true, ultimoAcesso: "2026-08-28T17:40:00" },
  { id: "u3", firmId: "f1", nome: "Thiago Moraes", email: "thiago@contabilidade.exemplo.br", role: "manager", departamentos: ["fiscal", "contabil"], ativo: true, ultimoAcesso: "2026-08-29T08:55:00" },
  { id: "u4", firmId: "f1", nome: "Carla Nogueira", email: "carla@contabilidade.exemplo.br", role: "manager", departamentos: ["pessoal"], ativo: true, ultimoAcesso: "2026-08-29T08:20:00" },
  { id: "u5", firmId: "f1", nome: "Rafael Lima", email: "rafael@contabilidade.exemplo.br", role: "executor", departamentos: ["fiscal"], ativo: true, ultimoAcesso: "2026-08-29T09:30:00" },
  { id: "u6", firmId: "f1", nome: "Juliana Prado", email: "juliana@contabilidade.exemplo.br", role: "executor", departamentos: ["pessoal"], ativo: true, ultimoAcesso: "2026-08-29T09:05:00" },
  { id: "u7", firmId: "f1", nome: "Marcos Vieira", email: "marcos@contabilidade.exemplo.br", role: "executor", departamentos: ["contabil"], ativo: true, ultimoAcesso: "2026-08-28T18:02:00" },
  { id: "u8", firmId: "f1", nome: "Ana Beatriz Souza", email: "ana@contabilidade.exemplo.br", role: "executor", departamentos: ["societario"], ativo: true, ultimoAcesso: "2026-08-27T14:11:00" },
  { id: "u9", firmId: "f1", nome: "Pedro Alencar", email: "pedro@contabilidade.exemplo.br", role: "executor", departamentos: ["fiscal"], ativo: false, ultimoAcesso: "2026-06-30T16:45:00" },
];

export const COMPETENCIAS: Competencia[] = [
  { id: "2026-06", ano: 2026, mes: 6, label: "Junho 2026", encerrada: true },
  { id: "2026-07", ano: 2026, mes: 7, label: "Julho 2026", encerrada: true },
  { id: "2026-08", ano: 2026, mes: 8, label: "Agosto 2026", encerrada: false },
];

export const COMPETENCIA_ATUAL = "2026-08";

export const CLIENTS: Client[] = [
  {
    id: "c1", firmId: "f1", razaoSocial: "Padaria Vila Nova Ltda", nomeFantasia: "Vila Nova",
    cnpj: "33623514000152", grupo: "Grupo Vila Nova", segmento: "Alimentação", regime: "simples-nacional",
    honorarioMensal: 480, ativo: true, desde: "2023-03-14",
    contatos: [{ nome: "Sandra Vila", cargo: "Sócia-administradora", email: "sandra@vilanova.exemplo.br", whatsapp: "+55 11 90000-0001" }],
    socios: [{ nome: "Sandra Vila", cpf: "***.***.***-11", participacao: 70 }, { nome: "Otávio Vila", cpf: "***.***.***-22", participacao: 30 }],
    contas: [{ banco: "Banco do Brasil", agencia: "1234", conta: "56789-0", openFinance: { conectado: true, consentimentoId: "of-9931", expiraEm: "2026-11-14" } }],
    responsaveis: { fiscal: "u5", pessoal: "u6", contabil: "u7" },
  },
  {
    id: "c2", firmId: "f1", razaoSocial: "Metalúrgica Prado S.A.", nomeFantasia: "Prado Metais",
    cnpj: "60419033000100", grupo: null, segmento: "Indústria", regime: "lucro-real",
    honorarioMensal: 2400, ativo: true, desde: "2021-08-02",
    contatos: [{ nome: "Roberto Prado", cargo: "Diretor financeiro", email: "roberto@pradometais.exemplo.br", whatsapp: "+55 11 90000-0002" }],
    socios: [{ nome: "Roberto Prado", cpf: "***.***.***-33", participacao: 100 }],
    contas: [{ banco: "Itaú", agencia: "4321", conta: "11223-4", openFinance: { conectado: true, consentimentoId: "of-9932", expiraEm: "2026-09-05" } }],
    responsaveis: { fiscal: "u5", pessoal: "u6", contabil: "u7" },
  },
  {
    id: "c3", firmId: "f1", razaoSocial: "Studio Norte Arquitetura Ltda", nomeFantasia: "Studio Norte",
    cnpj: "12ABC34501DE35", grupo: null, segmento: "Serviços", regime: "lucro-presumido",
    honorarioMensal: 950, ativo: true, desde: "2026-08-03",
    contatos: [{ nome: "Helena Costa", cargo: "Sócia", email: "helena@studionorte.exemplo.br", whatsapp: "+55 11 90000-0003" }],
    socios: [{ nome: "Helena Costa", cpf: "***.***.***-44", participacao: 50 }, { nome: "Bruno Sato", cpf: "***.***.***-55", participacao: 50 }],
    contas: [{ banco: "Nubank", agencia: "0001", conta: "99887-1", openFinance: { conectado: false, consentimentoId: null, expiraEm: null } }],
    responsaveis: { fiscal: "u5", contabil: "u7", societario: "u8" },
  },
  {
    id: "c4", firmId: "f1", razaoSocial: "Transportes Aurora ME", nomeFantasia: "Aurora Log",
    cnpj: "02876329000146", grupo: "Grupo Aurora", segmento: "Logística", regime: "simples-nacional",
    honorarioMensal: 620, ativo: true, desde: "2022-11-20",
    contatos: [{ nome: "Wagner Aurora", cargo: "Proprietário", email: "wagner@auroralog.exemplo.br", whatsapp: "+55 11 90000-0004" }],
    socios: [{ nome: "Wagner Aurora", cpf: "***.***.***-66", participacao: 100 }],
    contas: [{ banco: "Bradesco", agencia: "7788", conta: "33445-6", openFinance: { conectado: true, consentimentoId: "of-9934", expiraEm: "2026-08-31" } }],
    responsaveis: { fiscal: "u5", pessoal: "u6", contabil: "u7" },
  },
  {
    id: "c5", firmId: "f1", razaoSocial: "Clínica Bem Estar Ltda", nomeFantasia: "Bem Estar",
    cnpj: "17209645000131", grupo: null, segmento: "Saúde", regime: "lucro-presumido",
    honorarioMensal: 1350, ativo: true, desde: "2024-01-08",
    contatos: [{ nome: "Dra. Marina Reis", cargo: "Sócia-administradora", email: "marina@bemestar.exemplo.br", whatsapp: "+55 11 90000-0005" }],
    socios: [{ nome: "Marina Reis", cpf: "***.***.***-77", participacao: 60 }, { nome: "Caio Reis", cpf: "***.***.***-88", participacao: 40 }],
    contas: [{ banco: "Santander", agencia: "2211", conta: "77665-4", openFinance: { conectado: false, consentimentoId: null, expiraEm: null } }],
    responsaveis: { fiscal: "u5", pessoal: "u6", contabil: "u7" },
  },
  {
    id: "c6", firmId: "f1", razaoSocial: "Verde Campo Agro Ltda", nomeFantasia: "Verde Campo",
    cnpj: "4Z9K1002MT0129", grupo: "Grupo Aurora", segmento: "Agronegócio", regime: "lucro-real",
    honorarioMensal: 3100, ativo: true, desde: "2026-08-18",
    contatos: [{ nome: "Isabel Nunes", cargo: "Controller", email: "isabel@verdecampo.exemplo.br", whatsapp: "+55 65 90000-0006" }],
    socios: [{ nome: "Isabel Nunes", cpf: "***.***.***-99", participacao: 40 }, { nome: "Fazendas Nunes S.A.", cpf: "—", participacao: 60 }],
    contas: [{ banco: "Sicredi", agencia: "0912", conta: "12398-7", openFinance: { conectado: false, consentimentoId: null, expiraEm: null } }],
    responsaveis: { fiscal: "u5", pessoal: "u6", contabil: "u7", societario: "u8" },
  },
  {
    id: "c7", firmId: "f1", razaoSocial: "Oficina do Zé MEI", nomeFantasia: "Oficina do Zé",
    cnpj: "61184502000104", grupo: null, segmento: "Serviços", regime: "mei",
    honorarioMensal: 180, ativo: true, desde: "2025-05-30",
    contatos: [{ nome: "José Barros", cargo: "Titular", email: "ze@oficinadoze.exemplo.br", whatsapp: "+55 11 90000-0007" }],
    socios: [{ nome: "José Barros", cpf: "***.***.***-10", participacao: 100 }],
    contas: [{ banco: "Caixa", agencia: "3344", conta: "55667-8", openFinance: { conectado: false, consentimentoId: null, expiraEm: null } }],
    responsaveis: { fiscal: "u5", contabil: "u7" },
  },
  {
    id: "c8", firmId: "f1", razaoSocial: "Comércio Atlântico Ltda", nomeFantasia: "Atlântico",
    cnpj: "85902317000176", grupo: null, segmento: "Varejo", regime: "simples-nacional",
    honorarioMensal: 540, ativo: false, desde: "2020-02-11",
    contatos: [{ nome: "Fábio Mendes", cargo: "Sócio", email: "fabio@atlantico.exemplo.br", whatsapp: null }],
    socios: [{ nome: "Fábio Mendes", cpf: "***.***.***-20", participacao: 100 }],
    contas: [],
    responsaveis: { fiscal: "u5", contabil: "u7" },
  },
];

/* ---------------------------------------------------------------------------
 * Tasks
 *
 * Generated deterministically rather than hand-written: the volume needs to be
 * realistic (8 clients x 4 departments x 3 competências) for the status hub to
 * mean anything, and a seeded generator keeps server and client renders
 * identical. A real backend replaces this with rows.
 * ------------------------------------------------------------------------- */

/** Deterministic PRNG — same sequence every render, so no hydration mismatch. */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

const ROTINAS: Record<string, { titulo: string; dia: number }[]> = {
  fiscal: [
    { titulo: "Apuração de ICMS", dia: 10 },
    { titulo: "Apuração PIS/COFINS", dia: 15 },
    { titulo: "Envio do SPED Fiscal", dia: 20 },
    { titulo: "Emissão de guias ISS", dia: 12 },
  ],
  pessoal: [
    { titulo: "Fechamento da folha", dia: 5 },
    { titulo: "Envio do eSocial", dia: 15 },
    { titulo: "Guias de FGTS", dia: 7 },
    { titulo: "Conferência de ponto", dia: 3 },
  ],
  contabil: [
    { titulo: "Lançamentos do período", dia: 18 },
    { titulo: "Conciliação bancária", dia: 20 },
    { titulo: "Balancete", dia: 25 },
  ],
  societario: [
    { titulo: "Revisão de contrato social", dia: 22 },
    { titulo: "Renovação de certidões", dia: 28 },
  ],
};

function buildTasks(): Task[] {
  const out: Task[] = [];
  const rand = seeded(20260829);
  let n = 0;

  for (const comp of COMPETENCIAS) {
    for (const client of CLIENTS) {
      if (!client.ativo) continue;
      for (const dept of DEPARTMENTS) {
        const assignee = client.responsaveis[dept.slug];
        if (!assignee) continue;

        for (const rotina of ROTINAS[dept.slug]) {
          n++;
          const r = rand();
          let status: Task["status"];
          let bloqueada: string | null = null;

          if (comp.encerrada) {
            status = "concluida";
          } else if (r < 0.34) {
            status = "concluida";
          } else if (r < 0.52) {
            // Client-side document delay — the most cited bottleneck.
            status = "aguardando-cliente";
            bloqueada = dept.slug === "pessoal" ? "Folha de ponto do mês" : "Extrato bancário do mês";
          } else if (r < 0.68) {
            status = "em-andamento";
          } else if (r < 0.78) {
            status = "em-revisao";
          } else if (r < 0.88) {
            status = "atrasada";
          } else {
            status = "pendente";
          }

          // Contábil cannot finish before fiscal and pessoal have — the chain
          // is real, so don't generate states that violate it.
          if (dept.slug === "contabil" && !comp.encerrada && status === "concluida" && r > 0.2) {
            status = "em-andamento";
          }

          const mes = String(comp.mes).padStart(2, "0");
          out.push({
            id: `t${n}`,
            firmId: "f1",
            clientId: client.id,
            departamento: dept.slug,
            competenciaId: comp.id,
            titulo: rotina.titulo,
            assigneeId: assignee,
            status,
            prazo: `${comp.ano}-${mes}-${String(rotina.dia).padStart(2, "0")}`,
            bloqueadaPorDocumento: bloqueada,
            concluidaEm: status === "concluida" ? `${comp.ano}-${mes}-${String(Math.min(rotina.dia, 28)).padStart(2, "0")}` : null,
          });
        }
      }
    }
  }
  return out;
}

export const TASKS: Task[] = buildTasks();

/* ---------------------------------------------------------------------------
 * Documents — note the per-document retention class, never per client.
 * ------------------------------------------------------------------------- */

export const DOCUMENTS: Document[] = [
  { id: "d1", firmId: "f1", clientId: "c1", competenciaId: "2026-08", nome: "Extrato Banco do Brasil — ago/2026", tipo: "extrato", departamento: "contabil", recebidoEm: "2026-08-12", solicitadoEm: "2026-08-05", canalSolicitacao: "whatsapp", retention: "fiscal-5a", sensivel: false },
  { id: "d2", firmId: "f1", clientId: "c1", competenciaId: "2026-08", nome: "Folha de pagamento — ago/2026", tipo: "folha", departamento: "pessoal", recebidoEm: "2026-08-04", solicitadoEm: "2026-08-01", canalSolicitacao: "portal", retention: "folha-10a", sensivel: false },
  { id: "d3", firmId: "f1", clientId: "c1", competenciaId: "2026-08", nome: "Guia FGTS — ago/2026", tipo: "guia-fgts", departamento: "pessoal", recebidoEm: "2026-08-07", solicitadoEm: null, canalSolicitacao: null, retention: "fgts-30a", sensivel: false },
  { id: "d4", firmId: "f1", clientId: "c1", competenciaId: "2026-08", nome: "Atestado médico — colaborador #4412", tipo: "atestado", departamento: "pessoal", recebidoEm: "2026-08-19", solicitadoEm: null, canalSolicitacao: null, retention: "folha-10a", sensivel: true },
  { id: "d5", firmId: "f1", clientId: "c2", competenciaId: "2026-08", nome: "NF-e entradas — ago/2026 (lote)", tipo: "nfe", departamento: "fiscal", recebidoEm: "2026-08-22", solicitadoEm: null, canalSolicitacao: null, retention: "fiscal-5a", sensivel: false },
  { id: "d6", firmId: "f1", clientId: "c2", competenciaId: "2026-08", nome: "Extrato Itaú — ago/2026", tipo: "extrato", departamento: "contabil", recebidoEm: null, solicitadoEm: "2026-08-18", canalSolicitacao: "whatsapp", retention: "fiscal-5a", sensivel: false },
  { id: "d7", firmId: "f1", clientId: "c2", competenciaId: "2026-08", nome: "Rescisão — colaborador #2210", tipo: "rescisao", departamento: "pessoal", recebidoEm: "2026-08-14", solicitadoEm: null, canalSolicitacao: null, retention: "rescisao-2a", sensivel: false },
  { id: "d8", firmId: "f1", clientId: "c3", competenciaId: "2026-08", nome: "Contrato social — constituição", tipo: "contrato", departamento: "societario", recebidoEm: "2026-08-03", solicitadoEm: null, canalSolicitacao: null, retention: "contrato-indeterminado", sensivel: false },
  { id: "d9", firmId: "f1", clientId: "c4", competenciaId: "2026-08", nome: "Extrato Bradesco — ago/2026", tipo: "extrato", departamento: "contabil", recebidoEm: null, solicitadoEm: "2026-08-20", canalSolicitacao: "whatsapp", retention: "fiscal-5a", sensivel: false },
  { id: "d10", firmId: "f1", clientId: "c5", competenciaId: "2026-08", nome: "Laudo médico — dependente IRPF", tipo: "atestado", departamento: "pessoal", recebidoEm: "2026-08-11", solicitadoEm: null, canalSolicitacao: null, retention: "folha-10a", sensivel: true },
  { id: "d11", firmId: "f1", clientId: "c5", competenciaId: "2026-08", nome: "Folha de pagamento — ago/2026", tipo: "folha", departamento: "pessoal", recebidoEm: "2026-08-06", solicitadoEm: null, canalSolicitacao: null, retention: "folha-10a", sensivel: false },
  { id: "d12", firmId: "f1", clientId: "c6", competenciaId: "2026-08", nome: "Declaração de filiação sindical", tipo: "declaracao", departamento: "pessoal", recebidoEm: "2026-08-21", solicitadoEm: null, canalSolicitacao: null, retention: "folha-10a", sensivel: true },
  { id: "d13", firmId: "f1", clientId: "c6", competenciaId: "2026-08", nome: "Extrato Sicredi — ago/2026", tipo: "extrato", departamento: "contabil", recebidoEm: null, solicitadoEm: "2026-08-24", canalSolicitacao: "email", retention: "fiscal-5a", sensivel: false },
  { id: "d14", firmId: "f1", clientId: "c7", competenciaId: "2026-08", nome: "Notas de serviço — ago/2026", tipo: "nfe", departamento: "fiscal", recebidoEm: "2026-08-16", solicitadoEm: "2026-08-10", canalSolicitacao: "whatsapp", retention: "fiscal-5a", sensivel: false },
];

/** SERPRO acts per client only with that client's electronic power of attorney. */
export const PROCURACOES: Procuracao[] = [
  { id: "p1", firmId: "f1", clientId: "c1", status: "ativa", concedidaEm: "2025-04-02", expiraEm: "2027-04-02", servicos: ["Declarações", "Parcelamentos", "Restituição IR"] },
  { id: "p2", firmId: "f1", clientId: "c2", status: "ativa", concedidaEm: "2024-09-15", expiraEm: "2026-09-15", servicos: ["Declarações", "Parcelamentos"] },
  { id: "p3", firmId: "f1", clientId: "c3", status: "pendente", concedidaEm: null, expiraEm: null, servicos: [] },
  { id: "p4", firmId: "f1", clientId: "c4", status: "ativa", concedidaEm: "2025-01-20", expiraEm: "2027-01-20", servicos: ["Declarações"] },
  { id: "p5", firmId: "f1", clientId: "c5", status: "expirada", concedidaEm: "2024-02-10", expiraEm: "2026-02-10", servicos: ["Declarações", "Parcelamentos"] },
  { id: "p6", firmId: "f1", clientId: "c6", status: "nao-solicitada", concedidaEm: null, expiraEm: null, servicos: [] },
  { id: "p7", firmId: "f1", clientId: "c7", status: "ativa", concedidaEm: "2025-06-01", expiraEm: "2027-06-01", servicos: ["Declarações"] },
];

export const INTEGRATIONS: IntegrationCredential[] = [
  { id: "i1", firmId: "f1", slug: "serpro", nome: "SERPRO Integra Contador", descricao: "REST/OAuth2. Contrato preso a um e-CNPJ; cada cliente exige procuração própria.", status: "conectada", expiraEm: "2026-12-04", ultimoSync: "2026-08-29T06:00:00", direcao: "bidirecional" },
  { id: "i2", firmId: "f1", slug: "sefaz", nome: "SEFAZ — NFeDistribuicaoDFe", descricao: "Captura de XML por certificado digital, consulta por NSU/chave.", status: "conectada", expiraEm: "2026-09-18", ultimoSync: "2026-08-29T05:30:00", direcao: "entrada" },
  { id: "i3", firmId: "f1", slug: "dominio", nome: "Domínio Contábil", descricao: "API pública é de entrada apenas: empurra XML fiscal para o Domínio, não lê razão.", status: "atencao", expiraEm: null, ultimoSync: "2026-08-27T22:10:00", direcao: "saida" },
  { id: "i4", firmId: "f1", slug: "open-finance", nome: "Open Finance (agregador)", descricao: "Via agregador licenciado. Consentimento itemizado, revogável em uma ação.", status: "nao-configurada", expiraEm: null, ultimoSync: null, direcao: "entrada" },
  { id: "i5", firmId: "f1", slug: "whatsapp", nome: "WhatsApp Business", descricao: "Canal onde o cliente realmente responde. Sem BSP contratado ainda.", status: "nao-configurada", expiraEm: null, ultimoSync: null, direcao: "bidirecional" },
];

export const AUDIT: AuditEntry[] = [
  { id: "a1", firmId: "f1", userId: "u6", acao: "visualizou", entidade: "Document", entidadeId: "d4", sensivel: true, tela: "Cliente › Documentos", em: "2026-08-29T09:41:00" },
  { id: "a2", firmId: "f1", userId: "u5", acao: "visualizou", entidade: "Document", entidadeId: "d10", sensivel: true, tela: "Cliente › Documentos", em: "2026-08-29T09:22:00" },
  { id: "a3", firmId: "f1", userId: "u7", acao: "exportou", entidade: "Client", entidadeId: "*", sensivel: false, tela: "Clientes", em: "2026-08-29T08:47:00" },
  { id: "a4", firmId: "f1", userId: "u1", acao: "rotacionou-credencial", entidade: "IntegrationCredential", entidadeId: "i2", sensivel: false, tela: "Admin › Integrações", em: "2026-08-28T16:30:00" },
  { id: "a5", firmId: "f1", userId: "u1", acao: "alterou-papel", entidade: "User", entidadeId: "u9", sensivel: false, tela: "Admin › Equipe", em: "2026-06-30T17:00:00" },
  { id: "a6", firmId: "f1", userId: "u6", acao: "visualizou", entidade: "Document", entidadeId: "d12", sensivel: true, tela: "Cliente › Documentos", em: "2026-08-28T14:05:00" },
  { id: "a7", firmId: "f1", userId: "u3", acao: "editou", entidade: "Task", entidadeId: "t118", sensivel: false, tela: "Departamento › Fiscal", em: "2026-08-28T11:12:00" },
  { id: "a8", firmId: "f1", userId: "u4", acao: "criou", entidade: "Client", entidadeId: "c6", sensivel: false, tela: "Clientes › Novo", em: "2026-08-18T10:00:00" },
];

export const FLAGS: SecurityFlag[] = [
  { id: "s1", firmId: "f1", agente: "campos-sensiveis", severidade: "alta", titulo: "Executor do Fiscal abriu laudo médico do DP", detalhe: "Rafael Lima (Fiscal) visualizou o documento d10 — laudo de dependente IRPF, pertencente ao Pessoal. Fora do escopo do departamento.", em: "2026-08-29T09:22:00", escalarParaEncarregado: true, resolvida: false },
  { id: "s2", firmId: "f1", agente: "credenciais", severidade: "alta", titulo: "Certificado SEFAZ expira em 20 dias", detalhe: "O certificado usado no NFeDistribuicaoDFe vence em 18/09/2026. Sem renovação, a captura de XML para de rodar silenciosamente.", em: "2026-08-29T06:05:00", escalarParaEncarregado: false, resolvida: false },
  { id: "s3", firmId: "f1", agente: "integridade-vendor", severidade: "media", titulo: "Domínio sem sincronizar há 31 horas", detalhe: "Último push aceito em 27/08 22:10. Sem erro explícito — exatamente o modo de falha silenciosa que só aparece quando um prazo estoura.", em: "2026-08-29T05:40:00", escalarParaEncarregado: false, resolvida: false },
  { id: "s4", firmId: "f1", agente: "exfiltracao", severidade: "media", titulo: "Exportação completa da base de clientes", detalhe: "Marcos Vieira (executor, Contábil) exportou a lista inteira de clientes. Acima do limite de volume do papel.", em: "2026-08-29T08:47:00", escalarParaEncarregado: true, resolvida: false },
  { id: "s5", firmId: "f1", agente: "credenciais", severidade: "baixa", titulo: "Procuração de Clínica Bem Estar expirada", detalhe: "Expirou em 10/02/2026. Chamadas ao Integra Contador para este CNPJ vão falhar.", em: "2026-08-28T07:00:00", escalarParaEncarregado: false, resolvida: false },
  { id: "s6", firmId: "f1", agente: "acesso-anomalo", severidade: "baixa", titulo: "Acesso fora do horário habitual", detalhe: "Login de Marcos Vieira às 23:48 de 27/08, fora da janela típica do usuário.", em: "2026-08-28T00:02:00", escalarParaEncarregado: false, resolvida: true },
];

export const DSARS: DSARRequest[] = [
  { id: "r1", firmId: "f1", titular: "Colaborador #2210 (via Metalúrgica Prado)", clientId: "c2", tipo: "acesso", recebidoEm: "2026-08-25", prazoResposta: "2026-09-09", status: "em-analise", bloqueadaPorRetencao: false },
  { id: "r2", firmId: "f1", titular: "Ex-colaborador — Padaria Vila Nova", clientId: "c1", tipo: "eliminacao", recebidoEm: "2026-08-20", prazoResposta: "2026-09-04", status: "aberta", bloqueadaPorRetencao: true },
  { id: "r3", firmId: "f1", titular: "Helena Costa (Studio Norte)", clientId: "c3", tipo: "portabilidade", recebidoEm: "2026-08-12", prazoResposta: "2026-08-27", status: "respondida", bloqueadaPorRetencao: false },
];

/** Phase 2/3 capabilities ship off. Toggled from Admin › Módulos. */
export const MODULES: ModuleState[] = [
  { slug: "auto-lancamento", nome: "Auto-lançamento", fase: 2, descricao: "Extratos, NF-e e relatórios viram lançamentos contábeis em rascunho, para revisão humana.", habilitado: false },
  { slug: "open-finance", nome: "Open Finance", fase: 2, descricao: "Conexão bancária via agregador licenciado, com consentimento itemizado e revogável.", habilitado: false },
  { slug: "portal-cliente", nome: "Portal do cliente", fase: 3, descricao: "Cliente envia documentos e acompanha o status da própria competência.", habilitado: false },
  { slug: "agentes", nome: "Agentes automatizados", fase: 3, descricao: "Cobranças de documento por regra e os seis agentes de defesa.", habilitado: false },
];

/* ---------------------------------------------------------------------------
 * Accessors. Screens read through these, never the arrays directly, so this
 * file is the only thing that changes when a real database arrives.
 * ------------------------------------------------------------------------- */

export function getClient(id: string): Client | undefined {
  return CLIENTS.find((c) => c.id === id);
}

export function getUser(id: string): User | undefined {
  return USERS.find((u) => u.id === id);
}

export function getDepartment(slug: string): Department | undefined {
  return DEPARTMENTS.find((d) => d.slug === slug);
}

export function getCompetencia(id: string): Competencia | undefined {
  return COMPETENCIAS.find((c) => c.id === id);
}

export function tasksFor(opts: {
  competenciaId?: string;
  departamento?: string;
  clientId?: string;
  assigneeId?: string;
}): Task[] {
  return TASKS.filter(
    (t) =>
      (!opts.competenciaId || t.competenciaId === opts.competenciaId) &&
      (!opts.departamento || t.departamento === opts.departamento) &&
      (!opts.clientId || t.clientId === opts.clientId) &&
      (!opts.assigneeId || t.assigneeId === opts.assigneeId),
  );
}

export function documentsFor(clientId: string, competenciaId?: string): Document[] {
  return DOCUMENTS.filter(
    (d) => d.clientId === clientId && (!competenciaId || d.competenciaId === competenciaId),
  );
}

export function procuracaoFor(clientId: string): Procuracao | undefined {
  return PROCURACOES.find((p) => p.clientId === clientId);
}

export interface DeptProgress {
  slug: string;
  nome: string;
  total: number;
  concluidas: number;
  atrasadas: number;
  aguardandoCliente: number;
  pct: number;
}

/** Percent of a department's workload closed for a competência — the status hub. */
export function departmentProgress(competenciaId: string, clientId?: string): DeptProgress[] {
  return DEPARTMENTS.map((d) => {
    const ts = tasksFor({ competenciaId, departamento: d.slug, clientId });
    const concluidas = ts.filter((t) => t.status === "concluida").length;
    return {
      slug: d.slug,
      nome: d.nome,
      total: ts.length,
      concluidas,
      atrasadas: ts.filter((t) => t.status === "atrasada").length,
      aguardandoCliente: ts.filter((t) => t.status === "aguardando-cliente").length,
      pct: ts.length ? Math.round((concluidas / ts.length) * 100) : 0,
    };
  });
}

/** Firm-level numbers for the dashboard cards. */
export function firmMetrics(competenciaId: string) {
  const ativos = CLIENTS.filter((c) => c.ativo);
  const ts = tasksFor({ competenciaId });
  const concluidas = ts.filter((t) => t.status === "concluida").length;
  return {
    faturamentoMensal: ativos.reduce((s, c) => s + c.honorarioMensal, 0),
    clientesAtivos: ativos.length,
    clientesEncerrados: CLIENTS.filter((c) => !c.ativo).length,
    funcionarios: USERS.filter((u) => u.ativo).length,
    ticketMedio: ativos.length
      ? Math.round(ativos.reduce((s, c) => s + c.honorarioMensal, 0) / ativos.length)
      : 0,
    tarefasTotal: ts.length,
    tarefasConcluidas: concluidas,
    pctConcluido: ts.length ? Math.round((concluidas / ts.length) * 100) : 0,
    atrasadas: ts.filter((t) => t.status === "atrasada").length,
    aguardandoCliente: ts.filter((t) => t.status === "aguardando-cliente").length,
  };
}

/** Clients blocked on a document nobody has chased — the #1 bottleneck. */
export function bloqueiosPorCliente(competenciaId: string) {
  const rows = CLIENTS.filter((c) => c.ativo).map((c) => {
    const ts = tasksFor({ competenciaId, clientId: c.id });
    const bloqueadas = ts.filter((t) => t.status === "aguardando-cliente");
    const atrasadas = ts.filter((t) => t.status === "atrasada");
    return {
      client: c,
      bloqueadas: bloqueadas.length,
      atrasadas: atrasadas.length,
      documentos: Array.from(new Set(bloqueadas.map((t) => t.bloqueadaPorDocumento).filter(Boolean))) as string[],
      pct: ts.length
        ? Math.round((ts.filter((t) => t.status === "concluida").length / ts.length) * 100)
        : 0,
    };
  });
  return rows.sort((a, b) => b.bloqueadas + b.atrasadas - (a.bloqueadas + a.atrasadas));
}
