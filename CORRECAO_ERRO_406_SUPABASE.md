# Correção do Erro 406 no Supabase

## Problema Identificado

O erro 406 (Not Acceptable) estava ocorrendo na consulta:

```
xvjjgeoxsvzwcvjihjia.supabase.co/rest/v1/usuarios?select=*&cpf=eq.55555555555&status=eq.ativo
```

### Causa Raiz

As políticas RLS (Row Level Security) estavam configuradas de forma muito restritiva, permitindo
apenas que usuários autenticados vejam seus próprios dados. Isso impedia a busca por CPF necessária
para o processo de autenticação.

## Soluções Implementadas

### 1. Script SQL para Corrigir Políticas RLS

Execute o arquivo `fix-auth-policies.sql` no seu banco Supabase:

```sql
-- Este script:
-- 1. Remove políticas conflitantes existentes
-- 2. Cria política permissiva para busca por CPF (autenticação)
-- 3. Mantém segurança para outras operações
-- 4. Permite inserção de novos usuários
-- 5. Permite atualização de senhas
```

### 2. Melhorias no Código JavaScript

#### Arquivo: `src/lib/supabase.ts`

- ✅ Adicionada função `checkSupabaseConnection()` para verificar conectividade
- ✅ Melhorado tratamento de erros com detalhes específicos
- ✅ Substituído `.single()` por `.maybeSingle()` para evitar erros quando usuário não é encontrado
- ✅ Adicionado fallback automático para banco local quando Supabase falha
- ✅ Melhorada limpeza do CPF antes da busca

### 3. Como Aplicar as Correções

#### Passo 1: Executar Script SQL

1. Acesse o painel do Supabase
2. Vá para "SQL Editor"
3. Execute o conteúdo do arquivo `fix-auth-policies.sql`

#### Passo 2: Verificar Configuração

Certifique-se de que as variáveis de ambiente estão corretas:

```env
VITE_SUPABASE_URL=https://xvjjgeoxsvzwcvjihjia.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
```

#### Passo 3: Testar o Sistema

1. Limpe o cache do navegador
2. Tente fazer login novamente
3. O sistema agora deve:
   - Tentar conectar ao Supabase primeiro
   - Se falhar, usar automaticamente o banco local
   - Não mais exigir atualização da página

### 4. Benefícios das Correções

- ✅ **Resolução do Erro 406**: Políticas RLS corrigidas
- ✅ **Fallback Robusto**: Sistema funciona mesmo se Supabase estiver indisponível
- ✅ **Melhor UX**: Não precisa mais atualizar a página
- ✅ **Logs Detalhados**: Melhor debugging de problemas
- ✅ **Verificação de Conectividade**: Detecta problemas de rede automaticamente

### 5. Monitoramento

Após aplicar as correções, monitore os logs do console para:

- Mensagens de conectividade do Supabase
- Fallbacks para banco local
- Erros de autenticação específicos

### 6. Arquivos Modificados

- `fix-auth-policies.sql` (novo)
- `src/lib/supabase.ts` (modificado)
- `CORRECAO_ERRO_406_SUPABASE.md` (este arquivo)

---

**Status**: ✅ Implementado e pronto para aplicação **Prioridade**: Alta - Resolve problema crítico
de autenticação



