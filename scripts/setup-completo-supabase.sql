-- =====================================================
-- SETUP COMPLETO DO SISTEMA PARA SUPABASE
-- =====================================================
-- Este script contém todos os comandos necessários para configurar
-- o sistema completo no Supabase SQL Editor

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 1. SISTEMA DE PERMISSÕES
-- =====================================================

-- REMOVER TABELAS EXISTENTES (SE EXISTIREM)
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS role_permissions CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS permissions CASCADE;

-- CRIAR TABELAS DE PERMISSÕES COM UUID
-- Tabela de permissões
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    resource VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_resource_action UNIQUE (resource, action)
);

-- Tabela de roles
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_system_role BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de relacionamento role-permissions
CREATE TABLE role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_role_permission UNIQUE (role_id, permission_id)
);

-- Tabela de relacionamento user-roles
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_user_role UNIQUE (user_id, role_id)
);

-- CRIAR ÍNDICES
CREATE INDEX idx_permissions_resource ON permissions(resource);
CREATE INDEX idx_permissions_action ON permissions(action);
CREATE INDEX idx_permissions_resource_action ON permissions(resource, action);
CREATE INDEX idx_roles_name ON roles(name);
CREATE INDEX idx_roles_system ON roles(is_system_role);
CREATE INDEX idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX idx_role_permissions_permission_id ON role_permissions(permission_id);
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX idx_user_roles_assigned_by ON user_roles(assigned_by);

-- CONFIGURAR ROW LEVEL SECURITY
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Políticas para permissions
CREATE POLICY "Todos podem visualizar permissões" ON permissions
    FOR SELECT USING (true);

CREATE POLICY "Apenas admins podem gerenciar permissões" ON permissions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid() AND nivel_acesso = 'admin'
        )
    );

-- Políticas para roles
CREATE POLICY "Todos podem visualizar roles" ON roles
    FOR SELECT USING (true);

CREATE POLICY "Apenas admins podem gerenciar roles" ON roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid() AND nivel_acesso = 'admin'
        )
    );

-- Políticas para role_permissions
CREATE POLICY "Todos podem visualizar role_permissions" ON role_permissions
    FOR SELECT USING (true);

CREATE POLICY "Apenas admins podem gerenciar role_permissions" ON role_permissions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid() AND nivel_acesso = 'admin'
        )
    );

-- Políticas para user_roles
CREATE POLICY "Usuários podem ver seus próprios roles" ON user_roles
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Apenas admins podem gerenciar user_roles" ON user_roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid() AND nivel_acesso = 'admin'
        )
    );

-- CRIAR FUNÇÕES E TRIGGERS
-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_permissions_updated_at 
    BEFORE UPDATE ON permissions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roles_updated_at 
    BEFORE UPDATE ON roles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_roles_updated_at 
    BEFORE UPDATE ON user_roles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- INSERIR PERMISSÕES BÁSICAS
INSERT INTO permissions (name, description, resource, action) VALUES
('Visualizar Pacientes', 'Permite visualizar a lista de pacientes', 'patients', 'read'),
('Criar Pacientes', 'Permite criar novos pacientes', 'patients', 'create'),
('Editar Pacientes', 'Permite editar informações de pacientes', 'patients', 'update'),
('Excluir Pacientes', 'Permite excluir pacientes', 'patients', 'delete'),
('Visualizar Profissionais', 'Permite visualizar a lista de profissionais', 'professionals', 'read'),
('Criar Profissionais', 'Permite criar novos profissionais', 'professionals', 'create'),
('Editar Profissionais', 'Permite editar informações de profissionais', 'professionals', 'update'),
('Excluir Profissionais', 'Permite excluir profissionais', 'professionals', 'delete'),
('Visualizar Agenda', 'Permite visualizar a agenda', 'schedule', 'read'),
('Criar Agendamentos', 'Permite criar novos agendamentos', 'schedule', 'create'),
('Editar Agendamentos', 'Permite editar agendamentos', 'schedule', 'update'),
('Cancelar Agendamentos', 'Permite cancelar agendamentos', 'schedule', 'cancel'),
('Visualizar Serviços', 'Permite visualizar a lista de serviços', 'services', 'read'),
('Criar Serviços', 'Permite criar novos serviços', 'services', 'create'),
('Editar Serviços', 'Permite editar informações de serviços', 'services', 'update'),
('Excluir Serviços', 'Permite excluir serviços', 'services', 'delete'),
('Visualizar Relatórios', 'Permite visualizar relatórios', 'reports', 'read'),
('Exportar Relatórios', 'Permite exportar relatórios', 'reports', 'export'),
('Visualizar Usuários', 'Permite visualizar a lista de usuários', 'users', 'read'),
('Criar Usuários', 'Permite criar novos usuários', 'users', 'create'),
('Editar Usuários', 'Permite editar informações de usuários', 'users', 'update'),
('Excluir Usuários', 'Permite excluir usuários', 'users', 'delete'),
('Visualizar Configurações', 'Permite visualizar configurações do sistema', 'settings', 'read'),
('Editar Configurações', 'Permite editar configurações do sistema', 'settings', 'update'),
('Visualizar Backup', 'Permite visualizar backups', 'backup', 'read'),
('Criar Backup', 'Permite criar backups', 'backup', 'create'),
('Restaurar Backup', 'Permite restaurar backups', 'backup', 'restore'),
('Visualizar Permissões', 'Permite visualizar permissões e roles', 'permissions', 'read'),
('Gerenciar Permissões', 'Permite gerenciar permissões e roles', 'permissions', 'manage'),
('Visualizar Notificações', 'Permite visualizar notificações', 'notifications', 'read'),
('Gerenciar Notificações', 'Permite gerenciar notificações', 'notifications', 'manage');

