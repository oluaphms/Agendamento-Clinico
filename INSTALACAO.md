# 🚀 Guia de Instalação - Sistema de Gestão de Clínica

Este guia irá te ajudar a configurar e executar o sistema de clínica em sua máquina local.

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** 18.0.0 ou superior
- **npm** 9.0.0 ou superior (ou **yarn** 1.22.0+)
- **Git** para clonar o repositório
- **Conta no Supabase** para o backend

### Verificar versões

```bash
node --version
npm --version
git --version
```

## 🛠️ Passo a Passo da Instalação

### 1. Clone o Repositório

```bash
git clone https://github.com/seu-usuario/sistema-clinica.git
cd sistema-clinica
```

### 2. Instale as Dependências

```bash
npm install
```

**Ou se preferir usar Yarn:**

```bash
yarn install
```

### 3. Configure o Supabase

#### 3.1 Crie um Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Faça login ou crie uma conta
3. Clique em "New Project"
4. Escolha sua organização
5. Digite um nome para o projeto (ex: "sistema-clinica")
6. Escolha uma senha forte para o banco
7. Escolha uma região (recomendado: São Paulo)
8. Clique em "Create new project"

#### 3.2 Configure as Variáveis de Ambiente

1. No seu projeto Supabase, vá em **Settings** > **API**
2. Copie a **URL** e a **anon key**
3. No projeto local, copie o arquivo de exemplo:

```bash
cp env.example .env.local
```

4. Edite o arquivo `.env.local`:

```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

### 4. Configure o Banco de Dados

#### 4.1 Execute o Schema SQL

1. No Supabase, vá em **SQL Editor**
2. Clique em **New query**
3. Copie e cole o conteúdo do arquivo `database/schema.sql`
4. Clique em **Run** para executar

#### 4.2 Verifique as Tabelas

Após executar o schema, você deve ver as seguintes tabelas criadas:

- `usuarios` - Usuários do sistema
- `pacientes` - Cadastro de pacientes
- `profissionais` - Equipe médica
- `servicos` - Catálogo de serviços
- `agendamentos` - Sistema de agendamento
- `consultas` - Histórico de consultas
- `pagamentos` - Controle financeiro
- `notificacoes` - Sistema de notificações
- `configuracoes` - Configurações do sistema
- `logs_sistema` - Log de atividades

### 5. Configure o Supabase Auth

#### 5.1 Configurações de Autenticação

1. No Supabase, vá em **Authentication** > **Settings**
2. Em **Site URL**, adicione: `http://localhost:5173`
3. Em **Redirect URLs**, adicione:
   - `http://localhost:5173/login`
   - `http://localhost:5173/dashboard`
   - `http://localhost:5173/`

#### 5.2 Configurações de Email (Opcional)

1. Em **Authentication** > **Settings** > **SMTP Settings**
2. Configure seu servidor SMTP para envio de emails
3. Ou use o serviço de email do Supabase (limitado)

### 6. Execute o Projeto

```bash
npm run dev
```

O sistema estará disponível em: **http://localhost:5173**

## 🔐 Primeiro Acesso

### 1. Criar Conta de Administrador

1. Acesse `http://localhost:5173/login`
2. Clique em "Não tem uma conta? Cadastre-se"
3. Preencha os dados:
   - **Nome**: Administrador
   - **CPF**: 00000000000
   - **Email**: admin@clinica.com
   - **Cargo**: Administrador
   - **Senha**: (escolha uma senha forte)

### 2. Configurar Nível de Acesso

1. No Supabase, vá em **Table Editor** > **usuarios**
2. Encontre seu usuário
3. Altere o campo `nivel_acesso` para `admin`
4. Salve as alterações

### 3. Acessar o Sistema

1. Faça logout e login novamente
2. Agora você terá acesso completo ao sistema
3. Comece configurando a clínica em **Configurações**

## 🧪 Executando Testes

### Testes Unitários

```bash
npm test
```

### Testes em Modo Watch

```bash
npm run test:watch
```

### Relatório de Cobertura

```bash
npm run test:coverage
```

## 🏗️ Build para Produção

### Build de Desenvolvimento

```bash
npm run build
```

### Preview da Build

```bash
npm run preview
```

### Build Otimizada

```bash
npm run build -- --mode production
```

## 🚀 Deploy

### Vercel (Recomendado)

1. Instale o Vercel CLI:
```bash
npm i -g vercel
```

2. Faça login:
```bash
vercel login
```

3. Deploy:
```bash
vercel --prod
```

### Netlify

1. Faça build:
```bash
npm run build
```

2. Faça upload da pasta `dist/` para o Netlify

### Docker

1. Build da imagem:
```bash
docker build -t sistema-clinica .
```

2. Execute o container:
```bash
docker run -p 3000:3000 sistema-clinica
```

## 🔧 Configurações Adicionais

### 1. Configurar Domínio Personalizado

1. No Supabase, vá em **Authentication** > **Settings**
2. Adicione seu domínio em **Site URL**
3. Configure **Redirect URLs** para seu domínio

### 2. Configurar Backup Automático

1. No Supabase, vá em **Settings** > **Database**
2. Configure **Backup Schedule**
3. Escolha a frequência desejada

### 3. Configurar Monitoramento

1. No Supabase, vá em **Settings** > **API**
2. Configure **Rate Limiting** se necessário
3. Monitore o uso em **Usage**

## 🐛 Solução de Problemas

### Erro de Conexão com Supabase

- Verifique se as variáveis de ambiente estão corretas
- Confirme se o projeto Supabase está ativo
- Verifique se a URL e chave estão corretas

### Erro de Tabelas Não Encontradas

- Execute novamente o schema SQL
- Verifique se não há erros na execução
- Confirme se as tabelas foram criadas

### Erro de Autenticação

- Verifique as configurações de Auth no Supabase
- Confirme se as URLs de redirecionamento estão corretas
- Verifique se o email está confirmado

### Erro de Build

- Limpe o cache: `npm run clean`
- Delete `node_modules` e reinstale: `rm -rf node_modules && npm install`
- Verifique se todas as dependências estão instaladas

## 📞 Suporte

Se encontrar problemas durante a instalação:

1. **Verifique os logs** no terminal
2. **Consulte a documentação** do Supabase
3. **Abra uma issue** no GitHub do projeto
4. **Entre em contato** com o suporte

## 🎉 Próximos Passos

Após a instalação bem-sucedida:

1. **Configure a clínica** em Configurações
2. **Cadastre profissionais** da equipe
3. **Configure serviços** oferecidos
4. **Teste o agendamento** com dados de exemplo
5. **Personalize o sistema** conforme suas necessidades

---

**🎯 Sistema instalado com sucesso! Agora você pode começar a usar o Sistema de Gestão de Clínica.**
