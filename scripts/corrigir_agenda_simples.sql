-- =====================================================
-- CORRIGIR AGENDA SIMPLES
-- Script seguro para corrigir apenas problemas essenciais
-- =====================================================

-- 1. VERIFICAR ESTRUTURA ATUAL
SELECT 
    'Estrutura atual:' as info,
    table_name as tabela,
    column_name as coluna,
    data_type as tipo
FROM information_schema.columns 
WHERE table_name = 'agendamentos'
ORDER BY ordinal_position;

-- 2. PERMITIR PACIENTE NULL PARA BLOQUEIOS
-- Alterar constraint para permitir NULL (se não for NULL já)
DO $$
BEGIN
    -- Verificar se a coluna permite NULL
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'agendamentos' 
        AND column_name = 'paciente_id' 
        AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE agendamentos ALTER COLUMN paciente_id DROP NOT NULL;
        RAISE NOTICE 'Coluna paciente_id agora permite NULL';
    ELSE
        RAISE NOTICE 'Coluna paciente_id já permite NULL';
    END IF;
END $$;

-- 3. ADICIONAR CAMPOS FALTANTES SE NÃO EXISTIREM
-- Adicionar campo motivo_cancelamento se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'agendamentos' AND column_name = 'motivo_cancelamento'
    ) THEN
        ALTER TABLE agendamentos ADD COLUMN motivo_cancelamento TEXT;
        RAISE NOTICE 'Campo motivo_cancelamento adicionado';
    ELSE
        RAISE NOTICE 'Campo motivo_cancelamento já existe';
    END IF;
END $$;

-- Adicionar campo cancelado_por se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'agendamentos' AND column_name = 'cancelado_por'
    ) THEN
        ALTER TABLE agendamentos ADD COLUMN cancelado_por UUID REFERENCES usuarios(id);
        RAISE NOTICE 'Campo cancelado_por adicionado';
    ELSE
        RAISE NOTICE 'Campo cancelado_por já existe';
    END IF;
END $$;

-- Adicionar campo cancelado_em se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'agendamentos' AND column_name = 'cancelado_em'
    ) THEN
        ALTER TABLE agendamentos ADD COLUMN cancelado_em TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Campo cancelado_em adicionado';
    ELSE
        RAISE NOTICE 'Campo cancelado_em já existe';
    END IF;
END $$;

-- Adicionar campo duracao_real se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'agendamentos' AND column_name = 'duracao_real'
    ) THEN
        ALTER TABLE agendamentos ADD COLUMN duracao_real INTEGER;
        RAISE NOTICE 'Campo duracao_real adicionado';
    ELSE
        RAISE NOTICE 'Campo duracao_real já existe';
    END IF;
END $$;

-- 4. CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_agendamentos_paciente_id ON agendamentos(paciente_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_profissional_id ON agendamentos(profissional_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_servico_id ON agendamentos(servico_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_data ON agendamentos(data);
CREATE INDEX IF NOT EXISTS idx_agendamentos_status ON agendamentos(status);
CREATE INDEX IF NOT EXISTS idx_agendamentos_data_hora ON agendamentos(data, hora);

-- 5. VERIFICAR ESTRUTURA FINAL
SELECT 
    'Estrutura final:' as info,
    table_name as tabela,
    column_name as coluna,
    data_type as tipo,
    is_nullable as pode_ser_null
FROM information_schema.columns 
WHERE table_name = 'agendamentos'
ORDER BY ordinal_position;

-- 6. TESTAR INSERÇÃO DE HORÁRIO BLOQUEADO
DO $$
BEGIN
    -- Tentar inserir um horário bloqueado (sem paciente)
    INSERT INTO agendamentos (
        paciente_id,
        profissional_id,
        servico_id,
        data,
        hora,
        status,
        observacoes
    ) VALUES (
        NULL, -- paciente_id NULL para bloqueio
        1,    -- profissional_id (assumindo que existe)
        1,    -- servico_id (assumindo que existe)
        CURRENT_DATE,
        '14:00:00',
        'bloqueado',
        'Horário bloqueado para teste'
    );
    
    RAISE NOTICE 'Teste de horário bloqueado: SUCESSO';
    
    -- Remover o registro de teste
    DELETE FROM agendamentos 
    WHERE observacoes = 'Horário bloqueado para teste';
    
    RAISE NOTICE 'Registro de teste removido';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Teste de horário bloqueado: FALHOU - %', SQLERRM;
END $$;

-- 7. VERIFICAR DADOS EXISTENTES
SELECT 
    'Dados existentes:' as info,
    COUNT(*) as total_agendamentos,
    COUNT(CASE WHEN paciente_id IS NULL THEN 1 END) as horarios_bloqueados,
    COUNT(CASE WHEN status = 'agendado' THEN 1 END) as agendados,
    COUNT(CASE WHEN status = 'confirmado' THEN 1 END) as confirmados,
    COUNT(CASE WHEN status = 'cancelado' THEN 1 END) as cancelados
FROM agendamentos;
