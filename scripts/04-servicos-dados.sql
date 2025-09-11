-- =====================================================
-- SCRIPT PARA PÁGINA SERVIÇOS
-- =====================================================
-- Este script popula dados para a página Serviços
-- Execute APÓS o script principal (00-setup-completo-sistema.sql)

-- =====================================================
-- 1. DADOS ADICIONAIS DE SERVIÇOS
-- =====================================================

-- Inserir mais serviços de exemplo com dados completos
INSERT INTO servicos (nome, descricao, duracao_min, preco, categoria, ativo) VALUES
-- Consultas médicas
('Consulta Cardiológica', 'Consulta com cardiologista para avaliação cardíaca', 45, '300.00', 'Consulta', true),
('Consulta Dermatológica', 'Consulta com dermatologista para avaliação da pele', 30, '250.00', 'Consulta', true),
('Consulta Ortopédica', 'Consulta com ortopedista para avaliação musculoesquelética', 40, '280.00', 'Consulta', true),
('Consulta Ginecológica', 'Consulta com ginecologista para avaliação da saúde feminina', 35, '220.00', 'Consulta', true),
('Consulta Neurológica', 'Consulta com neurologista para avaliação neurológica', 50, '350.00', 'Consulta', true),
('Consulta Pediátrica', 'Consulta com pediatra para avaliação infantil', 30, '200.00', 'Consulta', true),
('Consulta Oftalmológica', 'Consulta com oftalmologista para avaliação da visão', 40, '320.00', 'Consulta', true),
('Consulta Psiquiátrica', 'Consulta com psiquiatra para avaliação mental', 50, '220.00', 'Consulta', true),
('Consulta Urológica', 'Consulta com urologista para avaliação urológica', 35, '380.00', 'Consulta', true),
('Consulta Endocrinológica', 'Consulta com endocrinologista para avaliação hormonal', 40, '260.00', 'Consulta', true),

-- Exames laboratoriais
('Hemograma Completo', 'Exame de sangue para avaliação geral da saúde', 15, '80.00', 'Exame Laboratorial', true),
('Glicemia de Jejum', 'Exame de glicose no sangue em jejum', 10, '25.00', 'Exame Laboratorial', true),
('Colesterol Total', 'Exame de colesterol no sangue', 10, '30.00', 'Exame Laboratorial', true),
('Triglicerídeos', 'Exame de triglicerídeos no sangue', 10, '30.00', 'Exame Laboratorial', true),
('Creatinina', 'Exame de função renal', 10, '25.00', 'Exame Laboratorial', true),
('TGO/TGP', 'Exames de função hepática', 10, '35.00', 'Exame Laboratorial', true),
('TSH', 'Exame de função da tireoide', 10, '40.00', 'Exame Laboratorial', true),
('Vitamina D', 'Exame de vitamina D no sangue', 10, '60.00', 'Exame Laboratorial', true),
('Ferritina', 'Exame de reserva de ferro', 10, '45.00', 'Exame Laboratorial', true),
('Proteína C Reativa', 'Exame de inflamação', 10, '35.00', 'Exame Laboratorial', true),

-- Exames de imagem
('Ultrassom Abdominal', 'Exame de ultrassom do abdome', 30, '200.00', 'Exame de Imagem', true),
('Ultrassom Pélvico', 'Exame de ultrassom da pelve', 30, '180.00', 'Exame de Imagem', true),
('Ultrassom Obstétrico', 'Exame de ultrassom para gestantes', 45, '250.00', 'Exame de Imagem', true),
('Ultrassom de Mama', 'Exame de ultrassom das mamas', 30, '220.00', 'Exame de Imagem', true),
('Ultrassom de Tireoide', 'Exame de ultrassom da tireoide', 20, '150.00', 'Exame de Imagem', true),
('Radiografia de Tórax', 'Raio-X do tórax', 15, '80.00', 'Exame de Imagem', true),
('Radiografia de Coluna', 'Raio-X da coluna vertebral', 20, '100.00', 'Exame de Imagem', true),
('Radiografia de Joelho', 'Raio-X do joelho', 15, '90.00', 'Exame de Imagem', true),
('Mamografia', 'Exame de rastreamento do câncer de mama', 30, '120.00', 'Exame de Imagem', true),
('Densitometria Óssea', 'Exame de densidade óssea', 30, '180.00', 'Exame de Imagem', true),

