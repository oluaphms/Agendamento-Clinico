-- =====================================================
-- SCRIPT PARA PÁGINA USUÁRIOS
-- =====================================================
-- Este script popula dados para a página Usuários
-- Execute APÓS o script principal (00-setup-completo-sistema.sql)

-- =====================================================
-- 1. USUÁRIOS ADICIONAIS
-- =====================================================

-- Inserir mais usuários de exemplo
INSERT INTO usuarios (nome, email, cpf, telefone, cargo, nivel_acesso, status, senha_hash, primeiro_acesso, ultimo_login, tentativas_login) VALUES
-- Usuários administrativos
('Maria Silva', 'maria.silva@clinica.com', '11111111111', '11987654321', 'Gerente Administrativa', 'admin', 'ativo', crypt('123456', gen_salt('bf')), false, CURRENT_TIMESTAMP - INTERVAL '2 hours', 0),
('João Santos', 'joao.santos@clinica.com', '22222222222', '11976543210', 'Supervisor', 'admin', 'ativo', crypt('123456', gen_salt('bf')), false, CURRENT_TIMESTAMP - INTERVAL '1 day', 0),
('Ana Costa', 'ana.costa@clinica.com', '33333333333', '11965432109', 'Coordenadora', 'admin', 'ativo', crypt('123456', gen_salt('bf')), false, CURRENT_TIMESTAMP - INTERVAL '3 days', 0),

-- Usuários de recepção
('Carlos Oliveira', 'carlos.oliveira@clinica.com', '44444444444', '11954321098', 'Recepcionista', 'recepcao', 'ativo', crypt('123456', gen_salt('bf')), false, CURRENT_TIMESTAMP - INTERVAL '1 hour', 0),
('Patricia Lima', 'patricia.lima@clinica.com', '55555555555', '11943210987', 'Recepcionista', 'recepcao', 'ativo', crypt('123456', gen_salt('bf')), false, CURRENT_TIMESTAMP - INTERVAL '4 hours', 0),
('Roberto Silva', 'roberto.silva@clinica.com', '66666666666', '11932109876', 'Recepcionista', 'recepcao', 'ativo', crypt('123456', gen_salt('bf')), false, CURRENT_TIMESTAMP - INTERVAL '2 days', 0),
('Fernanda Costa', 'fernanda.costa@clinica.com', '77777777777', '11921098765', 'Recepcionista', 'recepcao', 'ativo', crypt('123456', gen_salt('bf')), false, CURRENT_TIMESTAMP - INTERVAL '1 week', 0),

-- Usuários profissionais
('Dr. Carlos Eduardo', 'carlos.eduardo@clinica.com', '88888888888', '11910987654', 'Médico Cardiologista', 'profissional', 'ativo', crypt('123456', gen_salt('bf')), false, CURRENT_TIMESTAMP - INTERVAL '30 minutes', 0),
('Dra. Ana Maria', 'ana.maria@clinica.com', '99999999999', '11909876543', 'Médica Dermatologista', 'profissional', 'ativo', crypt('123456', gen_salt('bf')), false, CURRENT_TIMESTAMP - INTERVAL '1 hour', 0),
('Dr. Roberto Lima', 'roberto.lima@clinica.com', '00000000000', '11908765432', 'Médico Ortopedista', 'profissional', 'ativo', crypt('123456', gen_salt('bf')), false, CURRENT_TIMESTAMP - INTERVAL '2 hours', 0),
('Dra. Patricia Costa', 'patricia.costa@clinica.com', '11111111112', '11907654321', 'Médica Ginecologista', 'profissional', 'ativo', crypt('123456', gen_salt('bf')), false, CURRENT_TIMESTAMP - INTERVAL '3 hours', 0),

-- Usuários desenvolvedores
('Lucas Ferreira', 'lucas.ferreira@clinica.com', '22222222223', '11906543210', 'Desenvolvedor Frontend', 'desenvolvedor', 'ativo', crypt('123456', gen_salt('bf')), false, CURRENT_TIMESTAMP - INTERVAL '15 minutes', 0),
('Mariana Rodrigues', 'mariana.rodrigues@clinica.com', '33333333334', '11905432109', 'Desenvolvedora Backend', 'desenvolvedor', 'ativo', crypt('123456', gen_salt('bf')), false, CURRENT_TIMESTAMP - INTERVAL '45 minutes', 0),
('Pedro Henrique', 'pedro.henrique@clinica.com', '44444444445', '11904321098', 'Desenvolvedor Full Stack', 'desenvolvedor', 'ativo', crypt('123456', gen_salt('bf')), false, CURRENT_TIMESTAMP - INTERVAL '1 day', 0),

