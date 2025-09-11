-- =====================================================
-- CORRIGIR ESTRUTURA DA AGENDA
-- Script para padronizar IDs e corrigir relacionamentos
-- =====================================================

-- 1. VERIFICAR ESTRUTURA ATUAL
SELECT 
    'Estrutura atual das tabelas:' as info,
    table_name as tabela,
    column_name as coluna,
    data_type as tipo,
    is_nullable as pode_ser_null
FROM information_schema.columns 
WHERE table_name IN ('agendamentos', 'pacientes', 'profissionais', 'servicos')
ORDER BY table_name, ordinal_position;

-- 2. CRIAR NOVAS COLUNAS UUID (TEMPORÁRIAS)
-- Adicionar colunas UUID temporárias para profissionais
ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS id_uuid UUID DEFAULT uuid_generate_v4();

-- Adicionar colunas UUID temporárias para servicos
ALTER TABLE servicos ADD COLUMN IF NOT EXISTS id_uuid UUID DEFAULT uuid_generate_v4();

-- Adicionar colunas UUID temporárias para agendamentos
ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS profissional_id_uuid UUID;
ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS servico_id_uuid UUID;

-- 3. POPULAR COLUNAS UUID TEMPORÁRIAS
-- Gerar UUIDs únicos para profissionais existentes
UPDATE profissionais 
SET id_uuid = uuid_generate_v4()
WHERE id_uuid IS NULL;

-- Gerar UUIDs únicos para servicos existentes
UPDATE servicos 
SET id_uuid = uuid_generate_v4()
WHERE id_uuid IS NULL;

-- 4. ATUALIZAR RELACIONAMENTOS EM AGENDAMENTOS
-- Mapear profissional_id (INTEGER) para profissional_id_uuid (UUID)
UPDATE agendamentos 
SET profissional_id_uuid = p.id_uuid
FROM profissionais p
WHERE agendamentos.profissional_id = p.id;

-- Mapear servico_id (INTEGER) para servico_id_uuid (UUID)
UPDATE agendamentos 
SET servico_id_uuid = s.id_uuid
FROM servicos s
WHERE agendamentos.servico_id = s.id;

-- 5. REMOVER CONSTRAINTS ANTIGAS
-- Remover constraint UNIQUE antiga
ALTER TABLE agendamentos DROP CONSTRAINT IF EXISTS agendamentos_profissional_id_data_hora_key;

-- Remover foreign keys antigas
ALTER TABLE agendamentos DROP CONSTRAINT IF EXISTS agendamentos_profissional_id_fkey;
ALTER TABLE agendamentos DROP CONSTRAINT IF EXISTS agendamentos_servico_id_fkey;

-- 6. REMOVER COLUNAS ANTIGAS
-- Remover colunas INTEGER antigas
ALTER TABLE agendamentos DROP COLUMN IF EXISTS profissional_id;
ALTER TABLE agendamentos DROP COLUMN IF EXISTS servico_id;

-- 7. RENOMEAR COLUNAS UUID PARA NOMES FINAIS
-- Renomear colunas UUID para nomes finais
ALTER TABLE agendamentos RENAME COLUMN profissional_id_uuid TO profissional_id;
ALTER TABLE agendamentos RENAME COLUMN servico_id TO servico_id;

-- Renomear colunas UUID nas tabelas de referência
ALTER TABLE profissionais RENAME COLUMN id_uuid TO id_new;
ALTER TABLE servicos RENAME COLUMN id_uuid TO id_new;

-- 8. REMOVER COLUNAS INTEGER ANTIGAS
-- Remover colunas INTEGER antigas das tabelas de referência
ALTER TABLE profissionais DROP COLUMN IF EXISTS id;
ALTER TABLE servicos DROP COLUMN IF EXISTS id;

-- 9. RENOMEAR COLUNAS UUID PARA NOMES FINAIS
-- Renomear colunas UUID para nomes finais
ALTER TABLE profissionais RENAME COLUMN id_new TO id;
ALTER TABLE servicos RENAME COLUMN id_new TO id;

-- 10. ADICIONAR CONSTRAINTS NOVAS
-- Adicionar primary keys UUID
ALTER TABLE profissionais ADD PRIMARY KEY (id);
ALTER TABLE servicos ADD PRIMARY KEY (id);

-- Adicionar foreign keys UUID
ALTER TABLE agendamentos 
ADD CONSTRAINT agendamentos_profissional_id_fkey 
FOREIGN KEY (profissional_id) REFERENCES profissionais(id) ON DELETE CASCADE;

ALTER TABLE agendamentos 
ADD CONSTRAINT agendamentos_servico_id_fkey 
FOREIGN KEY (servico_id) REFERENCES servicos(id) ON DELETE CASCADE;

-- Adicionar constraint UNIQUE nova
ALTER TABLE agendamentos 
ADD CONSTRAINT agendamentos_profissional_data_hora_unique 
UNIQUE(profissional_id, data, hora);

-- 11. PERMITIR PACIENTE NULL PARA BLOQUEIOS
-- Alterar constraint para permitir NULL
ALTER TABLE agendamentos ALTER COLUMN paciente_id DROP NOT NULL;

-- 12. VERIFICAR ESTRUTURA FINAL
SELECT 
    'Estrutura final das tabelas:' as info,
    table_name as tabela,
    column_name as coluna,
    data_type as tipo,
    is_nullable as pode_ser_null
FROM information_schema.columns 
WHERE table_name IN ('agendamentos', 'pacientes', 'profissionais', 'servicos')
ORDER BY table_name, ordinal_position;

-- 13. VERIFICAR RELACIONAMENTOS
SELECT 
    'Relacionamentos criados:' as info,
    constraint_name as constraint,
    table_name as tabela,
    column_name as coluna,
    foreign_table_name as tabela_referenciada,
    foreign_column_name as coluna_referenciada
FROM information_schema.key_column_usage kcu
JOIN information_schema.referential_constraints rc ON kcu.constraint_name = rc.constraint_name
JOIN information_schema.key_column_usage fkcu ON rc.unique_constraint_name = fkcu.constraint_name
WHERE kcu.table_name IN ('agendamentos', 'pacientes', 'profissionais', 'servicos')
ORDER BY kcu.table_name, kcu.constraint_name;

-- 14. TESTAR ESTRUTURA
SELECT 
    'Teste da estrutura:' as info,
    'Agendamentos' as tabela,
    COUNT(*) as total_registros
FROM agendamentos
UNION ALL
SELECT 
    'Profissionais' as tabela,
    COUNT(*) as total_registros
FROM profissionais
UNION ALL
SELECT 
    'Servicos' as tabela,
    COUNT(*) as total_registros
FROM servicos
UNION ALL
SELECT 
    'Pacientes' as tabela,
    COUNT(*) as total_registros
FROM pacientes;
