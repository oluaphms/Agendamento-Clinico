-- =====================================================
-- SCRIPT DE LIMPEZA DE DADOS DE EXEMPLO
-- =====================================================
-- Este script remove todos os dados de exemplo
-- Execute APENAS se quiser limpar o banco

-- =====================================================
-- AVISO IMPORTANTE
-- =====================================================
-- Este script REMOVE TODOS os dados de exemplo
-- Certifique-se de que:
-- 1. Você quer realmente limpar o banco
-- 2. Fez backup dos dados importantes
-- 3. Não há dados de produção no banco
-- 4. Tem permissão para executar scripts

-- =====================================================
-- 1. REMOVER DADOS DE EXEMPLO
-- =====================================================

-- Remover notificações
DELETE FROM notificacoes;

-- Remover pagamentos
DELETE FROM pagamentos;

-- Remover agendamentos
DELETE FROM agendamentos;

-- Remover permissões específicas de usuários
DELETE FROM usuario_permissoes;

-- Remover permissões por nível
DELETE FROM nivel_permissoes;

-- Remover permissões
DELETE FROM permissoes;

-- Remover configurações (exceto as básicas)
DELETE FROM configuracoes WHERE chave NOT IN (
    'sistema', 'notificacoes', 'seguranca', 'interface', 'backup'
);

-- Remover serviços (exceto os básicos)
DELETE FROM servicos WHERE nome NOT IN (
    'Consulta Médica', 'Exame de Sangue', 'Ultrassom', 
    'Eletrocardiograma', 'Consulta de Retorno'
);

-- Remover profissionais
DELETE FROM profissionais;

-- Remover pacientes
DELETE FROM pacientes;

-- Remover usuários (exceto os básicos)
DELETE FROM usuarios WHERE email NOT IN (
    'admin@clinica.com', 'recepcao@clinica.com', 'dev@clinica.com'
);

-- Remover backups
DELETE FROM backups;

-- Remover logs de auditoria
DELETE FROM audit_log;

-- =====================================================
-- 2. VERIFICAÇÃO DE LIMPEZA
-- =====================================================

-- Verificar contagem de registros após limpeza
SELECT 
    'Contagem Após Limpeza' as categoria,
    'usuarios' as tabela,
    COUNT(*) as total
FROM usuarios
UNION ALL
SELECT 
    'Contagem Após Limpeza' as categoria,
    'pacientes' as tabela,
    COUNT(*) as total
FROM pacientes
UNION ALL
SELECT 
    'Contagem Após Limpeza' as categoria,
    'profissionais' as tabela,
    COUNT(*) as total
FROM profissionais
UNION ALL
SELECT 
    'Contagem Após Limpeza' as categoria,
    'servicos' as tabela,
    COUNT(*) as total
FROM servicos
UNION ALL
SELECT 
    'Contagem Após Limpeza' as categoria,
    'agendamentos' as tabela,
    COUNT(*) as total
FROM agendamentos
UNION ALL
SELECT 
    'Contagem Após Limpeza' as categoria,
    'pagamentos' as tabela,
    COUNT(*) as total
FROM pagamentos
UNION ALL
SELECT 
    'Contagem Após Limpeza' as categoria,
    'configuracoes' as tabela,
    COUNT(*) as total
FROM configuracoes
UNION ALL
SELECT 
    'Contagem Após Limpeza' as categoria,
    'notificacoes' as tabela,
    COUNT(*) as total
FROM notificacoes
UNION ALL
SELECT 
    'Contagem Após Limpeza' as categoria,
    'permissoes' as tabela,
    COUNT(*) as total
FROM permissoes
ORDER BY tabela;

-- =====================================================
-- 3. RESETAR SEQUÊNCIAS (SE NECESSÁRIO)
-- =====================================================

-- Resetar sequências para IDs auto-incrementais
-- (Apenas se estiver usando IDs numéricos)
-- ALTER SEQUENCE profissionais_id_seq RESTART WITH 1;
-- ALTER SEQUENCE servicos_id_seq RESTART WITH 1;

-- =====================================================
-- FIM DO SCRIPT DE LIMPEZA
-- =====================================================

-- Este script remove todos os dados de exemplo
-- Mantém apenas:
-- - Usuários básicos (admin, recepcao, dev)
-- - Serviços básicos
-- - Configurações básicas
-- - Estrutura das tabelas
