# 🚀 Como Executar no Supabase SQL Editor

## ❌ **ERRO COMUM**
O comando `\i` não funciona no Supabase SQL Editor. Use o script correto abaixo.

## ✅ **SOLUÇÃO CORRETA**

### 1. **Acesse o Supabase SQL Editor**
- Vá para [https://supabase.com/dashboard](https://supabase.com/dashboard)
- Selecione seu projeto
- Clique em **SQL Editor** no menu lateral

### 2. **Execute o Script Completo**
Copie e cole o conteúdo do arquivo `scripts/setup-completo-supabase.sql` no editor SQL e execute.

**OU** execute este comando para copiar o conteúdo:

```bash
# No terminal do projeto
Get-Content scripts/setup-completo-supabase.sql | Set-Clipboard
```

### 3. **Verifique se Funcionou**
Após executar, você deve ver uma mensagem como:

```
SETUP COMPLETO FINALIZADO COM SUCESSO!
========================================
Usuários padrão criados: 4 de 4
Usuários com roles atribuídos: 4 de 4
Total de permissões no sistema: 30
Total de roles no sistema: 4
----------------------------------------
PERMISSÕES POR USUÁRIO:
Administrador: 30 permissões
Desenvolvedor: 30 permissões
Recepcionista: 15 permissões
Profissional: 12 permissões
----------------------------------------
CREDENCIAIS DE ACESSO:
Admin: CPF 111.111.111.11 | Senha: 111
Recepcionista: CPF 222.222.222.22 | Senha: 222
Desenvolvedor: CPF 333.333.333.33 | Senha: 333
Profissional: CPF 444.444.444.44 | Senha: 4444
----------------------------------------
ACESSO TOTAL: Administrador e Desenvolvedor
========================================
```

## 🔧 **O que o Script Faz**

1. **Cria o sistema de permissões completo**
2. **Atualiza a tabela usuarios** (adiciona nível 'desenvolvedor')
3. **Cria os 4 usuários padrão** com senhas criptografadas
4. **Atribui roles e permissões** apropriadas
5. **Gera relatório de verificação**

## 👥 **Usuários Criados**

| Usuário | CPF | Senha | Acesso |
|---------|-----|-------|--------|
| **Administrador** | 111.111.111.11 | 111 | Total |
| **Recepcionista** | 222.222.222.22 | 222 | Recepção |
| **Desenvolvedor** | 333.333.333.33 | 333 | Total |
| **Profissional** | 444.444.444.44 | 4444 | Profissional |

## 🚀 **Próximos Passos**

1. **Execute o script** no Supabase SQL Editor
2. **Verifique** se apareceu a mensagem de sucesso
3. **Inicie o projeto**: `npm run dev`
4. **Teste o login** com as credenciais acima

## 🆘 **Se Der Erro**

- **Erro de sintaxe**: Verifique se copiou o script completo
- **Erro de permissão**: Execute como administrador do projeto
- **Erro de tabela**: Verifique se a tabela `usuarios` existe

## 📞 **Suporte**

Se tiver problemas, verifique:
1. Se o arquivo `.env.local` está configurado
2. Se as credenciais do Supabase estão corretas
3. Se executou o script completo no SQL Editor
