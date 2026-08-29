# Contabilidade Automatizada

Protótipo navegável de uma plataforma interna de operações para escritório
contábil brasileiro — a aplicação que a especificação descreve, não a
especificação em si.

Quatro departamentos com a cadeia de dependência real entre eles, base de
clientes com os dois formatos de CNPJ, central de status por competência e um
painel da diretoria cobrindo integrações, procurações, auditoria e a fila LGPD.

> **Protótipo, não produção.** Sem autenticação, sem banco de dados, sem dado
> real de cliente. Todo CNPJ é inventado; eles têm dígito verificador válido
> apenas para exercitar o validador de verdade.

## Rodando localmente

```bash
npm install
```

```bash
npm run dev
```

Abra <http://localhost:3000>.

| Script | O que faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm start` | Sobe o build de produção |
| `npm run typecheck` | Checagem de tipos, sem emitir arquivos |

> **Não rode `npm run build` com o `npm run dev` ligado.** Os dois escrevem no
> mesmo diretório `.next` e o cache corrompe — o sintoma é CSS servido como
> `text/plain` e erros do tipo `Cannot find module './805.js'`. Se acontecer:
> pare o servidor, `rm -rf .next` e suba de novo.

## Publicando na Vercel

Zero configuração. Importe o repositório em [vercel.com/new](https://vercel.com/new)
— a Vercel detecta Next.js e preenche build, output e install sozinha. Nada a
configurar, sem variável de ambiente, sem serviço externo.

```bash
npx vercel --prod
```

## Onde fica cada coisa

```
app/
├── page.tsx                  Tela 01 — seleção de papel (no lugar do login)
├── layout.tsx                fontes, tema, provider de sessão
├── globals.css               tokens de design (claro + escuro)
└── (app)/
    ├── layout.tsx            shell: menu lateral, topo, troca de papel
    ├── dashboard/            Telas 02 + 03 — painel, recortado por papel
    ├── status/               Tela 05 — matriz cliente × departamento
    ├── clientes/             Tela 04 — base de clientes
    │   └── [id]/             detalhe: mascaramento + retenção por documento
    ├── departamentos/[slug]/ os quatro departamentos
    ├── lancamentos/          Tela 06 — auto-lançamento (Fase 2, desligado)
    ├── agentes/              Tela 08 — agentes (Fase 3, desligado)
    ├── portal/               portal do cliente (Fase 3, desligado)
    ├── spec/                 as decisões, legíveis dentro do app
    └── admin/                o nível Diretoria — 8 telas
lib/
├── types.ts                  o modelo de entidades que faltava
├── data.ts                   dados de exemplo + acessores (trocar por banco)
├── cnpj.ts                   validação de CNPJ nos dois formatos
├── labels.ts                 todo rótulo visível, em pt-BR
└── access.ts                 escopo por papel e mascaramento LGPD
docs/DECISOES.md              cada questão em aberto, e o que foi decidido
```

## O que vale olhar

**A central de status** (`/status`) é a tela que a especificação coloca como de
maior alavancagem: a mais barata de construir, ataca a dor mais citada e não
depende de nenhuma API externa. Responde "qual cliente está travado em qual
departamento, neste mês" como uma grade.

**O escopo por papel é aplicado, não decorativo.** Troque para *Executor —
Rafael Lima* no topo e vá em `/departamentos/pessoal`: negado na rota, não
apenas escondido do menu. Abra `/clientes/c1` com o mesmo usuário e o atestado
médico aparece mascarado — a linha continua visível para o arquivo não parecer
incompleto, o conteúdo não.

**Retenção é por documento, nunca por cliente.** Um arquivo de cliente mistura
documento fiscal de 5 anos, folha de 10 e guia de FGTS de 30. Uma regra de
expurgo por cliente necessariamente apagaria ou reteria algo ilegalmente.

**CNPJ aceita os dois formatos** desde o primeiro schema. O `lib/cnpj.ts`
implementa o mod-11 com valor de caractere = ASCII − 48, conferido contra o
exemplo oficial da Receita (`12ABC34501DE` → dígitos `35`).

**Fases 2 e 3 chegam desligadas.** Auto-lançamento, portal do cliente e o
ambiente de agentes estão construídos, mas desativados, e são ligados em
*Admin › Módulos* sem redeploy. Isso torna o roadmap faseado uma
funcionalidade real em vez de uma nota num documento.

## Questões em aberto da especificação

A especificação marcava seis itens como impeditivos para a Fase 1. Todos estão
resolvidos em [`docs/DECISOES.md`](docs/DECISOES.md) — stack, modelo de
entidades, autenticação, escopo do roadmap, CNPJ — junto com os quatro que
ficaram deliberadamente em aberto por dependerem de informação que um protótipo
não pode inventar (escolha de agregador, contratar o SERPRO agora, critério de
saída da Fase 1, e backup/recuperação de desastre).

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind v4 · nenhuma outra dependência
de runtime. As fontes são servidas pelo próprio projeto via `next/font`, então
a página publicada não faz requisição a terceiros.
