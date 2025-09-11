-- =====================================================
-- SCRIPT DE PERMISSÕES COM INTEGER PARA SUPABASE
-- Sistema de Gestão de Clínica
-- =====================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- CRIAR TABELAS DE PERMISSÕES COM INTEGER
-- =====================================================

-- Tabela de permissões
CREATE TABLE IF NOT EXISTS permissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    resource VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_resource_action UNIQUE (resource, action)
);

-- Tabela de roles
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_system_role BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de relacionamento role-permissions
CREATE TABLE IF NOT EXISTS role_permissions (
    id SERIAL PRIMARY KEY,
    role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id INTEGER NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_role_permission UNIQUE (role_id, permission_id)
);

-- Tabela de relacionamento user-roles
CREATE TABLE IF NOT EXISTS user_roles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_by INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_user_role UNIQUE (user_id, role_id)
);

-- =====================================================
-- CRIAR ÍNDICES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_permissions_resource ON permissions(resource);
CREATE INDEX IF NOT EXISTS idx_permissions_action ON permissions(action);
CREATE INDEX IF NOT EXISTS idx_permissions_resource_action ON permissions(resource, action);
CREATE INDEX IF NOT EXISTS idx_roles_name ON roles(name);
CREATE INDEX IF NOT EXISTS idx_roles_system ON roles(is_system_role);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON role_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_assigned_by ON user_roles(assigned_by);

-- =====================================================
-- CONFIGURAR ROW LEVEL SECURITY
-- =====================================================

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

-- =====================================================
-- CRIAR FUNÇÕES E TRIGGERS
-- =====================================================

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

-- =====================================================
-- INSERIR PERMISSÕES BÁSICAS
-- =====================================================

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

-- =====================================================
-- INSERIR ROLES BÁSICOS
-- =====================================================

INSERT INTO roles (name, description, is_system_role) VALUES
('Administrador', 'Acesso completo ao sistema', true),
('Gerente', 'Acesso de gerenciamento', true),
('Recepcionista', 'Acesso de recepção', true),
('Profissional de Saúde', 'Acesso médico/profissional', true),
('Usuário', 'Acesso básico', true);

-- =====================================================
-- ATRIBUIR PERMISSÕES AOS ROLES
-- =====================================================

-- Administrador - todas as permissões
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Administrador';

-- Gerente - permissões de gerenciamento (exceto permissões e backup)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Gerente'
AND p.resource NOT IN ('permissions', 'backup');

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

-- Usuário - permissões básicas
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Usuário'
AND (
    (p.resource = 'patients' AND p.action = 'read')
    OR (p.resource = 'schedule' AND p.action = 'read')
    OR (p.resource = 'services' AND p.action = 'read')
    OR (p.resource = 'notifications' AND p.action = 'read')
);

-- =====================================================
-- ATRIBUIR ROLES A USUÁRIOS EXISTENTES
-- =====================================================

-- Atribuir role de Administrador ao primeiro usuário admin
INSERT INTO user_roles (user_id, role_id, assigned_by)
SELECT 
    u.id,
    r.id,
    u.id
FROM usuarios u, roles r
WHERE u.nivel_acesso = 'admin'
AND r.name = 'Administrador'
AND NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = u.id AND ur.role_id = r.id
)
LIMIT 1;

-- Atribuir role de Recepcionista aos usuários de recepção
INSERT INTO user_roles (user_id, role_id, assigned_by)
SELECT 
    u.id,
    r.id,
    (SELECT id FROM usuarios WHERE nivel_acesso = 'admin' LIMIT 1)
FROM usuarios u, roles r
WHERE u.nivel_acesso = 'recepcao'
AND r.name = 'Recepcionista'
AND NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = u.id AND ur.role_id = r.id
);

-- Atribuir role de Profissional de Saúde aos profissionais
INSERT INTO user_roles (user_id, role_id, assigned_by)
SELECT 
    u.id,
    r.id,
    (SELECT id FROM usuarios WHERE nivel_acesso = 'admin' LIMIT 1)
FROM usuarios u, roles r
WHERE u.nivel_acesso = 'profissional'
AND r.name = 'Profissional de Saúde'
AND NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = u.id AND ur.role_id = r.id
);

-- Atribuir role de Gerente aos gerentes
INSERT INTO user_roles (user_id, role_id, assigned_by)
SELECT 
    u.id,
    r.id,
    (SELECT id FROM usuarios WHERE nivel_acesso = 'admin' LIMIT 1)
FROM usuarios u, roles r
WHERE u.nivel_acesso = 'gerente'
AND r.name = 'Gerente'
AND NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = u.id AND ur.role_id = r.id
);

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

DO $$
DECLARE
    table_count INTEGER;
    permission_count INTEGER;
    role_count INTEGER;
    role_permission_count INTEGER;
    user_role_count INTEGER;
BEGIN
    -- Verificar se todas as tabelas existem
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('permissions', 'roles', 'role_permissions', 'user_roles');
    
    IF table_count = 4 THEN
        RAISE NOTICE 'Todas as 4 tabelas de permissões foram criadas';
    ELSE
        RAISE EXCEPTION 'Faltam tabelas. Encontradas: % de 4', table_count;
    END IF;
    
    -- Contar registros inseridos
    SELECT COUNT(*) INTO permission_count FROM permissions;
    SELECT COUNT(*) INTO role_count FROM roles;
    SELECT COUNT(*) INTO role_permission_count FROM role_permissions;
    SELECT COUNT(*) INTO user_role_count FROM user_roles;
    
    RAISE NOTICE 'Permissões inseridas: %', permission_count;
    RAISE NOTICE 'Roles inseridos: %', role_count;
    RAISE NOTICE 'Relacionamentos role-permission: %', role_permission_count;
    RAISE NOTICE 'Usuários com roles atribuídos: %', user_role_count;
    
    RAISE NOTICE 'SISTEMA DE PERMISSÕES IMPLEMENTADO COM SUCESSO!';
    RAISE NOTICE 'Todas as tabelas usam INTEGER para compatibilidade total.';
END $$;
