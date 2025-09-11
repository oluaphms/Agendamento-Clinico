-- =====================================================
-- SCRIPT PARA PÁGINA PERMISSÕES
-- =====================================================
-- Este script popula dados para a página Permissões
-- Execute APÓS o script principal (00-setup-completo-sistema.sql)

-- =====================================================
-- 1. TABELA DE PERMISSÕES
-- =====================================================

-- Criar tabela de permissões se não existir
CREATE TABLE IF NOT EXISTS permissoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(100) UNIQUE NOT NULL,
    descricao TEXT,
    categoria VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de permissões de usuários se não existir
CREATE TABLE IF NOT EXISTS usuario_permissoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    permissao_id UUID NOT NULL REFERENCES permissoes(id) ON DELETE CASCADE,
    concedida_por UUID REFERENCES usuarios(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(usuario_id, permissao_id)
);

-- Criar tabela de permissões por nível de acesso se não existir
CREATE TABLE IF NOT EXISTS nivel_permissoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nivel_acesso nivel_acesso NOT NULL,
    permissao_id UUID NOT NULL REFERENCES permissoes(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(nivel_acesso, permissao_id)
);

-- =====================================================
-- 2. PERMISSÕES DO SISTEMA
-- =====================================================

-- Inserir permissões do sistema
INSERT INTO permissoes (nome, descricao, categoria) VALUES
-- Permissões de usuários
('usuarios.visualizar', 'Visualizar lista de usuários', 'usuarios'),
('usuarios.criar', 'Criar novos usuários', 'usuarios'),
('usuarios.editar', 'Editar usuários existentes', 'usuarios'),
('usuarios.excluir', 'Excluir usuários', 'usuarios'),
('usuarios.alterar_senha', 'Alterar senhas de usuários', 'usuarios'),
('usuarios.alterar_nivel', 'Alterar nível de acesso de usuários', 'usuarios'),

-- Permissões de pacientes
('pacientes.visualizar', 'Visualizar lista de pacientes', 'pacientes'),
('pacientes.criar', 'Criar novos pacientes', 'pacientes'),
('pacientes.editar', 'Editar pacientes existentes', 'pacientes'),
('pacientes.excluir', 'Excluir pacientes', 'pacientes'),
('pacientes.visualizar_historico', 'Visualizar histórico completo do paciente', 'pacientes'),

-- Permissões de profissionais
('profissionais.visualizar', 'Visualizar lista de profissionais', 'profissionais'),
('profissionais.criar', 'Criar novos profissionais', 'profissionais'),
('profissionais.editar', 'Editar profissionais existentes', 'profissionais'),
('profissionais.excluir', 'Excluir profissionais', 'profissionais'),
('profissionais.alterar_status', 'Alterar status de profissionais', 'profissionais'),

-- Permissões de serviços
('servicos.visualizar', 'Visualizar lista de serviços', 'servicos'),
('servicos.criar', 'Criar novos serviços', 'servicos'),
('servicos.editar', 'Editar serviços existentes', 'servicos'),
('servicos.excluir', 'Excluir serviços', 'servicos'),
('servicos.alterar_preco', 'Alterar preços de serviços', 'servicos'),

-- Permissões de agendamentos
('agendamentos.visualizar', 'Visualizar lista de agendamentos', 'agendamentos'),
('agendamentos.criar', 'Criar novos agendamentos', 'agendamentos'),
('agendamentos.editar', 'Editar agendamentos existentes', 'agendamentos'),
('agendamentos.excluir', 'Excluir agendamentos', 'agendamentos'),
('agendamentos.cancelar', 'Cancelar agendamentos', 'agendamentos'),
('agendamentos.confirmar', 'Confirmar agendamentos', 'agendamentos'),
('agendamentos.concluir', 'Marcar agendamentos como concluídos', 'agendamentos'),

-- Permissões de pagamentos
('pagamentos.visualizar', 'Visualizar lista de pagamentos', 'pagamentos'),
('pagamentos.criar', 'Criar novos pagamentos', 'pagamentos'),
('pagamentos.editar', 'Editar pagamentos existentes', 'pagamentos'),
('pagamentos.excluir', 'Excluir pagamentos', 'pagamentos'),
('pagamentos.processar', 'Processar pagamentos', 'pagamentos'),
('pagamentos.estornar', 'Estornar pagamentos', 'pagamentos'),

-- Permissões de relatórios
('relatorios.visualizar', 'Visualizar relatórios', 'relatorios'),
('relatorios.gerar', 'Gerar relatórios', 'relatorios'),
('relatorios.exportar', 'Exportar relatórios', 'relatorios'),
('relatorios.financeiro', 'Acessar relatórios financeiros', 'relatorios'),
('relatorios.operacional', 'Acessar relatórios operacionais', 'relatorios'),