-- INSERIR ROLES BÁSICOS
INSERT INTO roles (name, description, is_system_role) VALUES
('Administrador', 'Acesso completo ao sistema', true),
('Recepcionista', 'Acesso de recepção', true),
('Profissional de Saúde', 'Acesso médico/profissional', true),
('Desenvolvedor', 'Acesso de desenvolvimento', true);

-- ATRIBUIR PERMISSÕES AOS ROLES
-- Administrador - todas as permissões
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Administrador';

-- Recepcionista - permissões de recepção
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Recepcionista'
AND (
    (p.resource = 'patients' AND p.action IN ('read', 'create', 'update'))
    OR (p.resource = 'schedule' AND p.action IN ('read', 'create', 'update', 'cancel'))
    OR (p.resource = 'services' AND p.action = 'read')
    OR (p.resource = 'reports' AND p.action = 'read')
    OR (p.resource = 'notifications' AND p.action = 'read')
);

-- Profissional de Saúde - permissões médicas
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Profissional de Saúde'
AND (
    (p.resource = 'patients' AND p.action IN ('read', 'update'))
    OR (p.resource = 'schedule' AND p.action IN ('read', 'update'))
    OR (p.resource = 'services' AND p.action = 'read')
    OR (p.resource = 'reports' AND p.action IN ('read', 'export'))
    OR (p.resource = 'notifications' AND p.action = 'read')
);

-- Desenvolvedor - acesso total ao sistema (igual ao administrador)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Desenvolvedor';

-- =====================================================
-- 2. ATUALIZAR SCHEMA DA TABELA USUARIOS
-- =====================================================

-- Adicionar 'desenvolvedor' ao ENUM nivel_acesso se não existir
DO $$
BEGIN
    -- Verificar se o valor 'desenvolvedor' já existe no ENUM
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'desenvolvedor' 
        AND enumtypid = (
            SELECT oid FROM pg_type WHERE typname = 'nivel_acesso'
        )
    ) THEN
        -- Adicionar 'desenvolvedor' ao ENUM existente
        ALTER TYPE nivel_acesso ADD VALUE 'desenvolvedor';
        RAISE NOTICE 'Valor "desenvolvedor" adicionado ao ENUM nivel_acesso';
    ELSE
        RAISE NOTICE 'Valor "desenvolvedor" já existe no ENUM nivel_acesso';
    END IF;
END $$;

-- =====================================================
-- 3. CRIAR USUÁRIOS PADRÃO
-- =====================================================

-- Inserir usuário Administrador
INSERT INTO usuarios (
    id,
    nome,
    email,
    cpf,
    telefone,
    cargo,
    nivel_acesso,
    status,
    senha_hash,
    primeiro_acesso,
    created_at,
    updated_at
) VALUES (
    uuid_generate_v4(),
    'Administrador do Sistema',
    'admin@sistemaclinico.com',
    '111.111.111.11',
    '(11) 99999-1111',
    'Administrador',
    'admin',
    'ativo',
    crypt('111', gen_salt('bf')),
    false,
    NOW(),
    NOW()
) ON CONFLICT (cpf) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    nivel_acesso = EXCLUDED.nivel_acesso,
    status = EXCLUDED.status,
    senha_hash = EXCLUDED.senha_hash,
    updated_at = NOW();