-- Usuários inativos
('Usuario Inativo', 'inativo@clinica.com', '55555555556', '11903210987', 'Recepcionista', 'recepcao', 'inativo', crypt('123456', gen_salt('bf')), false, CURRENT_TIMESTAMP - INTERVAL '30 days', 0),
('Usuario Suspenso', 'suspenso@clinica.com', '66666666667', '11902109876', 'Recepcionista', 'recepcao', 'suspenso', crypt('123456', gen_salt('bf')), false, CURRENT_TIMESTAMP - INTERVAL '15 days', 3),

-- Usuários com primeiro acesso
('Novo Usuario', 'novo@clinica.com', '77777777778', '11901098765', 'Recepcionista', 'recepcao', 'ativo', crypt('123456', gen_salt('bf')), true, NULL, 0),
('Usuario Teste', 'teste@clinica.com', '88888888889', '11900987654', 'Recepcionista', 'recepcao', 'ativo', crypt('123456', gen_salt('bf')), true, NULL, 0)
ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- 2. CONSULTAS ÚTEIS PARA PÁGINA USUÁRIOS
-- =====================================================

-- Estatísticas de usuários
SELECT 
    'Estatísticas de Usuários' as categoria,
    COUNT(*) as total_usuarios,
    COUNT(CASE WHEN status = 'ativo' THEN 1 END) as usuarios_ativos,
    COUNT(CASE WHEN status = 'inativo' THEN 1 END) as usuarios_inativos,
    COUNT(CASE WHEN status = 'suspenso' THEN 1 END) as usuarios_suspensos,
    COUNT(CASE WHEN nivel_acesso = 'admin' THEN 1 END) as administradores,
    COUNT(CASE WHEN nivel_acesso = 'recepcao' THEN 1 END) as recepcionistas,
    COUNT(CASE WHEN nivel_acesso = 'profissional' THEN 1 END) as profissionais,
    COUNT(CASE WHEN nivel_acesso = 'desenvolvedor' THEN 1 END) as desenvolvedores,
    COUNT(CASE WHEN primeiro_acesso = true THEN 1 END) as primeiro_acesso,
    COUNT(CASE WHEN ultimo_login IS NOT NULL THEN 1 END) as ja_fez_login
FROM usuarios;

-- Usuários por nível de acesso
SELECT 
    'Usuários por Nível de Acesso' as categoria,
    nivel_acesso,
    COUNT(*) as quantidade,
    COUNT(CASE WHEN status = 'ativo' THEN 1 END) as ativos,
    COUNT(CASE WHEN status = 'inativo' THEN 1 END) as inativos,
    COUNT(CASE WHEN status = 'suspenso' THEN 1 END) as suspensos
FROM usuarios
GROUP BY nivel_acesso
ORDER BY quantidade DESC;

-- Usuários por status
SELECT 
    'Usuários por Status' as categoria,
    status,
    COUNT(*) as quantidade,
    COUNT(CASE WHEN nivel_acesso = 'admin' THEN 1 END) as administradores,
    COUNT(CASE WHEN nivel_acesso = 'recepcao' THEN 1 END) as recepcionistas,
    COUNT(CASE WHEN nivel_acesso = 'profissional' THEN 1 END) as profissionais,
    COUNT(CASE WHEN nivel_acesso = 'desenvolvedor' THEN 1 END) as desenvolvedores
FROM usuarios
GROUP BY status
ORDER BY quantidade DESC;

-- Usuários por cargo
SELECT 
    'Usuários por Cargo' as categoria,
    COALESCE(cargo, 'Sem cargo') as cargo,
    COUNT(*) as quantidade,
    COUNT(CASE WHEN status = 'ativo' THEN 1 END) as ativos
FROM usuarios
GROUP BY cargo
ORDER BY quantidade DESC;

-- Usuários com primeiro acesso
SELECT 
    'Usuários com Primeiro Acesso' as categoria,
    nome,
    email,
    cargo,
    nivel_acesso,
    created_at
FROM usuarios
WHERE primeiro_acesso = true
ORDER BY created_at DESC;

-- Usuários que nunca fizeram login
SELECT 
    'Usuários que Nunca Fizeram Login' as categoria,
    nome,
    email,
    cargo,
    nivel_acesso,
    created_at
FROM usuarios
WHERE ultimo_login IS NULL
ORDER BY created_at DESC;

-- Usuários com tentativas de login excedidas
SELECT 
    'Usuários com Tentativas Excedidas' as categoria,
    nome,
    email,
    cargo,
    tentativas_login,
    ultimo_login
