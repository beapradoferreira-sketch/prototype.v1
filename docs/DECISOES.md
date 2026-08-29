# Decisões sobre as questões em aberto da especificação

A especificação deixou várias coisas explicitamente em aberto e listou seis
delas como impeditivas para um build de Fase 1. Não dá para construir um
protótipo sem resolvê-las, então cada uma está decidida abaixo. São julgamentos,
não instruções recebidas — todas são baratas de reverter, e o raciocínio está
registrado para poder ser contestado.

---

## 1. Qual formato de produto — A, B ou C?

**Decidido: A, a plataforma interna de operações.**

A própria especificação recomenda A, e é o único formato sem problema de partida
a frio: o escritório é o seu primeiro usuário. O modelo de dados abaixo já é
escopado por `firmId`, então virar B (SaaS multi-inquilino) depois é acrescentar
um filtro de consulta, não reescrever.

## 2. Stack técnica — a especificação diz que é decisão de quem constrói

**Decidido: Next.js 15 (App Router) + TypeScript + Tailwind v4.**

- A Vercel é restrição dada, e Next.js é o que ela publica sem configuração
  nenhuma — não há ajuste de build para errar.
- É uma ferramenta interna densa em dados, majoritariamente leitura. React
  Server Components renderizam isso bem sem mandar a base inteira ao navegador.
- TypeScript porque o modelo de entidades *é* a parte difícil deste produto. Os
  tipos em `lib/types.ts` são tanto entrega quanto as telas.
- Tailwind porque a direção visual já está fixada como tokens; um sistema de
  tokens mapeia em variáveis CSS + utilitários sem atrito.

É fundação real, não maquete descartável — o mesmo repositório vira a Fase 1 de
verdade trocando o `lib/data.ts` por um banco.

## 3. Modelo de dados — "nenhum schema existe ainda"

**Decidido.** Doze entidades em `lib/types.ts`:

`Firm`, `User`, `Department`, `Client`, `Competencia`, `Task`, `Document`,
`Procuracao`, `IntegrationCredential`, `AuditEntry`, `SecurityFlag`,
`DSARRequest`.

Três formatos nesse modelo carregam regra de negócio e merecem destaque:

- **`Competencia` é entidade de primeira classe, não um campo de data.** O
  negócio inteiro roda em períodos mensais de referência; tornar isso entidade é
  o que permite à central de status perguntar "qual o estado *deste* mês, para
  *este* cliente, *neste* departamento" como consulta direta, e não varredura.
- **Retenção é etiquetada por documento, não por cliente.** A especificação é
  enfática: uma rotina de expurgo genérica vai apagar algo ilegalmente ou reter
  algo ilegalmente, porque um único arquivo de cliente mistura obrigações de 5
  anos (fiscal), 10 (folha) e 30 (FGTS). `Document.retention` carrega a própria
  classe e o próprio vencimento.
- **`Task` tem exatamente um `assigneeId`.** Responsabilidade difusa é apontada
  pela pesquisa como o modo de falha central do setor. O tipo torna
  responsabilidade compartilhada *irrepresentável*, em vez de apenas
  desaconselhada.

## 4. Autenticação

**Decidido: nenhuma, deliberadamente, e sinalizada.**

O protótipo traz um seletor de papel (Diretoria / Gestor / Executor) no lugar de
um login. Autenticação real é tarefa de Fase 1 sem nenhuma questão de desenho em
aberto, ao passo que as *consequências* do papel — o que é visível, o que é
mascarado, o que vai para o log — são a parte interessante e estão inteiramente
implementadas. Toda tela passa pelos mesmos helpers de permissão que uma sessão
real alimentaria.

O seletor fica visível na barra superior e marcado como exclusivo do protótipo,
para que ninguém o confunda com controle de acesso.

## 5. Quanto do roadmap construir

**Decidido: Fase 1 inteira; Fases 2 e 3 presentes, porém desligadas atrás dos
toggles de módulo que a própria especificação descreve.**

As telas de Fase 1 (home por papel, painel, departamentos, base de clientes,
central de status) estão construídas e populadas. Auto-lançamento, portal do
cliente e ambiente de agentes estão construídos mas chegam desativados,
ligáveis em Admin › Módulos.

Isso resolve o roadmap honestamente em vez de deixar link morto: o rollout
faseado vira funcionalidade real do produto, e de quebra demonstra a própria
tela de toggles.

## 6. CNPJ alfanumérico

**Decidido: os dois formatos desde a primeira linha de código**, conforme a
insistência da especificação de que não seja migração v2. O `lib/cnpj.ts` valida
tanto o CNPJ numérico clássico quanto o formato alfanumérico vigente desde julho
de 2026, usando o mod-11 oficial em que letras contribuem com `ASCII − 48`. Os
dois formatos aparecem nos dados de exemplo, então a interface é exercitada
contra ambos.

## 7. Backup e recuperação de desastre

**Não construído — fora do escopo de um protótipo de interface, e sinalizado em
vez de silenciosamente omitido.** É decisão de infraestrutura (Postgres
gerenciado com PITR, restauração testada) que pertence à escolha do banco, no
início da Fase 1 de verdade. A especificação está certa: a guarda de 30 anos do
FGTS torna isso questão de conformidade, não de conveniência operacional.

## 8. WhatsApp como canal de primeira classe

**Modelado, não integrado.** Clientes têm contato de WhatsApp e as solicitações
de documento registram por qual canal saíram, então o modelo de dados não
precisa mudar quando um provedor for escolhido. Enviar mensagem de fato exige
conta Meta Business e decisão de fornecedor — nenhuma das duas é decisão de
protótipo.

---

## Deliberadamente NÃO decidido aqui

- **Qual agregador de Open Finance** (Pluggy ou Celcoin) — depende de conversa
  de preço e cobertura.
- **Contratar o SERPRO Integra Contador agora** — o conselho da especificação de
  conferir antes o catálogo de serviços vigente continua valendo.
- **Critério de saída da Fase 1** — é julgamento de negócio sobre a tolerância
  dos próprios sócios, não decisão técnica. Precisa de um número vindo deles; a
  central de status já está instrumentada para medir o que for escolhido.