-- Permissões de configurações
('configuracoes.visualizar', 'Visualizar configurações', 'configuracoes'),
('configuracoes.editar', 'Editar configurações', 'configuracoes'),
('configuracoes.backup', 'Gerenciar backups', 'configuracoes'),
('configuracoes.sistema', 'Configurar sistema', 'configuracoes'),

-- Permissões de notificações
('notificacoes.visualizar', 'Visualizar notificações', 'notificacoes'),
('notificacoes.criar', 'Criar notificações', 'notificacoes'),
('notificacoes.editar', 'Editar notificações', 'notificacoes'),
('notificacoes.excluir', 'Excluir notificações', 'notificacoes'),

-- Permissões de auditoria
('auditoria.visualizar', 'Visualizar logs de auditoria', 'auditoria'),
('auditoria.exportar', 'Exportar logs de auditoria', 'auditoria'),

-- Permissões de permissões
('permissoes.visualizar', 'Visualizar permissões', 'permissoes'),
('permissoes.gerenciar', 'Gerenciar permissões', 'permissoes'),
('permissoes.conceder', 'Conceder permissões', 'permissoes'),
('permissoes.revogar', 'Revogar permissões', 'permissoes')
ON CONFLICT (nome) DO NOTHING;

-- =====================================================
-- 3. PERMISSÕES POR NÍVEL DE ACESSO
-- =====================================================

-- Permissões para administradores (todas as permissões)
INSERT INTO nivel_permissoes (nivel_acesso, permissao_id)
SELECT 'admin', id FROM permissoes
ON CONFLICT (nivel_acesso, permissao_id) DO NOTHING;

-- Permissões para recepcionistas
INSERT INTO nivel_permissoes (nivel_acesso, permissao_id)
SELECT 'recepcao', id FROM permissoes 
WHERE nome IN (
    'pacientes.visualizar', 'pacientes.criar', 'pacientes.editar',
    'profissionais.visualizar',
    'servicos.visualizar',
    'agendamentos.visualizar', 'agendamentos.criar', 'agendamentos.editar', 'agendamentos.cancelar', 'agendamentos.confirmar',
    'pagamentos.visualizar', 'pagamentos.criar', 'pagamentos.editar',
    'relatorios.visualizar', 'relatorios.gerar', 'relatorios.exportar',
    'notificacoes.visualizar'
)
ON CONFLICT (nivel_acesso, permissao_id) DO NOTHING;

-- Permissões para profissionais
INSERT INTO nivel_permissoes (nivel_acesso, permissao_id)
SELECT 'profissional', id FROM permissoes 
WHERE nome IN (
    'pacientes.visualizar', 'pacientes.visualizar_historico',
    'agendamentos.visualizar', 'agendamentos.concluir',
    'pagamentos.visualizar',
    'relatorios.visualizar', 'relatorios.operacional',
    'notificacoes.visualizar'
)
ON CONFLICT (nivel_acesso, permissao_id) DO NOTHING;

-- Permissões para desenvolvedores
INSERT INTO nivel_permissoes (nivel_acesso, permissao_id)
SELECT 'desenvolvedor', id FROM permissoes 
WHERE nome IN (
    'usuarios.visualizar', 'usuarios.criar', 'usuarios.editar',
    'pacientes.visualizar', 'pacientes.criar', 'pacientes.editar',
    'profissionais.visualizar', 'profissionais.criar', 'profissionais.editar',
    'servicos.visualizar', 'servicos.criar', 'servicos.editar',
    'agendamentos.visualizar', 'agendamentos.criar', 'agendamentos.editar',
    'pagamentos.visualizar', 'pagamentos.criar', 'pagamentos.editar',
    'relatorios.visualizar', 'relatorios.gerar', 'relatorios.exportar',
    'configuracoes.visualizar', 'configuracoes.editar',
    'notificacoes.visualizar', 'notificacoes.criar', 'notificacoes.editar',
    'auditoria.visualizar', 'auditoria.exportar',
    'permissoes.visualizar', 'permissoes.gerenciar'
)
ON CONFLICT (nivel_acesso, permissao_id) DO NOTHING;

-- =====================================================
-- 4. PERMISSÕES ESPECÍFICAS DE USUÁRIOS
-- =====================================================

-- Conceder permissões específicas para usuários
INSERT INTO usuario_permissoes (usuario_id, permissao_id, concedida_por)
SELECT 
    u.id,
    p.id,
    (SELECT id FROM usuarios WHERE email = 'admin@clinica.com')
FROM usuarios u
CROSS JOIN permissoes p
WHERE u.email = 'maria.silva@clinica.com'
AND p.nome IN ('usuarios.visualizar', 'usuarios.criar', 'usuarios.editar', 'relatorios.financeiro')
ON CONFLICT (usuario_id, permissao_id) DO NOTHING;

