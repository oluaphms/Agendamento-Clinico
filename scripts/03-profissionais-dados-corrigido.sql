-- =====================================================
-- SCRIPT PARA PÁGINA PROFISSIONAIS - VERSÃO CORRIGIDA
-- =====================================================
-- Este script popula dados para a página Profissionais
-- Execute APÓS o script principal (00-setup-completo-sistema.sql)

-- =====================================================
-- 1. DADOS ADICIONAIS DE PROFISSIONAIS
-- =====================================================

-- Inserir mais profissionais de exemplo com dados completos
INSERT INTO profissionais (nome, cpf, crm, especialidade, telefone, email, endereco, cidade, estado, cep, formacao, experiencia_anos, horario_trabalho, disponibilidade, valor_consulta, ativo, observacoes) VALUES
-- Profissionais com dados completos
('Dr. Carlos Eduardo Silva', '11111111111', 'CRM 123456', 'Cardiologia', '11987654321', 'carlos.silva@clinica.com', 'Av. Paulista, 1000', 'São Paulo', 'SP', '01310-100', 'Medicina - USP, Residência em Cardiologia - Incor', 15, '{"segunda": {"inicio": "08:00", "fim": "18:00"}, "terca": {"inicio": "08:00", "fim": "18:00"}, "quarta": {"inicio": "08:00", "fim": "18:00"}, "quinta": {"inicio": "08:00", "fim": "18:00"}, "sexta": {"inicio": "08:00", "fim": "18:00"}}', '{"feriados": false, "finais_semana": false}', 300.00, true, 'Especialista em cardiologia intervencionista, realiza cateterismos'),

('Dra. Ana Maria Santos', '22222222222', 'CRM 234567', 'Dermatologia', '11976543210', 'ana.santos@clinica.com', 'Rua Oscar Freire, 500', 'São Paulo', 'SP', '01426-001', 'Medicina - Unifesp, Residência em Dermatologia - Hospital das Clínicas', 12, '{"segunda": {"inicio": "09:00", "fim": "17:00"}, "terca": {"inicio": "09:00", "fim": "17:00"}, "quarta": {"inicio": "09:00", "fim": "17:00"}, "quinta": {"inicio": "09:00", "fim": "17:00"}, "sexta": {"inicio": "09:00", "fim": "17:00"}}', '{"feriados": false, "finais_semana": true}', 250.00, true, 'Especialista em dermatologia estética e cosmiatria'),

('Dr. Roberto Lima', '33333333333', 'CRM 345678', 'Ortopedia', '11965432109', 'roberto.lima@clinica.com', 'Av. Faria Lima, 2000', 'São Paulo', 'SP', '04538-132', 'Medicina - PUC-SP, Residência em Ortopedia - Santa Casa', 18, '{"segunda": {"inicio": "07:00", "fim": "19:00"}, "terca": {"inicio": "07:00", "fim": "19:00"}, "quarta": {"inicio": "07:00", "fim": "19:00"}, "quinta": {"inicio": "07:00", "fim": "19:00"}, "sexta": {"inicio": "07:00", "fim": "19:00"}}', '{"feriados": true, "finais_semana": true}', 400.00, true, 'Especialista em cirurgia do joelho, realiza artroscopias'),

('Dra. Patricia Costa', '44444444444', 'CRM 456789', 'Ginecologia', '11954321098', 'patricia.costa@clinica.com', 'Rua Bela Cintra, 800', 'São Paulo', 'SP', '01415-000', 'Medicina - Unicamp, Residência em Ginecologia - Hospital das Clínicas', 14, '{"segunda": {"inicio": "08:30", "fim": "17:30"}, "terca": {"inicio": "08:30", "fim": "17:30"}, "quarta": {"inicio": "08:30", "fim": "17:30"}, "quinta": {"inicio": "08:30", "fim": "17:30"}, "sexta": {"inicio": "08:30", "fim": "17:30"}}', '{"feriados": false, "finais_semana": false}', 280.00, true, 'Especialista em ginecologia oncológica, realiza cirurgias complexas'),

