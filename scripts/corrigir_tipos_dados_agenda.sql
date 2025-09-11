-- =====================================================
-- CORRIGIR TIPOS DE DADOS DA AGENDA
-- Script para corrigir tipos de dados de forma segura
-- =====================================================

-- 1. VERIFICAR TIPOS ATUAIS
SELECT 
    'Tipos atuais:' as info,
    table_name as tabela,
    column_name as coluna,
    data_type as tipo,
    is_nullable as pode_ser_null
FROM information_schema.columns 
WHERE table_name IN ('agendamentos', 'profissionais', 'servicos')
AND column_name = 'id'
ORDER BY table_name;

-- 2. CORRIGIR TABELA PROFISSIONAIS
-- Adicionar coluna UUID temporária
ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS id_uuid UUID DEFAULT uuid_generate_v4();

-- Popular coluna UUID com valores únicos
UPDATE profissionais 
SET id_uuid = uuid_generate_v4()
WHERE id_uuid IS NULL;

-- Atualizar agendamentos para usar UUID
UPDATE agendamentos 
SET profissional_id = p.id_uuid
FROM profissionais p
WHERE agendamentos.profissional_id = p.id;

-- 3. CORRIGIR TABELA SERVICOS
-- Adicionar coluna UUID temporária
ALTER TABLE servicos ADD COLUMN IF NOT EXISTS id_uuid UUID DEFAULT uuid_generate_v4();

-- Popular coluna UUID com valores únicos
UPDATE servicos 
SET id_uuid = uuid_generate_v4()
WHERE id_uuid IS NULL;

-- Atualizar agendamentos para usar UUID
UPDATE agendamentos 
SET servico_id = s.id_uuid
FROM servicos s
WHERE agendamentos.servico_id = s.id;

-- 4. ALTERAR TIPOS DAS COLUNAS EM AGENDAMENTOS
-- Alterar profissional_id para UUID
ALTER TABLE agendamentos ALTER COLUMN profissional_id TYPE UUID USING profissional_id::UUID;

-- Alterar servico_id para UUID
ALTER TABLE agendamentos ALTER COLUMN servico_id TYPE UUID USING servico_id::UUID;

-- 5. REMOVER CONSTRAINTS ANTIGAS
-- Remover foreign keys antigas
ALTER TABLE agendamentos DROP CONSTRAINT IF EXISTS agendamentos_profissional_id_fkey;
ALTER TABLE agendamentos DROP CONSTRAINT IF EXISTS agendamentos_servico_id_fkey;

-- Remover constraint UNIQUE antiga
ALTER TABLE agendamentos DROP CONSTRAINT IF EXISTS agendamentos_profissional_id_data_hora_key;

-- 6. ALTERAR TIPOS DAS TABELAS DE REFERÊNCIA
-- Alterar id de profissionais para UUID
ALTER TABLE profissionais ALTER COLUMN id TYPE UUID USING id_uuid;

-- Alterar id de servicos para UUID
ALTER TABLE servicos ALTER COLUMN id TYPE UUID USING id_uuid;

-- 7. REMOVER COLUNAS TEMPORÁRIAS
-- Remover colunas UUID temporárias
ALTER TABLE profissionais DROP COLUMN IF EXISTS id_uuid;
ALTER TABLE servicos DROP COLUMN IF EXISTS id_uuid;

-- 8. RECRIAR CONSTRAINTS
-- Adicionar foreign keys novas
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

-- 9. VERIFICAR ESTRUTURA FINAL
SELECT 
    'Estrutura final:' as info,
    table_name as tabela,
    column_name as coluna,
    data_type as tipo,
    is_nullable as pode_ser_null
FROM information_schema.columns 
WHERE table_name IN ('agendamentos', 'profissionais', 'servicos')
ORDER BY table_name, ordinal_position;

-- 10. TESTAR RELACIONAMENTOS
SELECT 
    'Teste de relacionamentos:' as info,
    a.id as agendamento_id,
    a.data,
    a.hora,
    p.nome as profissional,
    s.nome as servico
FROM agendamentos a
LEFT JOIN profissionais p ON a.profissional_id = p.id
LEFT JOIN servicos s ON a.servico_id = s.id
LIMIT 5;
