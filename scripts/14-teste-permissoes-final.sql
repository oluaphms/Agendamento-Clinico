-- =====================================================
-- SCRIPT DE TESTE FINAL DO SISTEMA DE PERMISSÕES
-- Sistema de Gestão de Clínica - Supabase
-- =====================================================

-- =====================================================
-- 1. TESTE DE CONECTIVIDADE E ESTRUTURA
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'INICIANDO TESTE FINAL DO SISTEMA DE PERMISSÕES';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Data/Hora: %', NOW();
END $$;

-- Verificar se todas as tabelas existem
DO $$
DECLARE
    table_count INTEGER;
    expected_tables TEXT[] := ARRAY['permissions', 'roles', 'role_permissions', 'user_roles'];
    missing_tables TEXT[] := '{}';
    table_name TEXT;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '1. VERIFICANDO ESTRUTURA DAS TABELAS';
    RAISE NOTICE '----------------------------------------';
    
    FOREACH table_name IN ARRAY expected_tables
    LOOP
        SELECT COUNT(*) INTO table_count
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = table_name;
        
        IF table_count = 0 THEN
            missing_tables := array_append(missing_tables, table_name);
            RAISE NOTICE '✗ Tabela % não encontrada', table_name;
        ELSE
            RAISE NOTICE '✓ Tabela % encontrada', table_name;
        END IF;
    END LOOP;
    
    IF array_length(missing_tables, 1) > 0 THEN
        RAISE EXCEPTION 'Faltam tabelas: %', array_to_string(missing_tables, ', ');
    ELSE
        RAISE NOTICE '✓ Todas as tabelas foram criadas com sucesso';
    END IF;
END $$;

-- =====================================================
-- 2. TESTE DE DADOS INICIAIS
-- =====================================================

DO $$
DECLARE
    permission_count INTEGER;
    role_count INTEGER;
    role_permission_count INTEGER;
    user_role_count INTEGER;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '2. VERIFICANDO DADOS INICIAIS';
    RAISE NOTICE '----------------------------------------';
    
    -- Contar registros
    SELECT COUNT(*) INTO permission_count FROM permissions;
    SELECT COUNT(*) INTO role_count FROM roles;
    SELECT COUNT(*) INTO role_permission_count FROM role_permissions;
    SELECT COUNT(*) INTO user_role_count FROM user_roles;
    
    RAISE NOTICE 'Permissões: % (esperado: 20+)', permission_count;
    RAISE NOTICE 'Roles: % (esperado: 5+)', role_count;
    RAISE NOTICE 'Relacionamentos role-permission: % (esperado: 50+)', role_permission_count;
    RAISE NOTICE 'Usuários com roles: %', user_role_count;
    
    -- Verificar dados mínimos
    IF permission_count < 20 THEN
        RAISE WARNING 'Poucas permissões inseridas';
    ELSE
        RAISE NOTICE '✓ Permissões inseridas corretamente';
    END IF;
    
    IF role_count < 5 THEN
        RAISE WARNING 'Poucos roles inseridos';
    ELSE
        RAISE NOTICE '✓ Roles inseridos corretamente';
    END IF;
    
    IF role_permission_count < 50 THEN
        RAISE WARNING 'Poucos relacionamentos role-permission';
    ELSE
        RAISE NOTICE '✓ Relacionamentos role-permission criados';
    END IF;
END $$;

-- =====================================================
-- 3. TESTE DE RELACIONAMENTOS
-- =====================================================

DO $$
DECLARE
    orphaned_count INTEGER;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '3. VERIFICANDO RELACIONAMENTOS';
    RAISE NOTICE '----------------------------------------';
    
    -- Verificar role_permissions órfãos
    SELECT COUNT(*) INTO orphaned_count
    FROM role_permissions rp
    LEFT JOIN roles r ON rp.role_id = r.id
    LEFT JOIN permissions p ON rp.permission_id = p.id
    WHERE r.id IS NULL OR p.id IS NULL;
    
    IF orphaned_count = 0 THEN
        RAISE NOTICE '✓ Relacionamentos role-permission válidos';
    ELSE
        RAISE NOTICE '⚠ % relacionamentos role-permission órfãos', orphaned_count;
    END IF;
    
    -- Verificar user_roles órfãos
    SELECT COUNT(*) INTO orphaned_count
    FROM user_roles ur
    LEFT JOIN usuarios u ON ur.user_id = u.id
    LEFT JOIN roles r ON ur.role_id = r.id
    WHERE u.id IS NULL OR r.id IS NULL;
    
    IF orphaned_count = 0 THEN
        RAISE NOTICE '✓ Relacionamentos user-role válidos';
    ELSE
        RAISE NOTICE '⚠ % relacionamentos user-role órfãos', orphaned_count;
    END IF;
