# Scripts de Verificação de Tabelas do Supabase

Este diretório contém scripts para verificar quais tabelas existem no Supabase e quais ainda
precisam ser criadas para o sistema clínico.

## 📁 Arquivos Disponíveis

### 1. `verificar-tabelas-supabase.sql` (Completo)

**Uso:** Execute no SQL Editor do Supabase Dashboard

- ✅ Verifica todas as tabelas existentes
- ✅ Mostra estrutura das tabelas principais
- ✅ Verifica índices, triggers, funções e views
- ✅ Gera relatório completo com percentual de completude
- ✅ Identifica tabelas faltantes

### 2. `verificacao-rapida-tabelas.sql` (Rápido)

**Uso:** Execute no SQL Editor do Supabase Dashboard

- ⚡ Verificação rápida e simples
- ✅ Lista tabelas existentes vs esperadas
- ✅ Conta total de tabelas criadas

### 3. `verificar-tabelas-supabase.js` (Node.js)

**Uso:** Execute localmente com Node.js

```bash
node scripts/verificar-tabelas-supabase.js
```

- 🔌 Conecta via API do Supabase
- ✅ Verifica existência e conta registros
- ✅ Relatório detalhado no terminal
- ✅ Não precisa acessar o dashboard

### 4. `verificar-tabelas-supabase.py` (Python)

**Uso:** Execute localmente com Python

```bash
python scripts/verificar-tabelas-supabase.py
```

- 🐍 Versão em Python para maior flexibilidade
- 🔌 Conecta via API do Supabase
- ✅ Mesma funcionalidade do script Node.js

## 🚀 Como Usar

### Opção 1: SQL Editor (Mais Simples)

1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Vá para **SQL Editor**
3. Cole o conteúdo de `verificacao-rapida-tabelas.sql`
4. Execute o script
5. Verifique os resultados

### Opção 2: Script Local (Mais Detalhado)

1. Configure as variáveis de ambiente no arquivo `.env`:

   ```env
   VITE_SUPABASE_URL=sua_url_do_supabase
   VITE_SUPABASE_ANON_KEY=sua_chave_anonima
   ```

2. Execute um dos scripts:

   ```bash
   # Node.js
   node scripts/verificar-tabelas-supabase.js

   # Python
   python scripts/verificar-tabelas-supabase.py
   ```

## 📊 Tabelas Esperadas

O sistema clínico espera as seguintes tabelas:

| Tabela          | Descrição                          | Status |
| --------------- | ---------------------------------- | ------ |
| `usuarios`      | Usuários do sistema (funcionários) | ⏳     |
| `pacientes`     | Pacientes da clínica               | ⏳     |
| `profissionais` | Profissionais de saúde             | ⏳     |
| `servicos`      | Serviços oferecidos                | ⏳     |
| `agendamentos`  | Agendamentos de consultas          | ⏳     |
| `pagamentos`    | Pagamentos dos agendamentos        | ⏳     |
| `configuracoes` | Configurações do sistema           | ⏳     |
| `audit_log`     | Log de auditoria                   | ⏳     |
| `notificacoes`  | Notificações para usuários         | ⏳     |
| `backups`       | Registro de backups                | ⏳     |

## 🔧 Resolução de Problemas

### Se alguma tabela estiver faltando:

1. Execute o script de setup: `00-setup-completo-sistema-corrigido.sql`
2. Verifique novamente com os scripts de verificação
3. Confirme se todas as tabelas foram criadas

### Se houver erro de conexão:

1. Verifique se as variáveis de ambiente estão corretas
2. Confirme se a URL e chave do Supabase estão corretas
3. Teste a conexão no Supabase Dashboard

### Se as tabelas existem mas estão vazias:

1. Execute os scripts de dados: `01-dados-basicos-corrigido.sql`
2. Execute outros scripts de dados conforme necessário
3. Verifique se os dados foram inseridos corretamente

## 📈 Interpretando os Resultados

### ✅ Tabela Existe

- A tabela foi criada com sucesso
- Pode ter dados ou estar vazia

### ❌ Tabela Falta

- A tabela não foi criada ainda
- Execute o script de setup para criá-la

### 📊 Percentual de Completude

- 0-50%: Sistema básico não configurado
- 51-80%: Estrutura parcialmente criada
- 81-99%: Quase completo, faltam poucas tabelas
- 100%: Sistema completamente configurado

## 🎯 Próximos Passos

1. **Se 0% completo:** Execute `00-setup-completo-sistema-corrigido.sql`
2. **Se 50-80% completo:** Execute os scripts de dados específicos
3. **Se 100% completo:** Sistema pronto para uso!

## 📝 Notas Importantes

- Execute os scripts de verificação regularmente
- Mantenha backup dos dados importantes
- Monitore o percentual de completude
- Use os scripts de verificação antes de fazer alterações importantes

---

**💡 Dica:** Use o script de verificação rápida (`verificacao-rapida-tabelas.sql`) para verificações
diárias e o script completo para análises detalhadas.