FROM usuarios
WHERE tentativas_login >= 3
ORDER BY tentativas_login DESC;

-- Usuários mais ativos (último login recente)
SELECT 
    'Usuários Mais Ativos' as categoria,
    nome,
    email,
    cargo,
    nivel_acesso,
    ultimo_login,
    EXTRACT(DAYS FROM CURRENT_TIMESTAMP - ultimo_login) as dias_desde_ultimo_login
FROM usuarios
WHERE ultimo_login IS NOT NULL
ORDER BY ultimo_login DESC
LIMIT 10;

-- Usuários inativos há muito tempo
SELECT 
    'Usuários Inativos há Muito Tempo' as categoria,
    nome,
    email,
    cargo,
    nivel_acesso,
    ultimo_login,
    EXTRACT(DAYS FROM CURRENT_TIMESTAMP - ultimo_login) as dias_desde_ultimo_login
FROM usuarios
WHERE ultimo_login IS NOT NULL
ORDER BY ultimo_login ASC
LIMIT 10;

-- Usuários cadastrados por mês (últimos 12 meses)
SELECT 
    'Usuários Cadastrados por Mês' as categoria,
    DATE_TRUNC('month', created_at) as mes,
    COUNT(*) as quantidade,
    COUNT(CASE WHEN status = 'ativo' THEN 1 END) as ativos
FROM usuarios
WHERE created_at >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY mes DESC;

-- Usuários por faixa de tentativas de login
SELECT 
    'Usuários por Faixa de Tentativas' as categoria,
    CASE 
        WHEN tentativas_login = 0 THEN 'Nenhuma tentativa'
        WHEN tentativas_login BETWEEN 1 AND 2 THEN '1-2 tentativas'
        WHEN tentativas_login BETWEEN 3 AND 5 THEN '3-5 tentativas'
        ELSE 'Mais de 5 tentativas'
    END as faixa_tentativas,
    COUNT(*) as quantidade
FROM usuarios
GROUP BY 
    CASE 
        WHEN tentativas_login = 0 THEN 'Nenhuma tentativa'
        WHEN tentativas_login BETWEEN 1 AND 2 THEN '1-2 tentativas'
        WHEN tentativas_login BETWEEN 3 AND 5 THEN '3-5 tentativas'
        ELSE 'Mais de 5 tentativas'
    END
ORDER BY quantidade DESC;

-- =====================================================
-- 3. DADOS PARA TESTE DE FILTROS E BUSCA
-- =====================================================

-- Usuários com nomes similares (para teste de busca)
INSERT INTO usuarios (nome, email, cpf, telefone, cargo, nivel_acesso, status, senha_hash, primeiro_acesso) VALUES
('Carlos Silva', 'carlos.silva@clinica.com', '11111111113', '11911111111', 'Recepcionista', 'recepcao', 'ativo', crypt('123456', gen_salt('bf')), false),
('Carlos Santos', 'carlos.santos@clinica.com', '22222222224', '11922222222', 'Recepcionista', 'recepcao', 'ativo', crypt('123456', gen_salt('bf')), false),
('Carlos Costa', 'carlos.costa@clinica.com', '33333333335', '11933333333', 'Recepcionista', 'recepcao', 'ativo', crypt('123456', gen_salt('bf')), false)
ON CONFLICT (email) DO NOTHING;

-- Usuários com emails similares (para teste de busca)
INSERT INTO usuarios (nome, email, cpf, telefone, cargo, nivel_acesso, status, senha_hash, primeiro_acesso) VALUES
('João Silva', 'joao.silva@clinica.com', '44444444446', '11944444444', 'Recepcionista', 'recepcao', 'ativo', crypt('123456', gen_salt('bf')), false),
('João Santos', 'joao.santos@clinica.com', '55555555557', '11955555555', 'Recepcionista', 'recepcao', 'ativo', crypt('123456', gen_salt('bf')), false),
('João Costa', 'joao.costa@clinica.com', '66666666668', '11966666666', 'Recepcionista', 'recepcao', 'ativo', crypt('123456', gen_salt('bf')), false)
ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- FIM DO SCRIPT USUÁRIOS
-- =====================================================

-- Este script cria dados de exemplo para:
-- - Lista completa de usuários
-- - Usuários de diferentes níveis de acesso
-- - Usuários ativos, inativos e suspensos
-- - Usuários com primeiro acesso
-- - Usuários com diferentes cargos
-- - Dados para testes de filtros e busca
-- - Estatísticas e relatórios de usuários
