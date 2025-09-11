#!/usr/bin/env python3
"""
SCRIPT DE VERIFICAÇÃO DE TABELAS DO SUPABASE
============================================

Este script verifica quais tabelas existem no Supabase
e quais ainda precisam ser criadas para o sistema clínico.

Como usar:
1. Configure as variáveis de ambiente do Supabase
2. Execute: python verificar-tabelas-supabase.py

Requisitos:
pip install supabase python-dotenv
"""

import os
import sys
from typing import List, Dict, Any
from dotenv import load_dotenv

try:
    from supabase import create_client, Client
except ImportError:
    print("❌ ERRO: Biblioteca 'supabase' não instalada!")
    print("Execute: pip install supabase python-dotenv")
    sys.exit(1)

# Carregar variáveis de ambiente
load_dotenv()

# Configuração do Supabase
SUPABASE_URL = os.getenv('VITE_SUPABASE_URL') or os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('VITE_SUPABASE_ANON_KEY') or os.getenv('SUPABASE_ANON_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ ERRO: Variáveis de ambiente do Supabase não configuradas!")
    print("Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env")
    sys.exit(1)

# Inicializar cliente Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Tabelas esperadas no sistema clínico
TABELAS_ESPERADAS = [
    'usuarios',
    'pacientes',
    'profissionais',
    'servicos',
    'agendamentos',
    'pagamentos',
    'configuracoes',
    'audit_log',
    'notificacoes',
    'backups'
]

def verificar_tabela_existe(nome_tabela: str) -> bool:
    """Verifica se uma tabela existe no Supabase."""
    try:
        # Tentar fazer uma consulta simples para verificar se a tabela existe
        response = supabase.table(nome_tabela).select('*').limit(1).execute()
        return True
    except Exception as e:
        # Se o erro for sobre tabela não existir, retorna False
        if 'relation' in str(e) and 'does not exist' in str(e):
            return False
        # Outros erros podem indicar que a tabela existe mas tem problemas
        print(f"⚠️  Aviso ao verificar tabela {nome_tabela}: {e}")
        return True  # Assumir que existe se houver outro tipo de erro

def contar_registros(nome_tabela: str) -> int:
    """Conta o número de registros em uma tabela."""
    try:
        response = supabase.table(nome_tabela).select('*', count='exact').execute()
        return response.count or 0
    except Exception:
        return 0

def verificar_conexao() -> bool:
    """Verifica se a conexão com Supabase está funcionando."""
    try:
        print("🔌 Testando conexão com Supabase...")
        # Tentar fazer uma consulta simples
        response = supabase.table('usuarios').select('count').limit(1).execute()
        print("✅ Conexão com Supabase estabelecida!")
        return True
    except Exception as e:
        if 'relation' in str(e) and 'does not exist' in str(e):
            print("✅ Conexão com Supabase estabelecida! (tabela usuarios não existe ainda)")
            return True
        print(f"❌ Erro ao conectar com Supabase: {e}")
        return False

def verificar_tabelas() -> List[Dict[str, Any]]:
    """Verifica o status de todas as tabelas esperadas."""
    print("🔍 VERIFICANDO TABELAS DO SISTEMA CLÍNICO NO SUPABASE")
    print("=" * 60)
    print()

    resultados = []
    tabelas_existentes = 0

    # Verificar cada tabela esperada
    for tabela in TABELAS_ESPERADAS:
        existe = verificar_tabela_existe(tabela)
        registros = contar_registros(tabela) if existe else 0
        
        resultados.append({
            'tabela': tabela,
            'existe': existe,
            'registros': registros
        })

        if existe:
            tabelas_existentes += 1

        # Mostrar status da tabela
        status = '✅ EXISTE' if existe else '❌ FALTA'
        info_registros = f' ({registros} registros)' if existe else ''
        print(f"{status} {tabela}{info_registros}")

    print()
    print("=" * 60)
    print("📊 RESUMO GERAL")
    print("=" * 60)
    print(f"Tabelas criadas: {tabelas_existentes}/{len(TABELAS_ESPERADAS)}")
    print(f"Percentual completo: {round((tabelas_existentes / len(TABELAS_ESPERADAS)) * 100)}%")
    print()

    # Mostrar tabelas faltantes
    tabelas_faltantes = [r for r in resultados if not r['existe']]
    if tabelas_faltantes:
        print("❌ TABELAS QUE PRECISAM SER CRIADAS:")
        for tabela in tabelas_faltantes:
            print(f"   - {tabela['tabela']}")
        print()
        print("💡 Para criar as tabelas faltantes, execute:")
        print("   scripts/00-setup-completo-sistema-corrigido.sql")
        print()
    else:
        print("🎉 TODAS AS TABELAS PRINCIPAIS JÁ EXISTEM!")
        print()

    # Mostrar tabelas com dados
    tabelas_com_dados = [r for r in resultados if r['existe'] and r['registros'] > 0]
    if tabelas_com_dados:
        print("📋 TABELAS COM DADOS:")
        for tabela in tabelas_com_dados:
            print(f"   - {tabela['tabela']}: {tabela['registros']} registros")
        print()

    # Mostrar tabelas vazias
    tabelas_vazias = [r for r in resultados if r['existe'] and r['registros'] == 0]
    if tabelas_vazias:
        print("📭 TABELAS VAZIAS (sem dados):")
        for tabela in tabelas_vazias:
            print(f"   - {tabela['tabela']}")
        print()

    return resultados

def main():
    """Função principal."""
    print("🚀 INICIANDO VERIFICAÇÃO DE TABELAS")
    print()

    if not verificar_conexao():
        sys.exit(1)

    print()
    verificar_tabelas()
    
    print("✨ Verificação concluída!")

if __name__ == "__main__":
    main()