-- Exames cardiológicos
('Eletrocardiograma', 'Exame do coração (ECG)', 20, '120.00', 'Exame Cardiológico', true),
('Ecocardiograma', 'Ultrassom do coração', 45, '300.00', 'Exame Cardiológico', true),
('Teste Ergométrico', 'Teste de esforço na esteira', 60, '400.00', 'Exame Cardiológico', true),
('Holter 24h', 'Monitoramento cardíaco por 24 horas', 10, '250.00', 'Exame Cardiológico', true),
('MAP 24h', 'Monitoramento da pressão arterial por 24 horas', 10, '200.00', 'Exame Cardiológico', true),

-- Exames endoscópicos
('Endoscopia Digestiva', 'Exame do estômago e esôfago', 30, '350.00', 'Exame Endoscópico', true),
('Colonoscopia', 'Exame do intestino grosso', 60, '500.00', 'Exame Endoscópico', true),
('Broncoscopia', 'Exame dos pulmões', 45, '400.00', 'Exame Endoscópico', true),

-- Procedimentos estéticos
('Botox', 'Aplicação de toxina botulínica', 30, '800.00', 'Procedimento Estético', true),
('Preenchimento Facial', 'Aplicação de ácido hialurônico', 45, '1200.00', 'Procedimento Estético', true),
('Laser Facial', 'Tratamento com laser para rejuvenescimento', 60, '600.00', 'Procedimento Estético', true),
('Limpeza de Pele', 'Procedimento de limpeza facial profunda', 60, '200.00', 'Procedimento Estético', true),
('Peeling Químico', 'Tratamento com ácidos para renovação da pele', 45, '300.00', 'Procedimento Estético', true),

-- Vacinas
('Vacina da Gripe', 'Vacina contra influenza', 10, '80.00', 'Vacina', true),
('Vacina COVID-19', 'Vacina contra COVID-19', 15, '0.00', 'Vacina', true),
('Vacina Hepatite B', 'Vacina contra hepatite B', 10, '60.00', 'Vacina', true),
('Vacina Tétano', 'Vacina contra tétano', 10, '50.00', 'Vacina', true),
('Vacina Febre Amarela', 'Vacina contra febre amarela', 10, '70.00', 'Vacina', true)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 2. SERVIÇOS INATIVOS (PARA TESTE DE FILTROS)
-- =====================================================

INSERT INTO servicos (nome, descricao, duracao_min, preco, categoria, ativo) VALUES
('Serviço Descontinuado', 'Serviço que não é mais oferecido', 30, '100.00', 'Consulta', false),
('Exame Antigo', 'Exame que foi substituído por outro', 20, '50.00', 'Exame', false),
('Procedimento Suspenso', 'Procedimento temporariamente suspenso', 45, '200.00', 'Procedimento', false)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 3. CONSULTAS ÚTEIS PARA PÁGINA SERVIÇOS
-- =====================================================

-- Estatísticas de serviços
SELECT 
    'Estatísticas de Serviços' as categoria,
    COUNT(*) as total_servicos,
    COUNT(CASE WHEN ativo = true THEN 1 END) as servicos_ativos,
    COUNT(CASE WHEN ativo = false THEN 1 END) as servicos_inativos,
    COUNT(DISTINCT categoria) as categorias_diferentes,
    AVG(duracao_min) as duracao_media_minutos,
    MIN(duracao_min) as menor_duracao,
    MAX(duracao_min) as maior_duracao,
    AVG(CAST(preco AS DECIMAL)) as preco_medio,
    MIN(CAST(preco AS DECIMAL)) as menor_preco,
    MAX(CAST(preco AS DECIMAL)) as maior_preco
FROM servicos;

-- Serviços por categoria
SELECT 
    'Serviços por Categoria' as categoria,
    COALESCE(categoria, 'Sem categoria') as categoria_nome,
    COUNT(*) as quantidade,
    COUNT(CASE WHEN ativo = true THEN 1 END) as ativos,
    COUNT(CASE WHEN ativo = false THEN 1 END) as inativos
FROM servicos 
GROUP BY categoria
ORDER BY quantidade DESC;

-- Serviços por faixa de duração
SELECT 
    'Serviços por Faixa de Duração' as categoria,
    CASE 
        WHEN duracao_min < 15 THEN 'Menos de 15 min'
        WHEN duracao_min BETWEEN 15 AND 30 THEN '15-30 min'
        WHEN duracao_min BETWEEN 31 AND 60 THEN '31-60 min'
        ELSE 'Mais de 60 min'
    END as faixa_duracao,
    COUNT(*) as quantidade
