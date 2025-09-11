-- =====================================================
-- CORRIGIR TIPOS EXISTENTES NO SUPABASE
-- =====================================================
-- Este script verifica e cria apenas os tipos que não existem
-- Execute este script no Supabase SQL Editor

-- Verificar e criar tipos apenas se não existirem
DO $$ 
BEGIN
    -- Status de usuários
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_usuario') THEN
        CREATE TYPE status_usuario AS ENUM ('ativo', 'inativo', 'suspenso');
    END IF;

    -- Níveis de acesso
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'nivel_acesso') THEN
        CREATE TYPE nivel_acesso AS ENUM ('admin', 'recepcao', 'profissional', 'desenvolvedor');
    END IF;

    -- Gêneros
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'genero') THEN
        CREATE TYPE genero AS ENUM ('masculino', 'feminino', 'outro');
    END IF;

    -- Status de profissionais
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_profissional') THEN
        CREATE TYPE status_profissional AS ENUM ('ativo', 'inativo', 'ferias');
    END IF;

    -- Status de agendamentos
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_agendamento') THEN
        CREATE TYPE status_agendamento AS ENUM ('agendado', 'confirmado', 'em_andamento', 'concluido', 'cancelado', 'faltou');
    END IF;

    -- Status de pagamentos
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_pagamento') THEN
        CREATE TYPE status_pagamento AS ENUM ('pendente', 'pago', 'cancelado', 'reembolsado');
    END IF;

    -- Formas de pagamento
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'forma_pagamento') THEN
        CREATE TYPE forma_pagamento AS ENUM ('dinheiro', 'cartao_credito', 'cartao_debito', 'pix', 'transferencia', 'convenio');
    END IF;

    -- Tipos de auditoria
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_auditoria') THEN
        CREATE TYPE tipo_auditoria AS ENUM ('create', 'update', 'delete', 'login', 'logout', 'password_change');
    END IF;

    -- Temas do sistema
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tema_sistema') THEN
        CREATE TYPE tema_sistema AS ENUM ('claro', 'escuro', 'auto');
    END IF;

    -- Idiomas
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'idioma_sistema') THEN
        CREATE TYPE idioma_sistema AS ENUM ('pt', 'en', 'es');
    END IF;

    -- Frequências de backup
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'frequencia_backup') THEN
        CREATE TYPE frequencia_backup AS ENUM ('diario', 'semanal', 'mensal');
    END IF;
END $$;

-- Verificar se todos os tipos foram criados
SELECT typname, typtype 
FROM pg_type 
WHERE typname IN (
    'status_usuario', 'nivel_acesso', 'genero', 'status_profissional',
    'status_agendamento', 'status_pagamento', 'forma_pagamento',
    'tipo_auditoria', 'tema_sistema', 'idioma_sistema', 'frequencia_backup'
)
ORDER BY typname;



