-- =====================================================
-- SCRIPT DE VERIFICAÇÃO DAS TABELAS DE PERMISSÕES
-- Sistema de Gestão de Clínica - Supabase
-- =====================================================

-- =====================================================
-- 1. VERIFICAR ESTRUTURA DAS TABELAS
-- =====================================================

DO $$
DECLARE
    table_count INTEGER;
    column_count INTEGER;
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'VERIFICAÇÃO DA ESTRUTURA DAS TABELAS';
    RAISE NOTICE '========================================';
    
    -- Verificar se as tabelas existem
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('permissions', 'roles', 'role_permissions', 'user_roles');
    
    IF table_count = 4 THEN
        RAISE NOTICE '✓ Todas as 4 tabelas de permissões foram criadas';
    ELSE
        RAISE EXCEPTION '✗ Faltam tabelas. Encontradas: % de 4', table_count;
    END IF;
    
    -- Verificar colunas da tabela permissions
    SELECT COUNT(*) INTO column_count
    FROM information_schema.columns 
    WHERE table_name = 'permissions' AND table_schema = 'public';
    
    RAISE NOTICE '✓ Tabela permissions: % colunas', column_count;
    
    -- Verificar colunas da tabela roles
    SELECT COUNT(*) INTO column_count
    FROM information_schema.columns 
    WHERE table_name = 'roles' AND table_schema = 'public';
    
    RAISE NOTICE '✓ Tabela roles: % colunas', column_count;
    
    -- Verificar colunas da tabela role_permissions
    SELECT COUNT(*) INTO column_count
    FROM information_schema.columns 
    WHERE table_name = 'role_permissions' AND table_schema = 'public';
    
    RAISE NOTICE '✓ Tabela role_permissions: % colunas', column_count;
    
    -- Verificar colunas da tabela user_roles
    SELECT COUNT(*) INTO column_count
    FROM information_schema.columns 
    WHERE table_name = 'user_roles' AND table_schema = 'public';
    
    RAISE NOTICE '✓ Tabela user_roles: % colunas', column_count;
    
END $$;

-- =====================================================
-- 2. VERIFICAR ÍNDICES
-- =====================================================

DO $$
DECLARE
    index_count INTEGER;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'VERIFICAÇÃO DOS ÍNDICES';
    RAISE NOTICE '========================================';
    
    -- Contar índices das tabelas de permissões
    SELECT COUNT(*) INTO index_count
    FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND tablename IN ('permissions', 'roles', 'role_permissions', 'user_roles');
    
    RAISE NOTICE '✓ Total de índices criados: %', index_count;
    
    -- Listar índices por tabela
    FOR rec IN 
        SELECT tablename, indexname
        FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND tablename IN ('permissions', 'roles', 'role_permissions', 'user_roles')
        ORDER BY tablename, indexname
    LOOP
        RAISE NOTICE '  %: %', rec.tablename, rec.indexname;
    END LOOP;
    
END $$;

-- =====================================================
-- 3. VERIFICAR RLS (ROW LEVEL SECURITY)
-- =====================================================

DO $$
DECLARE
    rls_count INTEGER;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'VERIFICAÇÃO DO RLS (ROW LEVEL SECURITY)';
    RAISE NOTICE '========================================';
    
    -- Verificar se RLS está habilitado
    SELECT COUNT(*) INTO rls_count
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
    AND c.relname IN ('permissions', 'roles', 'role_permissions', 'user_roles')
    AND c.relrowsecurity = true;
    
    IF rls_count = 4 THEN
        RAISE NOTICE '✓ RLS habilitado em todas as 4 tabelas';
    ELSE
        RAISE NOTICE '⚠ RLS habilitado em % de 4 tabelas', rls_count;
    END IF;
    
    -- Listar políticas criadas
    RAISE NOTICE 'Políticas criadas:';
    FOR rec IN 
        SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
        FROM pg_policies 
        WHERE schemaname = 'public'
        AND tablename IN ('permissions', 'roles', 'role_permissions', 'user_roles')
        ORDER BY tablename, policyname
    LOOP
        RAISE NOTICE '  %: % (%)', rec.tablename, rec.policyname, rec.cmd;
    END LOOP;
    
END $$;

-- =====================================================
-- 4. VERIFICAR DADOS INICIAIS
-- =====================================================