-- Inserir usuário Recepcionista
INSERT INTO usuarios (
    id,
    nome,
    email,
    cpf,
    telefone,
    cargo,
    nivel_acesso,
    status,
    senha_hash,
    primeiro_acesso,
    created_at,
    updated_at
) VALUES (
    uuid_generate_v4(),
    'Recepcionista',
    'recepcao@sistemaclinico.com',
    '222.222.222.22',
    '(11) 99999-2222',
    'Recepcionista',
    'recepcao',
    'ativo',
    crypt('222', gen_salt('bf')),
    false,
    NOW(),
    NOW()
) ON CONFLICT (cpf) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    nivel_acesso = EXCLUDED.nivel_acesso,
    status = EXCLUDED.status,
    senha_hash = EXCLUDED.senha_hash,
    updated_at = NOW();

-- Inserir usuário Desenvolvedor
INSERT INTO usuarios (
    id,
    nome,
    email,
    cpf,
    telefone,
    cargo,
    nivel_acesso,
    status,
    senha_hash,
    primeiro_acesso,
    created_at,
    updated_at
) VALUES (
    uuid_generate_v4(),
    'Desenvolvedor do Sistema',
    'dev@sistemaclinico.com',
    '333.333.333.33',
    '(11) 99999-3333',
    'Desenvolvedor',
    'desenvolvedor',
    'ativo',
    crypt('333', gen_salt('bf')),
    false,
    NOW(),
    NOW()
) ON CONFLICT (cpf) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    nivel_acesso = EXCLUDED.nivel_acesso,
    status = EXCLUDED.status,
    senha_hash = EXCLUDED.senha_hash,
    updated_at = NOW();

-- Inserir usuário Profissional
INSERT INTO usuarios (
    id,
    nome,
    email,
    cpf,
    telefone,
    cargo,
    nivel_acesso,
    status,
    senha_hash,
    primeiro_acesso,
    created_at,
    updated_at
) VALUES (
    uuid_generate_v4(),
    'Profissional de Saúde',
    'profissional@sistemaclinico.com',
    '444.444.444.44',
    '(11) 99999-4444',
    'Profissional de Saúde',
    'profissional',
    'ativo',
    crypt('4444', gen_salt('bf')),
    false,
    NOW(),
    NOW()
) ON CONFLICT (cpf) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    nivel_acesso = EXCLUDED.nivel_acesso,
    status = EXCLUDED.status,
    senha_hash = EXCLUDED.senha_hash,
    updated_at = NOW();

-- =====================================================
-- 4. ATRIBUIR ROLES AOS USUÁRIOS PADRÃO
-- =====================================================

-- Atribuir role de Administrador ao usuário admin
INSERT INTO user_roles (user_id, role_id, assigned_by)
SELECT 
    u.id,
    r.id,
    u.id
FROM usuarios u, roles r
WHERE u.cpf = '111.111.111.11'
AND r.name = 'Administrador'
AND NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = u.id AND ur.role_id = r.id
);

-- Atribuir role de Recepcionista ao usuário recepcionista
INSERT INTO user_roles (user_id, role_id, assigned_by)
SELECT 
    u.id,
    r.id,
    (SELECT id FROM usuarios WHERE cpf = '111.111.111.11' LIMIT 1)
FROM usuarios u, roles r
WHERE u.cpf = '222.222.222.22'
AND r.name = 'Recepcionista'
AND NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = u.id AND ur.role_id = r.id
);

-- Atribuir role de Desenvolvedor ao usuário desenvolvedor
INSERT INTO user_roles (user_id, role_id, assigned_by)
SELECT 
    u.id,
    r.id,
    (SELECT id FROM usuarios WHERE cpf = '111.111.111.11' LIMIT 1)
FROM usuarios u, roles r
WHERE u.cpf = '333.333.333.33'
AND r.name = 'Desenvolvedor'
AND NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = u.id AND ur.role_id = r.id
);

-- Atribuir role de Profissional de Saúde ao usuário profissional
INSERT INTO user_roles (user_id, role_id, assigned_by)
SELECT 
    u.id,
    r.id,
    (SELECT id FROM usuarios WHERE cpf = '111.111.111.11' LIMIT 1)
FROM usuarios u, roles r
WHERE u.cpf = '444.444.444.44'
AND r.name = 'Profissional de Saúde'
AND NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = u.id AND ur.role_id = r.id
);

