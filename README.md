<div align="center">

# 🛡️ Jomaga SafeWork

**Plataforma de Gestão de Segurança do Trabalho**

Sistema completo para gerenciamento de segurança ocupacional — controle de EPIs, registro de incidentes, DDS, treinamentos, colaboradores e relatórios de conformidade.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3FCF8E?logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)](https://www.typescriptlang.org/)

</div>

---

## 📋 Sobre o Projeto

O **Jomaga SafeWork** é uma plataforma web moderna voltada para empresas que precisam gerenciar a segurança do trabalho de forma centralizada e eficiente. O sistema permite o controle completo do ciclo de segurança ocupacional, desde o cadastro de colaboradores até a geração de relatórios e indicadores.

---

## ✨ Funcionalidades

| Módulo | Descrição |
|---|---|
| 📊 **Dashboard** | Visão geral com KPIs, gráficos e indicadores em tempo real |
| 👷 **Colaboradores** | Cadastro e gestão de colaboradores, cargos e status |
| 🦺 **EPIs** | Controle de Equipamentos de Proteção Individual — validade, status e atribuição |
| ⚠️ **Incidentes** | Registro, classificação por severidade e acompanhamento de ocorrências |
| 📝 **DDS** | Diálogos Diários de Segurança com temas, participantes e histórico |
| 🎓 **Treinamentos** | Agendamento, controle de participantes e status de capacitações |
| 📈 **Relatórios** | Gráficos interativos, exportação CSV e repositório de documentos |
| 📁 **Documentos** | Upload, download e gerenciamento de arquivos (PDF, XLSX, DOCX) via Supabase Storage |
| 🔐 **Autenticação** | Login seguro com Supabase Auth e controle de sessão via middleware |
| ⚙️ **Configurações** | Personalização do sistema |
| 💬 **Suporte** | Canal de suporte integrado |

---

## 🛠️ Stack Tecnológica

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
- **Linguagem:** [TypeScript 5.9](https://www.typescriptlang.org/)
- **UI:** [React 19](https://react.dev/) + [Tailwind CSS 4](https://tailwindcss.com/)
- **Banco de Dados:** [Supabase](https://supabase.com/) (PostgreSQL + Auth + Storage)
- **Gráficos:** [Recharts](https://recharts.org/)
- **Animações:** [Motion](https://motion.dev/) (Framer Motion)
- **Ícones:** [Lucide React](https://lucide.dev/)
- **Notificações:** [Sonner](https://sonner.emilkowal.dev/)

---

## 🚀 Como Executar

### Pré-requisitos

- [Node.js](https://nodejs.org/) 18+
- Conta no [Supabase](https://supabase.com/) com projeto configurado

### 1. Clone o repositório

```bash
git clone https://github.com/priscilaenorthon-dev/Jomaga-SafeWork.git
cd Jomaga-SafeWork
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
GEMINI_API_KEY=sua-gemini-api-key
```

### 4. Configure o banco de dados

Execute as migrations no **SQL Editor** do Supabase:

1. `supabase/migrations/20260304000001_clean_schema.sql` — Schema principal (tabelas e RLS)
2. `supabase/migrations/20260304000002_documents_and_seed.sql` — Tabela de documentos, storage bucket e dados de demonstração

### 5. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

---

## 📂 Estrutura do Projeto

```
Jomaga-SafeWork/
├── app/                          # App Router (Next.js 15)
│   ├── page.tsx                  # Dashboard principal
│   ├── layout.tsx                # Layout global
│   ├── login/                    # Página de login
│   ├── colaboradores/            # Gestão de colaboradores
│   ├── epis/                     # Controle de EPIs
│   ├── incidentes/               # Registro de incidentes
│   ├── dds/                      # Diálogos Diários de Segurança
│   ├── treinamentos/             # Gestão de treinamentos
│   ├── relatorios/               # Relatórios e documentos
│   ├── configuracoes/            # Configurações
│   ├── suporte/                  # Suporte
│   └── api/                      # API Routes
│       └── generate-dds/         # Geração de DDS com IA
├── components/                   # Componentes reutilizáveis
│   ├── Header.tsx                # Cabeçalho
│   └── Sidebar.tsx               # Menu lateral
├── hooks/                        # Custom hooks
├── lib/                          # Utilitários e clients
│   ├── supabase-client.ts        # Client-side Supabase
│   ├── supabase-server.ts        # Server-side Supabase
│   ├── supabase-middleware.ts    # Middleware Supabase
│   └── utils.ts                  # Funções auxiliares
├── supabase/
│   └── migrations/               # Migrations SQL
└── middleware.ts                  # Middleware Next.js (auth)
```

---

## 🗄️ Banco de Dados

| Tabela | Descrição |
|---|---|
| `profiles` | Perfis de usuários (vinculado ao auth.users) |
| `collaborators` | Colaboradores da empresa |
| `incidents` | Registro de incidentes e acidentes |
| `epis` | Equipamentos de Proteção Individual |
| `trainings` | Treinamentos e capacitações |
| `dds_records` | Diálogos Diários de Segurança |
| `documents` | Metadados de documentos armazenados |

Todas as tabelas possuem **Row Level Security (RLS)** habilitado.

---

## 📜 Scripts Disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Gera o build de produção |
| `npm run start` | Inicia o servidor de produção |
| `npm run lint` | Executa o linter (ESLint) |
| `npm run clean` | Limpa o cache do Next.js |

---

## 🤝 Desenvolvido por

**Jomaga SafeWork** — Plataforma desenvolvida para gestão de segurança do trabalho industrial.

---

<div align="center">

⭐ Se este projeto foi útil, deixe uma estrela!

</div>
