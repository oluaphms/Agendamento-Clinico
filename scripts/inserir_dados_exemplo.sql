-- =====================================================
-- INSERIR DADOS DE EXEMPLO NO SUPABASE
-- =====================================================
-- Este script insere dados de exemplo para testar o sistema
-- Execute apenas se as tabelas estiverem vazias

-- 1. VERIFICAR SE AS TABELAS ESTÃO VAZIAS
-- =====================================================

SELECT 
    'VERIFICAÇÃO INICIAL' as info,
    'usuarios' as tabela,
    COUNT(*) as registros
FROM usuarios

UNION ALL

SELECT 
    'VERIFICAÇÃO INICIAL' as info,
    'pacientes' as tabela,
    COUNT(*) as registros
FROM pacientes

UNION ALL

SELECT 
    'VERIFICAÇÃO INICIAL' as info,
    'profissionais' as tabela,
    COUNT(*) as registros
FROM profissionais

UNION ALL

SELECT 
    'VERIFICAÇÃO INICIAL' as info,
    'servicos' as tabela,
    COUNT(*) as registros
FROM servicos

UNION ALL

SELECT 
    'VERIFICAÇÃO INICIAL' as info,
    'agendamentos' as tabela,
    COUNT(*) as registros
FROM agendamentos;

-- 2. INSERIR USUÁRIOS DE EXEMPLO
-- =====================================================

-- Inserir usuários de exemplo
INSERT INTO usuarios (nome, cpf, email, nivel_acesso, status, senha_hash, primeiro_acesso, created_at, updated_at)
VALUES 
    ('Administrador do Sistema', '11111111111', 'admin@sistemaclinico.com', 'admin', 'ativo', crypt('123456', gen_salt('bf')), false, NOW(), NOW()),
    ('Recepcionista', '22222222222', 'recepcao@sistemaclinico.com', 'recepcao', 'ativo', crypt('123456', gen_salt('bf')), false, NOW(), NOW()),
    ('Dr. João Médico', '33333333333', 'joao@sistemaclinico.com', 'profissional', 'ativo', crypt('123456', gen_salt('bf')), false, NOW(), NOW()),
    ('Dra. Maria Pediatra', '44444444444', 'maria@sistemaclinico.com', 'profissional', 'ativo', crypt('123456', gen_salt('bf')), false, NOW(), NOW()),
    ('Dr. Pedro Ortopedista', '55555555555', 'pedro@sistemaclinico.com', 'profissional', 'ativo', crypt('123456', gen_salt('bf')), false, NOW(), NOW())
ON CONFLICT (cpf) DO NOTHING;

-- 3. INSERIR PACIENTES DE EXEMPLO
-- =====================================================

-- Inserir pacientes de exemplo
INSERT INTO pacientes (nome, cpf, data_nascimento, telefone, email, endereco, cidade, estado, cep, convenio, status, created_at, updated_at)
VALUES 
    ('João Silva Santos', '12345678901', '1985-03-15', '11999999999', 'joao.silva@email.com', 'Rua das Flores, 123', 'São Paulo', 'SP', '01234-567', 'Unimed', 'ativo', NOW(), NOW()),
    ('Maria Oliveira Costa', '98765432109', '1990-07-22', '11888888888', 'maria.oliveira@email.com', 'Av. Paulista, 456', 'São Paulo', 'SP', '01310-100', 'Bradesco Saúde', 'ativo', NOW(), NOW()),
    ('Pedro Ferreira Lima', '45678912345', '1978-11-08', '11777777777', 'pedro.ferreira@email.com', 'Rua Augusta, 789', 'São Paulo', 'SP', '01305-000', 'Amil', 'ativo', NOW(), NOW()),
    ('Ana Beatriz Souza', '78912345678', '1995-01-30', '11666666666', 'ana.souza@email.com', 'Rua Oscar Freire, 321', 'São Paulo', 'SP', '01426-001', 'SulAmérica', 'ativo', NOW(), NOW()),
    ('Carlos Eduardo Rocha', '32165498701', '1982-09-12', '11555555555', 'carlos.rocha@email.com', 'Av. Faria Lima, 654', 'São Paulo', 'SP', '04538-132', 'Particular', 'ativo', NOW(), NOW())
ON CONFLICT (cpf) DO NOTHING;

-- 4. INSERIR PROFISSIONAIS DE EXEMPLO
-- =====================================================

-- Inserir profissionais de exemplo
INSERT INTO profissionais (nome, cpf, especialidade, telefone, email, crm_cro, ativo, created_at, updated_at)
VALUES 
    ('Dr. João Cardoso', '11111111111', 'Cardiologia', '11911111111', 'joao.cardoso@clinica.com', 'CRM 123456', true, NOW(), NOW()),
    ('Dra. Maria Santos', '22222222222', 'Pediatria', '11922222222', 'maria.santos@clinica.com', 'CRM 234567', true, NOW(), NOW()),
    ('Dr. Pedro Oliveira', '33333333333', 'Ortopedia', '11933333333', 'pedro.oliveira@clinica.com', 'CRM 345678', true, NOW(), NOW()),
    ('Dra. Ana Costa', '44444444444', 'Dermatologia', '11944444444', 'ana.costa@clinica.com', 'CRM 456789', true, NOW(), NOW()),
    ('Dr. Carlos Silva', '55555555555', 'Neurologia', '11955555555', 'carlos.silva@clinica.com', 'CRM 567890', true, NOW(), NOW())
ON CONFLICT (cpf) DO NOTHING;

-- 5. INSERIR SERVIÇOS DE EXEMPLO
-- =====================================================

