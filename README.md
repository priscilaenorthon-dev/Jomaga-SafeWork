<div align="center">

# 🛡️ Jomaga SafeWork

**Plataforma de Gestão de Segurança do Trabalho**

Sistema web para gestão de SST com módulos de colaboradores, EPIs, incidentes, DDS, treinamentos, ASO, relatórios e documentos.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%20%2B%20Auth-3FCF8E?logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)

</div>

---

## ✅ Ajustes recentes (Mar/2026)

- **Build Next.js 15 corrigido** na rota dinâmica de assinatura (`params` como `Promise` + `use(params)`).
- **Impressão DDS reformulada** para formato de ficha/tabular (estilo papel de presença com assinatura).
- **IA DDS estabilizada** com mensagens claras para chave ausente/inválida e sessão expirada.
- **Configurações simplificadas**: removido campo duplicado de título técnico em Empresa; mantém apenas **Cargo/Função** no Perfil.
- **Exibição de usuário ajustada**: fallback “Usuário” removido; sistema prioriza nome do perfil salvo.
- **Suporte > Atualizações Futuras** agora mostra status real por item: **Implementado / Parcial / Planejado**.
- **Migrations baseline adicionadas** (schema completo + seed massivo de dados).

---

## ✨ Funcionalidades

| Módulo | Descrição |
|---|---|
| 📊 Dashboard | KPIs e visão resumida de segurança |
| 👷 Colaboradores | Cadastro, status, assinatura digital e LGPD |
| 🦺 EPIs | Controle de validade e inventário |
| ⚠️ Incidentes | Registro, severidade, tipo e evidências |
| 📝 DDS | Registro, lista de presença, impressão e IA |
| 🎓 Treinamentos | Gestão de agenda, categoria e status |
| 🩺 ASO | Controle de exames ocupacionais |
| 📁 Documentos | Metadados + Storage Supabase |
| ⚙️ Configurações | Empresa, perfil, idioma e notificações |
| 💬 Suporte | Canal de ajuda + roadmap com status |

---

## 🛠️ Stack

- Next.js 15 (App Router)
- React 19 + TypeScript
- Tailwind CSS 4
- Supabase (PostgreSQL + Auth + Storage)
- Motion + Lucide + Sonner
- Gemini via `@google/genai` na rota `/api/generate-dds`

---

## 🚀 Setup local

### Pré-requisitos

- Node.js 18+
- Projeto Supabase configurado

### 1) Clone e instalação

```bash
git clone https://github.com/priscilaenorthon-dev/Jomaga-SafeWork.git
cd Jomaga-SafeWork
npm install
```

### 2) Variáveis de ambiente

Crie `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key

# Use UMA das chaves abaixo (server-side):
# OPENROUTER_API_KEY=sua-chave-openrouter
GEMINI_API_KEY=sua-chave-google-ai-studio
# GOOGLE_AI_STUDIO_API_KEY=sua-chave-google-ai-studio
# GOOGLE_API_KEY=sua-chave-google-ai-studio
# GOOGLE_GENERATIVE_AI_API_KEY=sua-chave-google-ai-studio
# Compatibilidade (já aceito pela API):
# NEXT_PUBLIC_GEMINI_API_KEY=sua-chave-google-ai-studio
# NEXT_PUBLIC_GOOGLE_AI_STUDIO_API_KEY=sua-chave-google-ai-studio

# Opcional (OpenRouter):
# OPENROUTER_MODEL=google/gemini-2.0-flash-001

APP_URL=http://localhost:3000
```

> Recomendação: prefira variáveis server-side (`OPENROUTER_API_KEY` ou `GEMINI_API_KEY`).

### 3) Banco de dados

Você pode seguir dois caminhos:

#### Opção A — Histórico de migrations (recomendado para evolução)

Aplicar os arquivos existentes em sequência na pasta `supabase/migrations`.

#### Opção B — Baseline completo + seed massivo (ambiente novo)

1. `supabase/migrations/20260306010000_baseline_schema.sql`
2. `supabase/migrations/20260306010001_baseline_seed_300_plus.sql`

Esse seed gera **320 registros por tabela operacional** (`collaborators`, `incidents`, `epis`, `trainings`, `dds_records`, `documents`, `epi_inventory`, `asos`).

### 4) Rodar o projeto

```bash
npm run dev
```

Acesse `http://localhost:3000`.

---

## ☁️ Vercel (produção)

No projeto da Vercel, configure em `Settings > Environment Variables`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `OPENROUTER_API_KEY` (preferido no seu caso) ou `GEMINI_API_KEY`

Opcional no OpenRouter:
- `OPENROUTER_MODEL` (padrão: `google/gemini-2.0-flash-001`)

Depois faça `Redeploy`.

---

## 🧱 Estrutura principal

```txt
app/
	api/generate-dds/route.ts
	dds/page.tsx
	configuracoes/page.tsx
	suporte/page.tsx
	assinatura/[token]/page.tsx
components/
	Header.tsx
supabase/
	migrations/
		20260306010000_baseline_schema.sql
		20260306010001_baseline_seed_300_plus.sql
```

---

## 📜 Scripts

| Comando | Descrição |
|---|---|
| `npm run dev` | Desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Servidor de produção |
| `npm run lint` | ESLint |
| `npm run clean` | Limpa cache do Next |

---

## 🤝 Projeto

Jomaga SafeWork — gestão de segurança do trabalho com foco em rastreabilidade, conformidade e operação de campo.