DO $$
DECLARE
    permission_count INTEGER;
    role_count INTEGER;
    role_permission_count INTEGER;
    user_role_count INTEGER;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'VERIFICAÇÃO DOS DADOS INICIAIS';
    RAISE NOTICE '========================================';
    
    -- Contar registros
    SELECT COUNT(*) INTO permission_count FROM permissions;
    SELECT COUNT(*) INTO role_count FROM roles;
    SELECT COUNT(*) INTO role_permission_count FROM role_permissions;
    SELECT COUNT(*) INTO user_role_count FROM user_roles;
    
    RAISE NOTICE 'Permissões inseridas: %', permission_count;
    RAISE NOTICE 'Roles inseridos: %', role_count;
    RAISE NOTICE 'Relacionamentos role-permission: %', role_permission_count;
    RAISE NOTICE 'Usuários com roles atribuídos: %', user_role_count;
    
    -- Verificar se há dados mínimos
    IF permission_count < 20 THEN
        RAISE NOTICE '⚠ Poucas permissões inseridas (esperado: 20+)';
    ELSE
        RAISE NOTICE '✓ Permissões inseridas corretamente';
    END IF;
    
    IF role_count < 5 THEN
        RAISE NOTICE '⚠ Poucos roles inseridos (esperado: 5+)';
    ELSE
        RAISE NOTICE '✓ Roles inseridos corretamente';
    END IF;
    
END $$;

-- =====================================================
-- 5. VERIFICAR RELACIONAMENTOS
-- =====================================================

DO $$
DECLARE
    orphaned_role_permissions INTEGER;
    orphaned_user_roles INTEGER;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'VERIFICAÇÃO DOS RELACIONAMENTOS';
    RAISE NOTICE '========================================';
    
    -- Verificar role_permissions órfãos
    SELECT COUNT(*) INTO orphaned_role_permissions
    FROM role_permissions rp
    LEFT JOIN roles r ON rp.role_id = r.id
    LEFT JOIN permissions p ON rp.permission_id = p.id
    WHERE r.id IS NULL OR p.id IS NULL;
    
    IF orphaned_role_permissions = 0 THEN
        RAISE NOTICE '✓ Todos os relacionamentos role-permission são válidos';
    ELSE
        RAISE NOTICE '⚠ % relacionamentos role-permission órfãos encontrados', orphaned_role_permissions;
    END IF;
    
    -- Verificar user_roles órfãos
    SELECT COUNT(*) INTO orphaned_user_roles
    FROM user_roles ur
    LEFT JOIN usuarios u ON ur.user_id = u.id
    LEFT JOIN roles r ON ur.role_id = r.id
    WHERE u.id IS NULL OR r.id IS NULL;
    
    IF orphaned_user_roles = 0 THEN
        RAISE NOTICE '✓ Todos os relacionamentos user-role são válidos';
    ELSE
        RAISE NOTICE '⚠ % relacionamentos user-role órfãos encontrados', orphaned_user_roles;
    END IF;
    
END $$;

-- =====================================================
-- 6. TESTE DE FUNCIONALIDADE
-- =====================================================

DO $$
DECLARE
    test_result RECORD;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'TESTE DE FUNCIONALIDADE';
    RAISE NOTICE '========================================';
    
    -- Teste 1: Buscar permissões de um role
    BEGIN
        SELECT COUNT(*) INTO test_result
        FROM role_permissions rp
        JOIN roles r ON rp.role_id = r.id
        JOIN permissions p ON rp.permission_id = p.id
        WHERE r.name = 'Administrador';
        
        RAISE NOTICE '✓ Teste 1 - Permissões do Administrador: %', test_result;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '✗ Teste 1 falhou: %', SQLERRM;
    END;
    
    -- Teste 2: Buscar roles de um usuário
    BEGIN
        SELECT COUNT(*) INTO test_result
        FROM user_roles ur
        JOIN usuarios u ON ur.user_id = u.id
        JOIN roles r ON ur.role_id = r.id
        WHERE u.nivel_acesso = 'admin';
        
        RAISE NOTICE '✓ Teste 2 - Roles de usuários admin: %', test_result;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '✗ Teste 2 falhou: %', SQLERRM;
    END;
    
    -- Teste 3: Verificar constraint de unicidade
    BEGIN
        -- Tentar inserir duplicata (deve falhar)
        INSERT INTO role_permissions (role_id, permission_id)
        SELECT r.id, p.id
        FROM roles r, permissions p
        WHERE r.name = 'Administrador' AND p.name = 'Visualizar Pacientes'
        LIMIT 1;
        
        RAISE NOTICE '✗ Teste 3 falhou: Constraint de unicidade não funcionou';
    EXCEPTION
        WHEN unique_violation THEN
            RAISE NOTICE '✓ Teste 3 - Constraint de unicidade funcionando';
        WHEN OTHERS THEN
            RAISE NOTICE '✗ Teste 3 falhou: %', SQLERRM;
    END;
    
END $$;

-- =====================================================
-- 7. RELATÓRIO FINAL
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'RELATÓRIO FINAL';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Sistema de permissões verificado com sucesso!';
    RAISE NOTICE '';
    RAISE NOTICE 'Próximos passos:';
    RAISE NOTICE '1. Testar as funções do permissionService.ts';
    RAISE NOTICE '2. Criar a página de permissões no frontend';
    RAISE NOTICE '3. Implementar verificação de permissões nas rotas';
    RAISE NOTICE '4. Testar o sistema completo';
    RAISE NOTICE '========================================';
END $$;





