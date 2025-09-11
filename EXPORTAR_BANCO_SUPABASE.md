# 🗄️ Exportar Banco de Dados do Supabase

## 📋 **Métodos de Export**

### **1. 🚀 Via Supabase CLI (Recomendado)**

```bash
# Instalar Supabase CLI
npm install -g supabase

# Fazer login
supabase login

# Linkar projeto
supabase link --project-ref xvjjgeoxsvzwcvjihjih

# Exportar schema
supabase db dump --schema public > schema.sql

# Exportar dados
supabase db dump --data-only > data.sql

# Exportar completo
supabase db dump > backup_completo.sql
```

### **2. 🐘 Via pg_dump (PostgreSQL nativo)**

```bash
# Exportar schema
pg_dump -h db.xvjjgeoxsvzwcvjihjih.supabase.co -p 5432 -U postgres -d postgres --schema-only > schema.sql

# Exportar dados
pg_dump -h db.xvjjgeoxsvzwcvjihjih.supabase.co -p 5432 -U postgres -d postgres --data-only > data.sql

# Exportar completo
pg_dump -h db.xvjjgeoxsvzwcvjihjih.supabase.co -p 5432 -U postgres -d postgres > backup_completo.sql

# Exportar tabelas específicas
pg_dump -h db.xvjjgeoxsvzwcvjihjih.supabase.co -p 5432 -U postgres -d postgres -t agendamentos -t pacientes > tabelas_especificas.sql
```

### **3. 🎯 Via Scripts Automatizados**

#### **Script de Export via API:**

```bash
# Configurar variáveis de ambiente
echo "SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role_aqui" >> .env

# Executar script
node scripts/export-supabase.cjs
```

#### **Script de Export via pg_dump:**

```bash
# Configurar senha do banco
echo "SUPABASE_DB_PASSWORD=sua_senha_do_banco_aqui" >> .env

# Executar script
node scripts/export-pg-dump.cjs
```

### **4. 🌐 Via Supabase Dashboard**

1. **Acesse:** https://supabase.com/dashboard
2. **Selecione seu projeto**
3. **Vá para:** Settings → Database
4. **Clique em:** "Download backup"
5. **Escolha o formato:**
   - **SQL** - Backup completo
   - **CSV** - Dados específicos

## 🔧 **Configuração Necessária**

### **Variáveis de Ambiente (.env):**

```env
# URL do Supabase
VITE_SUPABASE_URL=https://xvjjgeoxsvzwcvjihjih.supabase.co

# Chave anônima
VITE_SUPABASE_ANON_KEY=sua_chave_anon_aqui

# Chave service role (para export via API)
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role_aqui

# Senha do banco (para pg_dump)
SUPABASE_DB_PASSWORD=sua_senha_do_banco_aqui
```

### **Onde encontrar as credenciais:**

1. **Supabase Dashboard** → Settings → API
2. **URL:** `VITE_SUPABASE_URL`
3. **Chave Anônima:** `VITE_SUPABASE_ANON_KEY`
4. **Service Role:** `SUPABASE_SERVICE_ROLE_KEY`
5. **Senha do DB:** Settings → Database → Connection string

## 📊 **Tipos de Export**

### **Schema Only (Estrutura):**

- ✅ Tabelas, colunas, índices
- ✅ Constraints, triggers
- ✅ Funções, procedures
- ❌ Dados das tabelas

### **Data Only (Dados):**

- ❌ Estrutura das tabelas
- ✅ Dados de todas as tabelas
- ✅ Relacionamentos preservados

### **Complete (Completo):**

- ✅ Schema + Dados
- ✅ Backup completo
- ✅ Pronto para restore

## 🎯 **Comandos Rápidos**

### **Export Rápido (Recomendado):**

```bash
# Via Supabase CLI
supabase db dump > backup_$(date +%Y%m%d_%H%M%S).sql
```

### **Export de Tabelas Específicas:**

```bash
# Apenas agendamentos e pacientes
pg_dump -h db.xvjjgeoxsvzwcvjihjih.supabase.co -p 5432 -U postgres -d postgres -t agendamentos -t pacientes > agendamentos_pacientes.sql
```

### **Export com Compressão:**

```bash
# Com gzip
pg_dump -h db.xvjjgeoxsvzwcvjihjih.supabase.co -p 5432 -U postgres -d postgres | gzip > backup_$(date +%Y%m%d).sql.gz
```

## 📁 **Estrutura de Arquivos Gerados**

```
backups/
├── schema_2024-01-15T10-30-00.sql
├── data_2024-01-15T10-30-00.sql
├── backup_completo_2024-01-15T10-30-00.sql
├── tabelas_principais_2024-01-15T10-30-00.sql
├── agendamentos.json
├── pacientes.json
├── profissionais.json
├── servicos.json
└── resumo_export_2024-01-15T10-30-00.json
```

## ⚠️ **Avisos Importantes**

- **🔐 Segurança:** Nunca commite credenciais no Git
- **💾 Espaço:** Backups podem ser grandes
- **⏱️ Tempo:** Export pode demorar para bancos grandes
- **🔄 Frequência:** Faça backups regulares
- **🧪 Teste:** Teste o restore antes de precisar

## 🚀 **Recomendação**

**Para uso diário:** Use o script `export-supabase.cjs` **Para backup completo:** Use
`supabase db dump` **Para tabelas específicas:** Use `pg_dump` com `-t`

**Escolha o método que melhor se adequa ao seu caso!** 🎯