-- Inserir serviços de exemplo
INSERT INTO servicos (nome, descricao, duracao_min, preco, categoria, ativo, created_at, updated_at)
VALUES 
    ('Consulta Médica', 'Consulta médica geral com especialista', 30, 150.00, 'Consultas', true, NOW(), NOW()),
    ('Exame de Sangue', 'Coleta e análise de exames laboratoriais', 15, 80.00, 'Exames', true, NOW(), NOW()),
    ('Ultrassom', 'Exame de ultrassonografia', 45, 200.00, 'Exames', true, NOW(), NOW()),
    ('Raio-X', 'Exame radiológico', 20, 120.00, 'Exames', true, NOW(), NOW()),
    ('Consulta de Retorno', 'Consulta de retorno médico', 20, 100.00, 'Consultas', true, NOW(), NOW()),
    ('Eletrocardiograma', 'Exame cardiológico', 15, 90.00, 'Exames', true, NOW(), NOW()),
    ('Consulta Psicológica', 'Sessão de psicologia', 50, 180.00, 'Consultas', true, NOW(), NOW()),
    ('Fisioterapia', 'Sessão de fisioterapia', 60, 120.00, 'Tratamentos', true, NOW(), NOW())
ON CONFLICT (nome) DO NOTHING;

-- 6. INSERIR AGENDAMENTOS DE EXEMPLO
-- =====================================================

-- Inserir agendamentos de exemplo
INSERT INTO agendamentos (paciente_id, profissional_id, servico_id, data, hora, duracao, status, observacoes, created_at, updated_at)
VALUES 
    ((SELECT id FROM pacientes WHERE cpf = '12345678901' LIMIT 1), 
     (SELECT id FROM profissionais WHERE cpf = '11111111111' LIMIT 1), 
     (SELECT id FROM servicos WHERE nome = 'Consulta Médica' LIMIT 1), 
     CURRENT_DATE + INTERVAL '1 day', '09:00', 30, 'agendado', 'Primeira consulta', NOW(), NOW()),
    
    ((SELECT id FROM pacientes WHERE cpf = '98765432109' LIMIT 1), 
     (SELECT id FROM profissionais WHERE cpf = '22222222222' LIMIT 1), 
     (SELECT id FROM servicos WHERE nome = 'Consulta de Retorno' LIMIT 1), 
     CURRENT_DATE + INTERVAL '2 days', '14:30', 20, 'confirmado', 'Retorno pediátrico', NOW(), NOW()),
    
    ((SELECT id FROM pacientes WHERE cpf = '45678912345' LIMIT 1), 
     (SELECT id FROM profissionais WHERE cpf = '33333333333' LIMIT 1), 
     (SELECT id FROM servicos WHERE nome = 'Raio-X' LIMIT 1), 
     CURRENT_DATE + INTERVAL '3 days', '10:15', 20, 'agendado', 'Exame de joelho', NOW(), NOW()),
    
    ((SELECT id FROM pacientes WHERE cpf = '78912345678' LIMIT 1), 
     (SELECT id FROM profissionais WHERE cpf = '44444444444' LIMIT 1), 
     (SELECT id FROM servicos WHERE nome = 'Consulta Psicológica' LIMIT 1), 
     CURRENT_DATE + INTERVAL '4 days', '16:00', 50, 'agendado', 'Avaliação psicológica', NOW(), NOW()),
    
    ((SELECT id FROM pacientes WHERE cpf = '32165498701' LIMIT 1), 
     (SELECT id FROM profissionais WHERE cpf = '55555555555' LIMIT 1), 
     (SELECT id FROM servicos WHERE nome = 'Eletrocardiograma' LIMIT 1), 
     CURRENT_DATE + INTERVAL '5 days', '11:30', 15, 'agendado', 'Check-up cardiológico', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- 7. VERIFICAR DADOS INSERIDOS
-- =====================================================

-- Verificar contagem final
SELECT 
    'DADOS INSERIDOS COM SUCESSO' as info,
    'usuarios' as tabela,
    COUNT(*) as total
FROM usuarios

UNION ALL

SELECT 
    'DADOS INSERIDOS COM SUCESSO' as info,
    'pacientes' as tabela,
    COUNT(*) as total
FROM pacientes

UNION ALL

SELECT 
    'DADOS INSERIDOS COM SUCESSO' as info,
    'profissionais' as tabela,
    COUNT(*) as total
FROM profissionais

UNION ALL

SELECT 
    'DADOS INSERIDOS COM SUCESSO' as info,
    'servicos' as tabela,
    COUNT(*) as total
FROM servicos

UNION ALL

SELECT 
    'DADOS INSERIDOS COM SUCESSO' as info,
    'agendamentos' as tabela,
    COUNT(*) as total
FROM agendamentos;

-- 8. TESTAR QUERIES COM DADOS REAIS
-- =====================================================

-- Testar query de dashboard
SELECT 
    'TESTE DASHBOARD' as info,
    (SELECT COUNT(*) FROM pacientes) as total_pacientes,
    (SELECT COUNT(*) FROM profissionais) as total_profissionais,
    (SELECT COUNT(*) FROM servicos) as total_servicos,
    (SELECT COUNT(*) FROM agendamentos WHERE data >= CURRENT_DATE) as agendamentos_hoje;

-- 9. RESULTADO FINAL
-- =====================================================

SELECT 
    'DADOS DE EXEMPLO INSERIDOS COM SUCESSO!' as resultado,
    'O sistema agora deve mostrar dados reais do Supabase' as status;