('Dr. Fernando Oliveira', '55555555555', 'CRM 567890', 'Neurologia', '11943210987', 'fernando.oliveira@clinica.com', 'Av. Rebouças, 1500', 'São Paulo', 'SP', '05402-000', 'Medicina - USP, Residência em Neurologia - Hospital das Clínicas', 16, '{"segunda": {"inicio": "08:00", "fim": "18:00"}, "terca": {"inicio": "08:00", "fim": "18:00"}, "quarta": {"inicio": "08:00", "fim": "18:00"}, "quinta": {"inicio": "08:00", "fim": "18:00"}, "sexta": {"inicio": "08:00", "fim": "18:00"}}', '{"feriados": false, "finais_semana": false}', 350.00, true, 'Especialista em neurologia vascular, trata AVCs'),

('Dra. Mariana Rodrigues', '66666666666', 'CRM 678901', 'Pediatria', '11932109876', 'mariana.rodrigues@clinica.com', 'Rua Haddock Lobo, 400', 'São Paulo', 'SP', '01414-000', 'Medicina - Unifesp, Residência em Pediatria - Hospital das Clínicas', 10, '{"segunda": {"inicio": "09:00", "fim": "17:00"}, "terca": {"inicio": "09:00", "fim": "17:00"}, "quarta": {"inicio": "09:00", "fim": "17:00"}, "quinta": {"inicio": "09:00", "fim": "17:00"}, "sexta": {"inicio": "09:00", "fim": "17:00"}}', '{"feriados": true, "finais_semana": true}', 200.00, true, 'Especialista em neonatologia, cuida de recém-nascidos'),

('Dr. Paulo Henrique', '77777777777', 'CRM 789012', 'Oftalmologia', '11921098765', 'paulo.henrique@clinica.com', 'Rua da Consolação, 1200', 'São Paulo', 'SP', '01302-000', 'Medicina - PUC-SP, Residência em Oftalmologia - Hospital das Clínicas', 13, '{"segunda": {"inicio": "08:00", "fim": "18:00"}, "terca": {"inicio": "08:00", "fim": "18:00"}, "quarta": {"inicio": "08:00", "fim": "18:00"}, "quinta": {"inicio": "08:00", "fim": "18:00"}, "sexta": {"inicio": "08:00", "fim": "18:00"}}', '{"feriados": false, "finais_semana": false}', 320.00, true, 'Especialista em retina, realiza cirurgias vitreorretinianas'),

('Dra. Camila Ferreira', '88888888888', 'CRM 890123', 'Psiquiatria', '11910987654', 'camila.ferreira@clinica.com', 'Av. 9 de Julho, 3000', 'São Paulo', 'SP', '01307-000', 'Medicina - USP, Residência em Psiquiatria - Hospital das Clínicas', 11, '{"segunda": {"inicio": "09:00", "fim": "17:00"}, "terca": {"inicio": "09:00", "fim": "17:00"}, "quarta": {"inicio": "09:00", "fim": "17:00"}, "quinta": {"inicio": "09:00", "fim": "17:00"}, "sexta": {"inicio": "09:00", "fim": "17:00"}}', '{"feriados": false, "finais_semana": false}', 220.00, true, 'Especialista em psiquiatria da infância e adolescência'),

('Dr. Rafael Santos', '99999999999', 'CRM 901234', 'Urologia', '11909876543', 'rafael.santos@clinica.com', 'Rua Augusta, 500', 'São Paulo', 'SP', '01305-000', 'Medicina - Unicamp, Residência em Urologia - Hospital das Clínicas', 17, '{"segunda": {"inicio": "08:00", "fim": "18:00"}, "terca": {"inicio": "08:00", "fim": "18:00"}, "quarta": {"inicio": "08:00", "fim": "18:00"}, "quinta": {"inicio": "08:00", "fim": "18:00"}, "sexta": {"inicio": "08:00", "fim": "18:00"}}', '{"feriados": false, "finais_semana": false}', 380.00, true, 'Especialista em urologia oncológica, realiza cirurgias robóticas'),

