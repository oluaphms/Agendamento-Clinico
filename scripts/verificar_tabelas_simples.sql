-- =====================================================
-- SCRIPT SIMPLES PARA VERIFICAR TABELAS NO SUPABASE
-- =====================================================
-- Execute este script no Supabase SQL Editor

-- 1. LISTAR TODAS AS TABELAS
SELECT 
    table_name as "Nome da Tabela",
    table_type as "Tipo"
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. CONTAR REGISTROS EM CADA TABELA
SELECT 
    'usuarios' as tabela,
    COUNT(*) as registros
FROM usuarios
UNION ALL
SELECT 
    'pacientes' as tabela,
    COUNT(*) as registros
FROM pacientes
UNION ALL
SELECT 
    'profissionais' as tabela,
    COUNT(*) as registros
FROM profissionais
UNION ALL
SELECT 
    'servicos' as tabela,
    COUNT(*) as registros
FROM servicos
UNION ALL
SELECT 
    'agendamentos' as tabela,
    COUNT(*) as registros
FROM agendamentos
UNION ALL
SELECT 
    'pagamentos' as tabela,
    COUNT(*) as registros
FROM pagamentos
UNION ALL
SELECT 
    'configuracoes' as tabela,
    COUNT(*) as registros
FROM configuracoes
UNION ALL
SELECT 
    'notificacoes' as tabela,
    COUNT(*) as registros
FROM notificacoes
UNION ALL
SELECT 
    'audit_log' as tabela,
    COUNT(*) as registros
FROM audit_log
UNION ALL
SELECT 
    'backups' as tabela,
    COUNT(*) as registros
FROM backups
UNION ALL
SELECT 
    'permissions' as tabela,
    COUNT(*) as registros
FROM permissions
UNION ALL
SELECT 
    'roles' as tabela,
    COUNT(*) as registros
FROM roles
UNION ALL
SELECT 
    'role_permissions' as tabela,
    COUNT(*) as registros
FROM role_permissions
UNION ALL
SELECT 
    'user_roles' as tabela,
    COUNT(*) as registros
FROM user_roles
ORDER BY tabela;
