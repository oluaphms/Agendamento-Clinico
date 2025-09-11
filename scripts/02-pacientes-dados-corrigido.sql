-- =====================================================
-- SCRIPT PARA PÁGINA PACIENTES - VERSÃO CORRIGIDA
-- =====================================================
-- Este script popula dados para a página Pacientes
-- Execute APÓS o script principal (00-setup-completo-sistema.sql)

-- =====================================================
-- 1. DADOS ADICIONAIS DE PACIENTES
-- =====================================================

-- Inserir mais pacientes de exemplo com dados completos
INSERT INTO pacientes (nome, cpf, data_nascimento, telefone, email, endereco, cidade, estado, cep, contato_emergencia, telefone_emergencia, historico_medico, alergias, medicamentos, convenio, numero_convenio, observacoes, status) VALUES
-- Pacientes com dados completos
('Luciana Ferreira', '11111111111', '1990-05-15', '11911111111', 'luciana.ferreira@email.com', 'Rua das Palmeiras, 100', 'São Paulo', 'SP', '01234-567', 'João Ferreira (Pai)', '11911111112', 'Hipertensão controlada', 'Penicilina', 'Losartana 50mg', 'Unimed', '123456789', 'Paciente pontual, sempre comparece aos agendamentos', 'ativo'),

('Pedro Henrique Silva', '22222222222', '1985-08-22', '11922222222', 'pedro.silva@email.com', 'Av. Paulista, 2000', 'São Paulo', 'SP', '01310-100', 'Maria Silva (Esposa)', '11922222223', 'Diabetes tipo 2', 'Nenhuma', 'Metformina 850mg', 'Bradesco Saúde', '987654321', 'Faz acompanhamento regular', 'ativo'),

('Carla Mendes', '33333333333', '1995-12-03', '11933333333', 'carla.mendes@email.com', 'Rua Augusta, 500', 'São Paulo', 'SP', '01305-000', 'Ana Mendes (Mãe)', '11933333334', 'Asma leve', 'Poeira, pólen', 'Budesonida inalador', 'SUS', 'SUS001', 'Estudante de medicina, muito interessada no tratamento', 'ativo'),

('Roberto Carlos', '44444444444', '1970-03-10', '11944444444', 'roberto.carlos@email.com', 'Rua Oscar Freire, 300', 'São Paulo', 'SP', '01426-001', 'Carlos Roberto (Filho)', '11944444445', 'Problemas cardíacos, colesterol alto', 'Nenhuma', 'Sinvastatina 20mg, AAS 100mg', 'Amil', '456789123', 'Paciente idoso, precisa de acompanhamento especial', 'ativo'),

('Fernanda Costa', '55555555555', '1988-07-18', '11955555555', 'fernanda.costa@email.com', 'Av. Faria Lima, 1500', 'São Paulo', 'SP', '04538-132', 'José Costa (Marido)', '11955555556', 'Gravidez de alto risco', 'Nenhuma', 'Ácido fólico, Ferro', 'NotreDame Intermédica', '789123456', 'Gestante, acompanhamento obstétrico', 'ativo'),

('Marcos Antonio', '66666666666', '1982-11-25', '11966666666', 'marcos.antonio@email.com', 'Rua Bela Cintra, 800', 'São Paulo', 'SP', '01415-000', 'Antonio Marcos (Pai)', '11966666667', 'Depressão, ansiedade', 'Nenhuma', 'Sertralina 50mg', 'Particular', 'PART001', 'Paciente em tratamento psiquiátrico', 'ativo'),

('Juliana Santos', '77777777777', '1993-01-14', '11977777777', 'juliana.santos@email.com', 'Av. Rebouças, 600', 'São Paulo', 'SP', '05402-000', 'Paulo Santos (Irmão)', '11977777778', 'Intolerância à lactose', 'Lactose', 'Lactase', 'SulAmérica', '321654987', 'Profissional da saúde, muito cuidadosa', 'ativo'),

('Ricardo Oliveira', '88888888888', '1975-09-30', '11988888888', 'ricardo.oliveira@email.com', 'Rua Haddock Lobo, 400', 'São Paulo', 'SP', '01414-000', 'Cristina Oliveira (Esposa)', '11988888889', 'Nenhum', 'Nenhuma', 'Nenhum', 'Particular', 'PART002', 'Colega médico, referência de outros pacientes', 'ativo'),

('Patricia Lima', '99999999999', '1987-04-12', '11999999999', 'patricia.lima@email.com', 'Rua da Consolação, 1200', 'São Paulo', 'SP', '01302-000', 'Lima Patricia (Mãe)', '11999999998', 'Enxaqueca', 'Chocolate, queijo', 'Sumatriptano', 'Golden Cross', '654987321', 'Paciente com histórico de enxaqueca crônica', 'ativo'),

('Felipe Rodrigues', '00000000000', '1991-06-08', '11900000000', 'felipe.rodrigues@email.com', 'Av. 9 de Julho, 3000', 'São Paulo', 'SP', '01307-000', 'Rodrigues Felipe (Pai)', '11900000001', 'Problemas de coluna', 'Nenhuma', 'Diclofenaco quando necessário', 'SUS', 'SUS002', 'Trabalha muito tempo sentado, dores na coluna', 'ativo')
ON CONFLICT (cpf) DO NOTHING;

-- =====================================================
-- 2. PACIENTES INATIVOS (PARA TESTE DE FILTROS)
-- =====================================================