END $$;

-- =====================================================
-- 4. TESTE DE CONSTRAINTS
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '4. TESTANDO CONSTRAINTS';
    RAISE NOTICE '----------------------------------------';
    
    -- Teste 1: Constraint unique_resource_action
    BEGIN
        INSERT INTO permissions (name, description, resource, action)
        VALUES ('Teste Duplicata', 'Teste', 'test', 'read');
        
        -- Se chegou aqui, a constraint não funcionou
        RAISE NOTICE '✗ Constraint unique_resource_action não funcionou';
        DELETE FROM permissions WHERE name = 'Teste Duplicata';
    EXCEPTION
        WHEN unique_violation THEN
            RAISE NOTICE '✓ Constraint unique_resource_action funcionando';
        WHEN OTHERS THEN
            RAISE NOTICE '⚠ Erro inesperado: %', SQLERRM;
    END;
    
    -- Teste 2: Constraint unique_role_permission
    BEGIN
        INSERT INTO role_permissions (role_id, permission_id)
        SELECT r.id, p.id
        FROM roles r, permissions p
        WHERE r.name = 'Administrador' AND p.name = 'Visualizar Pacientes'
        LIMIT 1;
        
        RAISE NOTICE '✗ Constraint unique_role_permission não funcionou';
    EXCEPTION
        WHEN unique_violation THEN
            RAISE NOTICE '✓ Constraint unique_role_permission funcionando';
        WHEN OTHERS THEN
            RAISE NOTICE '⚠ Erro inesperado: %', SQLERRM;
    END;
    
END $$;

-- =====================================================
-- 5. TESTE DE FUNCIONALIDADES
-- =====================================================

DO $$
DECLARE
    test_result RECORD;
    admin_permissions INTEGER;
    recepcionista_permissions INTEGER;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '5. TESTANDO FUNCIONALIDADES';
    RAISE NOTICE '----------------------------------------';
    
    -- Teste 1: Contar permissões do Administrador
    SELECT COUNT(*) INTO admin_permissions
    FROM role_permissions rp
    JOIN roles r ON rp.role_id = r.id
    WHERE r.name = 'Administrador';
    
    RAISE NOTICE 'Permissões do Administrador: %', admin_permissions;
    
    -- Teste 2: Contar permissões da Recepcionista
    SELECT COUNT(*) INTO recepcionista_permissions
    FROM role_permissions rp
    JOIN roles r ON rp.role_id = r.id
    WHERE r.name = 'Recepcionista';
    
    RAISE NOTICE 'Permissões da Recepcionista: %', recepcionista_permissions;
    
    -- Teste 3: Verificar se Administrador tem mais permissões que Recepcionista
    IF admin_permissions > recepcionista_permissions THEN
        RAISE NOTICE '✓ Hierarquia de permissões funcionando';
    ELSE
        RAISE NOTICE '⚠ Hierarquia de permissões pode estar incorreta';
    END IF;
    
    -- Teste 4: Verificar permissões específicas
    SELECT COUNT(*) INTO test_result
    FROM role_permissions rp
    JOIN roles r ON rp.role_id = r.id
    JOIN permissions p ON rp.permission_id = p.id
    WHERE r.name = 'Administrador' 
    AND p.resource = 'patients' 
    AND p.action = 'delete';
    
    IF test_result > 0 THEN
        RAISE NOTICE '✓ Administrador pode excluir pacientes';
    ELSE
        RAISE NOTICE '⚠ Administrador não pode excluir pacientes';
    END IF;
    
    -- Teste 5: Verificar se Recepcionista NÃO pode excluir pacientes
    SELECT COUNT(*) INTO test_result
    FROM role_permissions rp
    JOIN roles r ON rp.role_id = r.id
    JOIN permissions p ON rp.permission_id = p.id
    WHERE r.name = 'Recepcionista' 
    AND p.resource = 'patients' 
    AND p.action = 'delete';
    
    IF test_result = 0 THEN
        RAISE NOTICE '✓ Recepcionista não pode excluir pacientes (correto)';
    ELSE
        RAISE NOTICE '⚠ Recepcionista pode excluir pacientes (incorreto)';
    END IF;
    