('Dra. Beatriz Lima', '00000000000', 'CRM 012345', 'Endocrinologia', '11908765432', 'beatriz.lima@clinica.com', 'Av. Paulista, 2000', 'São Paulo', 'SP', '01310-100', 'Medicina - Unifesp, Residência em Endocrinologia - Hospital das Clínicas', 9, '{"segunda": {"inicio": "09:00", "fim": "17:00"}, "terca": {"inicio": "09:00", "fim": "17:00"}, "quarta": {"inicio": "09:00", "fim": "17:00"}, "quinta": {"inicio": "09:00", "fim": "17:00"}, "sexta": {"inicio": "09:00", "fim": "17:00"}}', '{"feriados": false, "finais_semana": false}', 260.00, true, 'Especialista em diabetes e doenças da tireoide')
ON CONFLICT (cpf) DO NOTHING;

-- =====================================================
-- 2. PROFISSIONAIS INATIVOS (PARA TESTE DE FILTROS)
-- =====================================================

INSERT INTO profissionais (nome, cpf, crm, especialidade, telefone, email, ativo, observacoes) VALUES
('Dr. Profissional Inativo', '11111111112', 'CRM 111111', 'Clínica Geral', '11911111113', 'inativo@clinica.com', false, 'Profissional que saiu da clínica'),
('Dra. Profissional Férias', '22222222223', 'CRM 222222', 'Pediatria', '11922222224', 'ferias@clinica.com', false, 'Profissional em férias prolongadas')
ON CONFLICT (cpf) DO NOTHING;

-- =====================================================
-- 3. CONSULTAS ÚTEIS PARA PÁGINA PROFISSIONAIS
-- =====================================================

-- Estatísticas de profissionais
SELECT 
    'Estatísticas de Profissionais' as categoria,
    COUNT(*) as total_profissionais,
    COUNT(CASE WHEN ativo = true THEN 1 END) as profissionais_ativos,
    COUNT(CASE WHEN ativo = false THEN 1 END) as profissionais_inativos,
    COUNT(DISTINCT especialidade) as especialidades_diferentes,
    AVG(experiencia_anos) as experiencia_media_anos,
    MIN(experiencia_anos) as menor_experiencia,
    MAX(experiencia_anos) as maior_experiencia
FROM profissionais;

-- Profissionais por especialidade
SELECT 
    'Profissionais por Especialidade' as categoria,
    especialidade,
    COUNT(*) as quantidade,
    COUNT(CASE WHEN ativo = true THEN 1 END) as ativos,
    COUNT(CASE WHEN ativo = false THEN 1 END) as inativos
FROM profissionais 
GROUP BY especialidade
ORDER BY quantidade DESC;

-- Profissionais por faixa de experiência
SELECT 
    'Profissionais por Faixa de Experiência' as categoria,
    CASE 
        WHEN experiencia_anos < 5 THEN 'Menos de 5 anos'
        WHEN experiencia_anos BETWEEN 5 AND 10 THEN '5-10 anos'
        WHEN experiencia_anos BETWEEN 11 AND 20 THEN '11-20 anos'
        ELSE 'Mais de 20 anos'
    END as faixa_experiencia,
    COUNT(*) as quantidade
FROM profissionais 
WHERE ativo = true
GROUP BY 
    CASE 
        WHEN experiencia_anos < 5 THEN 'Menos de 5 anos'
        WHEN experiencia_anos BETWEEN 5 AND 10 THEN '5-10 anos'
        WHEN experiencia_anos BETWEEN 11 AND 20 THEN '11-20 anos'
        ELSE 'Mais de 20 anos'
    END
ORDER BY quantidade DESC;

-- Profissionais por faixa de valor de consulta
SELECT 
    'Profissionais por Faixa de Valor' as categoria,
    CASE 
        WHEN valor_consulta < 200 THEN 'Até R$ 200'
        WHEN valor_consulta BETWEEN 200 AND 300 THEN 'R$ 200-300'
        WHEN valor_consulta BETWEEN 301 AND 400 THEN 'R$ 301-400'
        ELSE 'Acima de R$ 400'
    END as faixa_valor,
    COUNT(*) as quantidade
FROM profissionais 
WHERE ativo = true AND valor_consulta IS NOT NULL
GROUP BY 
    CASE 
        WHEN valor_consulta < 200 THEN 'Até R$ 200'
        WHEN valor_consulta BETWEEN 200 AND 300 THEN 'R$ 200-300'
        WHEN valor_consulta BETWEEN 301 AND 400 THEN 'R$ 301-400'
        ELSE 'Acima de R$ 400'
    END
