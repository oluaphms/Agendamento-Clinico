#!/usr/bin/env python3
"""
Script para listar tabelas existentes no Supabase
Execute: python scripts/listar_tabelas_supabase.py
"""

import os
import sys
from supabase import create_client, Client
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv('.env.local')

# Configuração do Supabase
SUPABASE_URL = os.getenv('VITE_SUPABASE_URL')
SUPABASE_KEY = os.getenv('VITE_SUPABASE_ANON_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Erro: Variáveis de ambiente do Supabase não configuradas")
    print("Configure as variáveis no arquivo .env.local:")
    print("VITE_SUPABASE_URL=https://seu-projeto.supabase.co")
    print("VITE_SUPABASE_ANON_KEY=sua_chave_anonima_aqui")
    sys.exit(1)

# Lista de tabelas esperadas do sistema clínico
TABELAS_ESPERADAS = [
    'usuarios',
    'pacientes', 
    'profissionais',
    'servicos',
    'agendamentos',
    'pagamentos',
    'configuracoes',
    'notificacoes',
    'audit_log',
    'backups',
    'permissions',
    'roles',
    'role_permissions',
    'user_roles'
]

def listar_tabelas():
    try:
        print("🔍 Verificando tabelas no Supabase...\n")
        print(f"📊 URL: {SUPABASE_URL}")
        print(f"🔑 Key: {SUPABASE_KEY[:20]}...")
        print()

        # Criar cliente Supabase
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

        # Testar conexão
        print("🔗 Testando conexão...")
        try:
            response = supabase.table('usuarios').select('id').limit(1).execute()
            print("✅ Conexão estabelecida com sucesso!\n")
        except Exception as e:
            print(f"❌ Erro de conexão: {e}")
            return

        # Verificar cada tabela
        print("📋 VERIFICAÇÃO DE TABELAS:")
        print("=" * 50)

        resultados = []

        for tabela in TABELAS_ESPERADAS:
            try:
                response = supabase.table(tabela).select('*', count='exact').limit(1).execute()
                registros = response.count if hasattr(response, 'count') else 0
                resultados.append({
                    'tabela': tabela,
                    'existe': True,
                    'registros': registros,
                    'erro': None
                })
            except Exception as e:
                resultados.append({
                    'tabela': tabela,
                    'existe': False,
                    'registros': 0,
                    'erro': str(e)
                })

        # Exibir resultados
        for resultado in resultados:
            status = "✅" if resultado['existe'] else "❌"
            registros_str = f"{resultado['registros']} registros" if resultado['existe'] else "N/A"
            erro_str = f" ({resultado['erro']})" if resultado['erro'] else ""
            
            print(f"{status} {resultado['tabela']:<20} | {registros_str}{erro_str}")

        # Resumo
        existentes = len([r for r in resultados if r['existe']])
        total_registros = sum(r['registros'] for r in resultados if r['existe'])

        print("\n📊 RESUMO:")
        print("=" * 50)
        print(f"Total de tabelas esperadas: {len(TABELAS_ESPERADAS)}")
        print(f"Tabelas existentes: {existentes}")
        print(f"Tabelas faltando: {len(TABELAS_ESPERADAS) - existentes}")
        print(f"Total de registros: {total_registros}")

        # Verificar dados iniciais
        print("\n🌱 DADOS INICIAIS:")
        print("=" * 50)

        # Verificar usuários iniciais
        try:
            response = supabase.table('usuarios').select('nome, cpf, nivel_acesso').in_('cpf', ['11111111111', '22222222222', '33333333333']).execute()
            usuarios = response.data if hasattr(response, 'data') else []
            print(f"✅ Usuários iniciais: {len(usuarios)}/3")
            for usuario in usuarios:
                print(f"   - {usuario['nome']} ({usuario['cpf']}) - {usuario['nivel_acesso']}")
        except Exception as e:
            print(f"❌ Erro ao verificar usuários: {e}")

        # Verificar serviços iniciais
        try:
            response = supabase.table('servicos').select('nome, preco').in_('nome', ['Consulta Médica', 'Exame de Sangue', 'Ultrassom', 'Eletrocardiograma', 'Consulta de Retorno']).execute()
            servicos = response.data if hasattr(response, 'data') else []
            print(f"✅ Serviços iniciais: {len(servicos)}/5")
            for servico in servicos:
                print(f"   - {servico['nome']} - R$ {servico['preco']}")
        except Exception as e:
            print(f"❌ Erro ao verificar serviços: {e}")

        # Verificar configurações iniciais
        try:
            response = supabase.table('configuracoes').select('chave, categoria').in_('chave', ['sistema', 'notificacoes', 'seguranca', 'interface', 'backup']).execute()
            configs = response.data if hasattr(response, 'data') else []
            print(f"✅ Configurações iniciais: {len(configs)}/5")
            for config in configs:
                print(f"   - {config['chave']} ({config['categoria']})")
        except Exception as e:
            print(f"❌ Erro ao verificar configurações: {e}")

        print("\n🎉 Verificação concluída!")

    except Exception as error:
        print(f"❌ Erro geral: {error}")

if __name__ == "__main__":
    listar_tabelas()