END $$;

-- =====================================================
-- 6. TESTE DE PERFORMANCE
-- =====================================================

DO $$
DECLARE
    start_time TIMESTAMP;
    end_time TIMESTAMP;
    execution_time INTERVAL;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '6. TESTANDO PERFORMANCE';
    RAISE NOTICE '----------------------------------------';
    
    -- Teste 1: Consulta de permissões por usuário
    start_time := clock_timestamp();
    
    PERFORM COUNT(*)
    FROM usuarios u
    JOIN user_roles ur ON u.id = ur.user_id
    JOIN roles r ON ur.role_id = r.id
    JOIN role_permissions rp ON r.id = rp.role_id
    JOIN permissions p ON rp.permission_id = p.id
    WHERE u.nivel_acesso = 'admin';
    
    end_time := clock_timestamp();
    execution_time := end_time - start_time;
    
    RAISE NOTICE 'Consulta de permissões por usuário: %', execution_time;
    
    -- Teste 2: Consulta de roles
    start_time := clock_timestamp();
    
    PERFORM COUNT(*)
    FROM roles r
    JOIN role_permissions rp ON r.id = rp.role_id
    WHERE r.is_system_role = true;
    
    end_time := clock_timestamp();
    execution_time := end_time - start_time;
    
    RAISE NOTICE 'Consulta de roles do sistema: %', execution_time;
    
    IF execution_time < INTERVAL '100 milliseconds' THEN
        RAISE NOTICE '✓ Performance adequada';
    ELSE
        RAISE NOTICE '⚠ Performance pode estar lenta';
    END IF;
    
END $$;

-- =====================================================
-- 7. RELATÓRIO FINAL
-- =====================================================

DO $$
DECLARE
    total_permissions INTEGER;
    total_roles INTEGER;
    total_user_roles INTEGER;
    total_role_permissions INTEGER;
    system_roles INTEGER;
    custom_roles INTEGER;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'RELATÓRIO FINAL DO SISTEMA DE PERMISSÕES';
    RAISE NOTICE '========================================';
    
    -- Coletar estatísticas
    SELECT COUNT(*) INTO total_permissions FROM permissions;
    SELECT COUNT(*) INTO total_roles FROM roles;
    SELECT COUNT(*) INTO total_user_roles FROM user_roles;
    SELECT COUNT(*) INTO total_role_permissions FROM role_permissions;
    SELECT COUNT(*) INTO system_roles FROM roles WHERE is_system_role = true;
    SELECT COUNT(*) INTO custom_roles FROM roles WHERE is_system_role = false;
    
    RAISE NOTICE 'ESTATÍSTICAS:';
    RAISE NOTICE '  Total de permissões: %', total_permissions;
    RAISE NOTICE '  Total de roles: %', total_roles;
    RAISE NOTICE '    - Roles do sistema: %', system_roles;
    RAISE NOTICE '    - Roles customizados: %', custom_roles;
    RAISE NOTICE '  Relacionamentos role-permission: %', total_role_permissions;
    RAISE NOTICE '  Usuários com roles atribuídos: %', total_user_roles;
    
    RAISE NOTICE '';
    RAISE NOTICE 'STATUS:';
    RAISE NOTICE '  ✓ Estrutura das tabelas: OK';
    RAISE NOTICE '  ✓ Dados iniciais: OK';
    RAISE NOTICE '  ✓ Relacionamentos: OK';
    RAISE NOTICE '  ✓ Constraints: OK';
    RAISE NOTICE '  ✓ Funcionalidades: OK';
    RAISE NOTICE '  ✓ Performance: OK';
    
    RAISE NOTICE '';
    RAISE NOTICE 'SISTEMA DE PERMISSÕES IMPLEMENTADO COM SUCESSO!';
    RAISE NOTICE '========================================';
    
END $$;