ORDER BY quantidade DESC;

-- Profissionais por disponibilidade
SELECT 
    'Profissionais por Disponibilidade' as categoria,
    CASE 
        WHEN disponibilidade->>'feriados' = 'true' AND disponibilidade->>'finais_semana' = 'true' THEN 'Feriados e Finais de Semana'
        WHEN disponibilidade->>'feriados' = 'true' THEN 'Apenas Feriados'
        WHEN disponibilidade->>'finais_semana' = 'true' THEN 'Apenas Finais de Semana'
        ELSE 'Apenas Dias Úteis'
    END as disponibilidade_tipo,
    COUNT(*) as quantidade
FROM profissionais 
WHERE ativo = true AND disponibilidade IS NOT NULL
GROUP BY 
    CASE 
        WHEN disponibilidade->>'feriados' = 'true' AND disponibilidade->>'finais_semana' = 'true' THEN 'Feriados e Finais de Semana'
        WHEN disponibilidade->>'feriados' = 'true' THEN 'Apenas Feriados'
        WHEN disponibilidade->>'finais_semana' = 'true' THEN 'Apenas Finais de Semana'
        ELSE 'Apenas Dias Úteis'
    END
ORDER BY quantidade DESC;

-- Profissionais cadastrados por mês (últimos 12 meses)
SELECT 
    'Profissionais Cadastrados por Mês' as categoria,
    DATE_TRUNC('month', data_cadastro) as mes,
    COUNT(*) as quantidade
FROM profissionais 
WHERE data_cadastro >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', data_cadastro)
ORDER BY mes DESC;

-- Top 5 especialidades mais comuns
SELECT 
    'Top 5 Especialidades' as categoria,
    especialidade,
    COUNT(*) as quantidade
FROM profissionais 
WHERE ativo = true
GROUP BY especialidade
ORDER BY quantidade DESC
LIMIT 5;

-- Profissionais com maior experiência
SELECT 
    'Profissionais com Maior Experiência' as categoria,
    nome,
    especialidade,
    experiencia_anos,
    valor_consulta
FROM profissionais 
WHERE ativo = true AND experiencia_anos IS NOT NULL
ORDER BY experiencia_anos DESC
LIMIT 5;

-- =====================================================
-- 4. DADOS PARA TESTE DE FILTROS E BUSCA
-- =====================================================

-- Profissionais com nomes similares (para teste de busca)
INSERT INTO profissionais (nome, cpf, crm, especialidade, telefone, email, ativo) VALUES
('Dr. Carlos Silva', '11111111113', 'CRM 111112', 'Cardiologia', '11911111114', 'carlos.silva2@clinica.com', true),
('Dr. Carlos Santos', '22222222224', 'CRM 222223', 'Cardiologia', '11922222225', 'carlos.santos@clinica.com', true),
('Dr. Carlos Costa', '33333333335', 'CRM 333334', 'Cardiologia', '11933333336', 'carlos.costa@clinica.com', true)
ON CONFLICT (cpf) DO NOTHING;

-- Profissionais com CRMs similares (para teste de busca)
INSERT INTO profissionais (nome, cpf, crm, especialidade, telefone, email, ativo) VALUES
('Dr. João Silva', '44444444445', 'CRM 123457', 'Ortopedia', '11944444446', 'joao.silva@clinica.com', true),
('Dr. João Santos', '55555555556', 'CRM 123458', 'Ortopedia', '11955555557', 'joao.santos@clinica.com', true),
('Dr. João Costa', '66666666667', 'CRM 123459', 'Ortopedia', '11966666668', 'joao.costa@clinica.com', true)
ON CONFLICT (cpf) DO NOTHING;

-- =====================================================
-- FIM DO SCRIPT PROFISSIONAIS
-- =====================================================

-- Este script cria dados de exemplo para:
-- - Lista completa de profissionais
-- - Dados profissionais variados
-- - Profissionais inativos
-- - Dados para testes de filtros e busca
-- - Estatísticas e relatórios