FROM servicos 
WHERE ativo = true
GROUP BY 
    CASE 
        WHEN duracao_min < 15 THEN 'Menos de 15 min'
        WHEN duracao_min BETWEEN 15 AND 30 THEN '15-30 min'
        WHEN duracao_min BETWEEN 31 AND 60 THEN '31-60 min'
        ELSE 'Mais de 60 min'
    END
ORDER BY quantidade DESC;

-- Serviços por faixa de preço
SELECT 
    'Serviços por Faixa de Preço' as categoria,
    CASE 
        WHEN CAST(preco AS DECIMAL) < 50 THEN 'Até R$ 50'
        WHEN CAST(preco AS DECIMAL) BETWEEN 50 AND 100 THEN 'R$ 50-100'
        WHEN CAST(preco AS DECIMAL) BETWEEN 101 AND 200 THEN 'R$ 101-200'
        WHEN CAST(preco AS DECIMAL) BETWEEN 201 AND 500 THEN 'R$ 201-500'
        ELSE 'Acima de R$ 500'
    END as faixa_preco,
    COUNT(*) as quantidade
FROM servicos 
WHERE ativo = true
GROUP BY 
    CASE 
        WHEN CAST(preco AS DECIMAL) < 50 THEN 'Até R$ 50'
        WHEN CAST(preco AS DECIMAL) BETWEEN 50 AND 100 THEN 'R$ 50-100'
        WHEN CAST(preco AS DECIMAL) BETWEEN 101 AND 200 THEN 'R$ 101-200'
        WHEN CAST(preco AS DECIMAL) BETWEEN 201 AND 500 THEN 'R$ 201-500'
        ELSE 'Acima de R$ 500'
    END
ORDER BY quantidade DESC;

-- Serviços mais caros
SELECT 
    'Serviços Mais Caros' as categoria,
    nome,
    categoria as categoria_servico,
    duracao_min,
    preco
FROM servicos 
WHERE ativo = true
ORDER BY CAST(preco AS DECIMAL) DESC
LIMIT 10;

-- Serviços mais longos
SELECT 
    'Serviços Mais Longos' as categoria,
    nome,
    categoria as categoria_servico,
    duracao_min,
    preco
FROM servicos 
WHERE ativo = true
ORDER BY duracao_min DESC
LIMIT 10;

-- Serviços cadastrados por mês (últimos 12 meses)
SELECT 
    'Serviços Cadastrados por Mês' as categoria,
    DATE_TRUNC('month', data_cadastro) as mes,
    COUNT(*) as quantidade
FROM servicos 
WHERE data_cadastro >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', data_cadastro)
ORDER BY mes DESC;

-- Top 5 categorias mais comuns
SELECT 
    'Top 5 Categorias' as categoria,
    COALESCE(categoria, 'Sem categoria') as categoria_nome,
    COUNT(*) as quantidade
FROM servicos 
WHERE ativo = true
GROUP BY categoria
ORDER BY quantidade DESC
LIMIT 5;

-- Serviços gratuitos
SELECT 
    'Serviços Gratuitos' as categoria,
    nome,
    categoria as categoria_servico,
    duracao_min
FROM servicos 
WHERE ativo = true AND CAST(preco AS DECIMAL) = 0
ORDER BY nome;

-- =====================================================
-- 4. DADOS PARA TESTE DE FILTROS E BUSCA
-- =====================================================

-- Serviços com nomes similares (para teste de busca)
INSERT INTO servicos (nome, descricao, duracao_min, preco, categoria, ativo) VALUES
('Consulta de Teste 1', 'Consulta de teste para busca', 30, '100.00', 'Consulta', true),
('Consulta de Teste 2', 'Outra consulta de teste', 30, '100.00', 'Consulta', true),
('Exame de Teste 1', 'Exame de teste para busca', 20, '50.00', 'Exame', true),
('Exame de Teste 2', 'Outro exame de teste', 20, '50.00', 'Exame', true)
ON CONFLICT DO NOTHING;

-- =====================================================
-- FIM DO SCRIPT SERVIÇOS
-- =====================================================

-- Este script cria dados de exemplo para:
-- - Lista completa de serviços
-- - Dados de serviços variados
-- - Serviços inativos
-- - Dados para testes de filtros e busca
-- - Estatísticas e relatórios