INSERT INTO pacientes (nome, cpf, data_nascimento, telefone, email, status, observacoes) VALUES
('Paciente Inativo 1', '11111111112', '1980-01-01', '11911111113', 'inativo1@email.com', 'inativo', 'Paciente que não retorna há mais de 1 ano'),
('Paciente Inativo 2', '22222222223', '1975-05-15', '11922222224', 'inativo2@email.com', 'inativo', 'Paciente que mudou de cidade'),
('Paciente Suspenso', '33333333334', '1990-10-20', '11933333335', 'suspenso@email.com', 'suspenso', 'Paciente com pendências financeiras')
ON CONFLICT (cpf) DO NOTHING;

-- =====================================================
-- 3. CONSULTAS ÚTEIS PARA PÁGINA PACIENTES
-- =====================================================

-- Estatísticas de pacientes
SELECT 
    'Estatísticas de Pacientes' as categoria,
    COUNT(*) as total_pacientes,
    COUNT(CASE WHEN status = 'ativo' THEN 1 END) as pacientes_ativos,
    COUNT(CASE WHEN status = 'inativo' THEN 1 END) as pacientes_inativos,
    COUNT(CASE WHEN status = 'suspenso' THEN 1 END) as pacientes_suspensos,
    COUNT(CASE WHEN data_nascimento >= CURRENT_DATE - INTERVAL '18 years' THEN 1 END) as pacientes_menores,
    COUNT(CASE WHEN data_nascimento < CURRENT_DATE - INTERVAL '65 years' THEN 1 END) as pacientes_idosos
FROM pacientes;

-- Pacientes por faixa etária
SELECT 
    'Pacientes por Faixa Etária' as categoria,
    CASE 
        WHEN EXTRACT(YEAR FROM AGE(data_nascimento)) < 18 THEN 'Menores de 18 anos'
        WHEN EXTRACT(YEAR FROM AGE(data_nascimento)) BETWEEN 18 AND 30 THEN '18-30 anos'
        WHEN EXTRACT(YEAR FROM AGE(data_nascimento)) BETWEEN 31 AND 50 THEN '31-50 anos'
        WHEN EXTRACT(YEAR FROM AGE(data_nascimento)) BETWEEN 51 AND 65 THEN '51-65 anos'
        ELSE 'Acima de 65 anos'
    END as faixa_etaria,
    COUNT(*) as quantidade
FROM pacientes 
WHERE status = 'ativo'
GROUP BY 
    CASE 
        WHEN EXTRACT(YEAR FROM AGE(data_nascimento)) < 18 THEN 'Menores de 18 anos'
        WHEN EXTRACT(YEAR FROM AGE(data_nascimento)) BETWEEN 18 AND 30 THEN '18-30 anos'
        WHEN EXTRACT(YEAR FROM AGE(data_nascimento)) BETWEEN 31 AND 50 THEN '31-50 anos'
        WHEN EXTRACT(YEAR FROM AGE(data_nascimento)) BETWEEN 51 AND 65 THEN '51-65 anos'
        ELSE 'Acima de 65 anos'
    END
ORDER BY quantidade DESC;

-- Pacientes por convênio
SELECT 
    'Pacientes por Convênio' as categoria,
    COALESCE(convenio, 'Particular') as convenio,
    COUNT(*) as quantidade
FROM pacientes 
WHERE status = 'ativo'
GROUP BY convenio
ORDER BY quantidade DESC;

-- Pacientes com alergias
SELECT 
    'Pacientes com Alergias' as categoria,
    COUNT(CASE WHEN alergias IS NOT NULL AND alergias != '' THEN 1 END) as com_alergias,
    COUNT(CASE WHEN alergias IS NULL OR alergias = '' THEN 1 END) as sem_alergias
FROM pacientes 
WHERE status = 'ativo';

-- Pacientes com medicamentos
SELECT 
    'Pacientes com Medicamentos' as categoria,
    COUNT(CASE WHEN medicamentos IS NOT NULL AND medicamentos != '' THEN 1 END) as com_medicamentos,
    COUNT(CASE WHEN medicamentos IS NULL OR medicamentos = '' THEN 1 END) as sem_medicamentos
FROM pacientes 
WHERE status = 'ativo';

-- Pacientes cadastrados por mês (últimos 12 meses)
SELECT 
    'Pacientes Cadastrados por Mês' as categoria,
    DATE_TRUNC('month', created_at) as mes,
    COUNT(*) as quantidade
FROM pacientes 
WHERE created_at >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY mes DESC;

-- =====================================================
-- 4. DADOS PARA TESTE DE FILTROS E BUSCA
-- =====================================================

-- Pacientes com nomes similares (para teste de busca)
INSERT INTO pacientes (nome, cpf, data_nascimento, telefone, email, status) VALUES
('Ana Silva', '11111111113', '1990-01-01', '11911111114', 'ana.silva@email.com', 'ativo'),
('Ana Santos', '22222222224', '1991-02-02', '11922222225', 'ana.santos@email.com', 'ativo'),
('Ana Costa', '33333333335', '1992-03-03', '11933333336', 'ana.costa@email.com', 'ativo')
ON CONFLICT (cpf) DO NOTHING;

-- Pacientes com CPFs similares (para teste de busca)
INSERT INTO pacientes (nome, cpf, data_nascimento, telefone, email, status) VALUES
('João Silva', '11111111114', '1985-01-01', '11911111115', 'joao.silva@email.com', 'ativo'),
('João Santos', '11111111115', '1986-02-02', '11911111116', 'joao.santos@email.com', 'ativo'),
('João Costa', '11111111116', '1987-03-03', '11911111117', 'joao.costa@email.com', 'ativo')
ON CONFLICT (cpf) DO NOTHING;

-- =====================================================
-- FIM DO SCRIPT PACIENTES
-- =====================================================

-- Este script cria dados de exemplo para:
-- - Lista completa de pacientes
-- - Dados demográficos variados
-- - Pacientes inativos e suspensos
-- - Dados para testes de filtros e busca
-- - Estatísticas e relatórios