-- =====================================================
-- 5. VERIFICAÇÃO E RELATÓRIO FINAL
-- =====================================================

DO $$
DECLARE
    total_usuarios INTEGER;
    usuarios_com_roles INTEGER;
    total_permissoes INTEGER;
    total_roles INTEGER;
    admin_permissoes INTEGER;
    dev_permissoes INTEGER;
    recepcao_permissoes INTEGER;
    prof_permissoes INTEGER;
BEGIN
    -- Contar usuários padrão
    SELECT COUNT(*) INTO total_usuarios 
    FROM usuarios 
    WHERE cpf IN ('111.111.111.11', '222.222.222.22', '333.333.333.33', '444.444.444.44');
    
    -- Contar usuários com roles
    SELECT COUNT(DISTINCT u.id) INTO usuarios_com_roles
    FROM usuarios u
    JOIN user_roles ur ON u.id = ur.user_id
    WHERE u.cpf IN ('111.111.111.11', '222.222.222.22', '333.333.333.33', '444.444.444.44');
    
    -- Contar permissões e roles
    SELECT COUNT(*) INTO total_permissoes FROM permissions;
    SELECT COUNT(*) INTO total_roles FROM roles;
    
    -- Contar permissões por usuário
    SELECT COUNT(DISTINCT p.id) INTO admin_permissoes
    FROM usuarios u
    JOIN user_roles ur ON u.id = ur.user_id
    JOIN roles r ON ur.role_id = r.id
    JOIN role_permissions rp ON r.id = rp.role_id
    JOIN permissions p ON rp.permission_id = p.id
    WHERE u.cpf = '111.111.111.11';
    
    SELECT COUNT(DISTINCT p.id) INTO dev_permissoes
    FROM usuarios u
    JOIN user_roles ur ON u.id = ur.user_id
    JOIN roles r ON ur.role_id = r.id
    JOIN role_permissions rp ON r.id = rp.role_id
    JOIN permissions p ON rp.permission_id = p.id
    WHERE u.cpf = '333.333.333.33';
    
    SELECT COUNT(DISTINCT p.id) INTO recepcao_permissoes
    FROM usuarios u
    JOIN user_roles ur ON u.id = ur.user_id
    JOIN roles r ON ur.role_id = r.id
    JOIN role_permissions rp ON r.id = rp.role_id
    JOIN permissions p ON rp.permission_id = p.id
    WHERE u.cpf = '222.222.222.22';
    
    SELECT COUNT(DISTINCT p.id) INTO prof_permissoes
    FROM usuarios u
    JOIN user_roles ur ON u.id = ur.user_id
    JOIN roles r ON ur.role_id = r.id
    JOIN role_permissions rp ON r.id = rp.role_id
    JOIN permissions p ON rp.permission_id = p.id
    WHERE u.cpf = '444.444.444.44';
    
    -- Relatório final
    RAISE NOTICE '========================================';
    RAISE NOTICE 'SETUP COMPLETO FINALIZADO COM SUCESSO!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Usuários padrão criados: % de 4', total_usuarios;
    RAISE NOTICE 'Usuários com roles atribuídos: % de 4', usuarios_com_roles;
    RAISE NOTICE 'Total de permissões no sistema: %', total_permissoes;
    RAISE NOTICE 'Total de roles no sistema: %', total_roles;
    RAISE NOTICE '----------------------------------------';
    RAISE NOTICE 'PERMISSÕES POR USUÁRIO:';
    RAISE NOTICE 'Administrador: % permissões', admin_permissoes;
    RAISE NOTICE 'Desenvolvedor: % permissões', dev_permissoes;
    RAISE NOTICE 'Recepcionista: % permissões', recepcao_permissoes;
    RAISE NOTICE 'Profissional: % permissões', prof_permissoes;
    RAISE NOTICE '----------------------------------------';
    RAISE NOTICE 'CREDENCIAIS DE ACESSO:';
    RAISE NOTICE 'Admin: CPF 111.111.111.11 | Senha: 111';
    RAISE NOTICE 'Recepcionista: CPF 222.222.222.22 | Senha: 222';
    RAISE NOTICE 'Desenvolvedor: CPF 333.333.333.33 | Senha: 333';
    RAISE NOTICE 'Profissional: CPF 444.444.444.44 | Senha: 4444';
    RAISE NOTICE '----------------------------------------';
    RAISE NOTICE 'ACESSO TOTAL: Administrador e Desenvolvedor';
    RAISE NOTICE '========================================';
END $$;