INSERT INTO usuario_permissoes (usuario_id, permissao_id, concedida_por)
SELECT 
    u.id,
    p.id,
    (SELECT id FROM usuarios WHERE email = 'admin@clinica.com')
FROM usuarios u
CROSS JOIN permissoes p
WHERE u.email = 'carlos.oliveira@clinica.com'
AND p.nome IN ('agendamentos.cancelar', 'pagamentos.processar')
ON CONFLICT (usuario_id, permissao_id) DO NOTHING;

-- =====================================================
-- 5. CONSULTAS ÚTEIS PARA PÁGINA PERMISSÕES
-- =====================================================

-- Estatísticas de permissões
SELECT 
    'Estatísticas de Permissões' as categoria,
    COUNT(*) as total_permissoes,
    COUNT(DISTINCT categoria) as categorias_diferentes,
    COUNT(CASE WHEN categoria = 'usuarios' THEN 1 END) as permissoes_usuarios,
    COUNT(CASE WHEN categoria = 'pacientes' THEN 1 END) as permissoes_pacientes,
    COUNT(CASE WHEN categoria = 'profissionais' THEN 1 END) as permissoes_profissionais,
    COUNT(CASE WHEN categoria = 'servicos' THEN 1 END) as permissoes_servicos,
    COUNT(CASE WHEN categoria = 'agendamentos' THEN 1 END) as permissoes_agendamentos,
    COUNT(CASE WHEN categoria = 'pagamentos' THEN 1 END) as permissoes_pagamentos,
    COUNT(CASE WHEN categoria = 'relatorios' THEN 1 END) as permissoes_relatorios,
    COUNT(CASE WHEN categoria = 'configuracoes' THEN 1 END) as permissoes_configuracoes
FROM permissoes;

-- Permissões por categoria
SELECT 
    'Permissões por Categoria' as categoria,
    categoria as categoria_nome,
    COUNT(*) as quantidade
FROM permissoes
GROUP BY categoria
ORDER BY quantidade DESC;

-- Permissões por nível de acesso
SELECT 
    'Permissões por Nível de Acesso' as categoria,
    np.nivel_acesso,
    COUNT(*) as quantidade
FROM nivel_permissoes np
GROUP BY np.nivel_acesso
ORDER BY quantidade DESC;

-- Permissões específicas de usuários
SELECT 
    'Permissões Específicas de Usuários' as categoria,
    u.nome as usuario,
    u.email,
    p.nome as permissao,
    p.categoria as categoria_permissao,
    up.created_at as data_concessao
FROM usuario_permissoes up
JOIN usuarios u ON up.usuario_id = u.id
JOIN permissoes p ON up.permissao_id = p.id
ORDER BY u.nome, p.categoria, p.nome;

-- Usuários com permissões especiais
SELECT 
    'Usuários com Permissões Especiais' as categoria,
    u.nome as usuario,
    u.email,
    u.nivel_acesso,
    COUNT(up.id) as permissoes_especiais
FROM usuarios u
LEFT JOIN usuario_permissoes up ON u.id = up.usuario_id
GROUP BY u.id, u.nome, u.email, u.nivel_acesso
HAVING COUNT(up.id) > 0
ORDER BY permissoes_especiais DESC;

-- Permissões não utilizadas por nível
SELECT 
    'Permissões Não Utilizadas por Nível' as categoria,
    np.nivel_acesso,
    p.nome as permissao,
    p.categoria as categoria_permissao
FROM nivel_permissoes np
JOIN permissoes p ON np.permissao_id = p.id
LEFT JOIN usuario_permissoes up ON p.id = up.permissao_id
WHERE up.id IS NULL
ORDER BY np.nivel_acesso, p.categoria, p.nome;

-- Resumo de permissões por usuário
SELECT 
    'Resumo de Permissões por Usuário' as categoria,
    u.nome as usuario,
    u.email,
    u.nivel_acesso,
    COUNT(DISTINCT np.permissao_id) as permissoes_nivel,
    COUNT(DISTINCT up.permissao_id) as permissoes_especiais,
    COUNT(DISTINCT np.permissao_id) + COUNT(DISTINCT up.permissao_id) as total_permissoes
FROM usuarios u
LEFT JOIN nivel_permissoes np ON u.nivel_acesso = np.nivel_acesso
LEFT JOIN usuario_permissoes up ON u.id = up.usuario_id
GROUP BY u.id, u.nome, u.email, u.nivel_acesso
ORDER BY total_permissoes DESC;

-- =====================================================
-- FIM DO SCRIPT PERMISSÕES
-- =====================================================

-- Este script cria dados de exemplo para:
-- - Tabela de permissões
-- - Tabela de permissões por nível de acesso
-- - Tabela de permissões específicas de usuários
-- - Permissões para diferentes níveis de acesso
-- - Permissões específicas para usuários
-- - Dados para testes de filtros e busca
-- - Estatísticas e relatórios de permissões
