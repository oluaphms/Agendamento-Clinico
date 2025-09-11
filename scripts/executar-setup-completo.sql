-- =====================================================
-- EXECUÇÃO COMPLETA DO SETUP DO SISTEMA
-- =====================================================
-- Este script executa todos os passos necessários para configurar
-- o sistema completo com usuários padrão e permissões

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 1. EXECUTAR SISTEMA DE PERMISSÕES
-- =====================================================

\echo '========================================'
\echo 'EXECUTANDO SISTEMA DE PERMISSÕES...'
\echo '========================================'

-- Executar script de permissões
\i scripts/permissoes-corrigido-final.sql

-- =====================================================
-- 2. EXECUTAR SETUP DOS USUÁRIOS PADRÃO
-- =====================================================

\echo '========================================'
\echo 'EXECUTANDO SETUP DOS USUÁRIOS PADRÃO...'
\echo '========================================'

-- Executar script de usuários padrão
\i scripts/setup-usuarios-padrao-completo.sql

-- =====================================================
-- 3. EXECUTAR VERIFICAÇÃO
-- =====================================================

\echo '========================================'
\echo 'EXECUTANDO VERIFICAÇÃO...'
\echo '========================================'

-- Executar script de verificação
\i scripts/verificar-usuarios-padrao.sql

-- =====================================================
-- 4. RELATÓRIO FINAL
-- =====================================================

\echo '========================================'
\echo 'SETUP COMPLETO FINALIZADO!'
\echo '========================================'
\echo 'Usuários padrão criados:'
\echo '  - Administrador: CPF 111.111.111.11 | Senha: 111'
\echo '  - Recepcionista: CPF 222.222.222.22 | Senha: 222'
\echo '  - Desenvolvedor: CPF 333.333.333.33 | Senha: 333'
\echo '  - Profissional: CPF 444.444.444.44 | Senha: 4444'
\echo '========================================'
\echo 'Acesso total: Administrador e Desenvolvedor'
\echo '========================================'
