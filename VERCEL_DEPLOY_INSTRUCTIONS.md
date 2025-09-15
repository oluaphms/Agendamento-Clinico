# Instruções para Deploy na Vercel - Sistema Clínico

## ✅ Correções Implementadas

### 1. Build Local

- ✅ Build executado com sucesso localmente
- ✅ Todas as telas de apresentação e login funcionando
- ✅ Arquivo CSS aumentou de tamanho (90.20 kB) indicando inclusão das classes

### 2. Tailwind Purge

- ✅ `tailwind.config.js` configurado corretamente
- ✅ `content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"]` definido
- ✅ Safelist expandida com todas as classes dinâmicas comuns:
  - Classes de texto: `text-white`, `text-gray-900`, `text-neutral-800`, etc.
  - Classes de fundo: `bg-white`, `bg-gray-800`, etc.
  - Classes de borda: `border-gray-200`, `border-gray-700`, etc.
  - Classes de hover e focus
  - Classes de dark mode: `dark:text-white`, `dark:bg-gray-800`, etc.

### 3. Variáveis de Ambiente

- ✅ Configuração de ambiente verificada em `src/config/environment.ts`
- ✅ Variáveis necessárias: `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
- ✅ Fallback para mock data quando variáveis não estão definidas

### 4. Rotas

- ✅ `vite.config.ts` configurado com `base: "/"`
- ✅ `vercel.json` configurado corretamente com rewrites
- ✅ Rotas funcionando: `/`, `/login`, `/app/dashboard`

### 5. Cor do Texto (Tema Escuro)

- ✅ Páginas de apresentação e login corrigidas para tema escuro
- ✅ Classes `dark:` adicionadas para todos os elementos
- ✅ Contraste adequado entre texto e fundo
- ✅ Tema escuro como padrão conforme configuração

## 🚀 Passos para Deploy na Vercel

### 1. Configurar Variáveis de Ambiente

No painel da Vercel (Project → Settings → Environment Variables), adicionar:

```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
VITE_APP_ENVIRONMENT=production
VITE_ENABLE_MOCK_DATA=false
VITE_ENABLE_DEBUG_LOGS=false
VITE_ENABLE_ERROR_REPORTING=true
```

### 2. Configurações do Projeto

- **Framework**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 3. Deploy

1. Fazer commit das alterações
2. Fazer push para o repositório
3. A Vercel fará o deploy automaticamente
4. Verificar se as variáveis de ambiente estão configuradas

### 4. Testar as Rotas

Após o deploy, testar:

- `/` - Página de apresentação (deve funcionar com tema escuro)
- `/login` - Página de login (deve funcionar com tema escuro)
- `/app/dashboard` - Dashboard (após login)

## 🔧 Arquivos Modificados

1. **tailwind.config.js** - Safelist expandida
2. **vite.config.ts** - Base path configurado
3. **src/pages/Apresentacao/Apresentacao.tsx** - Suporte ao tema escuro
4. **src/pages/Auth/Login.tsx** - Suporte ao tema escuro

## 📋 Checklist de Verificação

- [ ] Variáveis de ambiente configuradas na Vercel
- [ ] Build executado com sucesso
- [ ] Página de apresentação carrega corretamente
- [ ] Página de login carrega corretamente
- [ ] Tema escuro aplicado por padrão
- [ ] Texto visível e com bom contraste
- [ ] Rotas funcionando corretamente
- [ ] CSS carregando sem problemas

## 🐛 Possíveis Problemas e Soluções

### Problema: Página em branco

**Solução**: Verificar se as variáveis de ambiente estão configuradas

### Problema: Texto não visível

**Solução**: Verificar se as classes de dark mode estão sendo aplicadas

### Problema: CSS não carregando

**Solução**: Verificar se o Tailwind está incluindo as classes na safelist

### Problema: Rotas não funcionando

**Solução**: Verificar se o `vercel.json` está configurado corretamente

## 📞 Suporte

Se houver problemas após o deploy, verificar:

1. Logs da Vercel
2. Console do navegador
3. Network tab para verificar se os assets estão carregando
4. Se as variáveis de ambiente estão definidas corretamente
