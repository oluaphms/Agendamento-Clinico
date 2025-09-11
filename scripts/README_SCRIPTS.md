# 📋 Scripts para Verificar Tabelas no Supabase

Este diretório contém scripts para verificar e listar as tabelas existentes no Supabase.

## 🚀 **Scripts Disponíveis**

### **1. SQL Scripts (Recomendado)**

#### **`verificar_tabelas_simples.sql`** ⭐
- **Uso:** Execute no Supabase SQL Editor
- **Função:** Lista tabelas e conta registros de forma simples
- **Como usar:**
  1. Acesse o Supabase Dashboard
  2. Vá para SQL Editor
  3. Cole o conteúdo do arquivo
  4. Execute o script

#### **`listar_tabelas_supabase.sql`** 🔍
- **Uso:** Execute no Supabase SQL Editor
- **Função:** Análise completa do banco de dados
- **Inclui:**
  - Lista de todas as tabelas
  - Informações detalhadas de colunas
  - Índices e chaves estrangeiras
  - Triggers e views
  - Políticas RLS
  - Tamanho das tabelas
  - Contagem de registros

### **2. JavaScript Script**

#### **`listar-tabelas-supabase.js`** 🟨
- **Uso:** `node scripts/listar-tabelas-supabase.js`
- **Requisitos:** Node.js + dependências do Supabase
- **Função:** Verifica tabelas via API do Supabase
- **Vantagens:** 
  - Execução local
  - Verificação automática de dados iniciais
  - Relatório detalhado

**Instalação:**
```bash
npm install @supabase/supabase-js dotenv
```

**Execução:**
```bash
node scripts/listar-tabelas-supabase.js
```

### **3. Python Script**

#### **`listar_tabelas_supabase.py`** 🐍
- **Uso:** `python scripts/listar_tabelas_supabase.py`
- **Requisitos:** Python + bibliotecas do Supabase
- **Função:** Verifica tabelas via API do Supabase
- **Vantagens:**
  - Execução local
  - Interface amigável
  - Relatório colorido

**Instalação:**
```bash
pip install supabase python-dotenv
```

**Execução:**
```bash
python scripts/listar_tabelas_supabase.py
```

## ⚙️ **Configuração**

### **Variáveis de Ambiente**
Crie um arquivo `.env.local` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
```

### **Credenciais do Supabase**
1. Acesse o Supabase Dashboard
2. Vá para Settings > API
3. Copie a URL e a chave anônima
4. Configure no arquivo `.env.local`

## 📊 **Tabelas Esperadas**

O sistema clínico deve ter as seguintes tabelas:

### **Tabelas Principais:**
- ✅ `usuarios` - Usuários do sistema
- ✅ `pacientes` - Cadastro de pacientes
- ✅ `profissionais` - Profissionais de saúde
- ✅ `servicos` - Serviços oferecidos
- ✅ `agendamentos` - Agendamentos de consultas
- ✅ `pagamentos` - Controle financeiro

### **Tabelas de Suporte:**
- ✅ `configuracoes` - Configurações do sistema
- ✅ `notificacoes` - Sistema de notificações
- ✅ `audit_log` - Log de auditoria
- ✅ `backups` - Registro de backups

### **Tabelas de Permissões:**
- ✅ `permissions` - Permissões do sistema
- ✅ `roles` - Papéis/funções
- ✅ `role_permissions` - Relacionamento roles-permissões
- ✅ `user_roles` - Relacionamento usuários-roles

## 🔍 **Exemplo de Saída**

```
🔍 Verificando tabelas no Supabase...

📊 URL: https://seu-projeto.supabase.co
🔑 Key: eyJhbGciOiJIUzI1NiIs...

🔗 Testando conexão...
✅ Conexão estabelecida com sucesso!

📋 VERIFICAÇÃO DE TABELAS:
==================================================
✅ usuarios                | 3 registros
✅ pacientes              | 0 registros
✅ profissionais          | 0 registros
✅ servicos               | 5 registros
✅ agendamentos           | 0 registros
✅ pagamentos             | 0 registros
✅ configuracoes          | 5 registros
✅ notificacoes           | 0 registros
✅ audit_log              | 0 registros
✅ backups                | 0 registros
✅ permissions            | 20 registros
✅ roles                  | 5 registros
✅ role_permissions       | 50 registros
✅ user_roles             | 0 registros

📊 RESUMO:
==================================================
Total de tabelas esperadas: 14
Tabelas existentes: 14
Tabelas faltando: 0
Total de registros: 88

🌱 DADOS INICIAIS:
==================================================
✅ Usuários iniciais: 3/3
   - Administrador (11111111111) - admin
   - Recepcionista (22222222222) - recepcao
   - Desenvolvedor (33333333333) - desenvolvedor

✅ Serviços iniciais: 5/5
   - Consulta Médica - R$ 150.00
   - Exame de Sangue - R$ 80.00
   - Ultrassom - R$ 200.00
   - Eletrocardiograma - R$ 120.00
   - Consulta de Retorno - R$ 100.00

✅ Configurações iniciais: 5/5
   - sistema (sistema)
   - notificacoes (notificacoes)
   - seguranca (seguranca)
   - interface (interface)
   - backup (backup)

🎉 Verificação concluída!
```

## 🛠️ **Troubleshooting**

### **Erro de Conexão**
- Verifique se as credenciais estão corretas
- Confirme se o projeto Supabase está ativo
- Teste a conectividade de rede

### **Tabelas Não Encontradas**
- Execute o script `supabase_schema.sql` no Supabase
- Verifique se o schema foi criado corretamente
- Confirme as permissões do usuário

### **Dados Iniciais Faltando**
- Execute a seção de "DADOS INICIAIS" do schema
- Verifique se os seeds foram inseridos
- Confirme se não há conflitos de chaves

## 📚 **Documentação Adicional**

- [Documentação do Supabase](https://supabase.com/docs)
- [Guia de SQL do Supabase](https://supabase.com/docs/guides/database)
- [API Reference](https://supabase.com/docs/reference)

---

**💡 Dica:** Use o script SQL simples para verificações rápidas e o script JavaScript/Python para análises mais detalhadas!
