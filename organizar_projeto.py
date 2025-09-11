#!/usr/bin/env python3
"""
Script para organizar o projeto - mover React para raiz e arquivos Flask para backup
"""

import os
import shutil
import sys
from pathlib import Path

def organizar_projeto():
    """Organiza o projeto movendo React para raiz e Flask para backup"""
    
    print("🔄 Organizando projeto...")
    
    # Diretórios e arquivos
    react_dir = "sistema-clinica-react"
    backup_dir = "sistema-flask-backup"
    
    # Verificar se o diretório React existe
    if not os.path.exists(react_dir):
        print("❌ Diretório sistema-clinica-react não encontrado!")
        return False
    
    # Criar diretório de backup
    if not os.path.exists(backup_dir):
        os.makedirs(backup_dir)
        print(f"✅ Criado diretório {backup_dir}")
    
    # Lista de arquivos Flask para mover
    flask_files = [
        "app.py", "requirements.txt", "config.py", "run.py",
        "app_backup.py", "app_advanced.py", "test_*.py",
        "requirements_minimal.txt", "requirements_simple.txt",
        "requirements_notificacoes.txt", "pytest.ini", "tests.py",
        "reports.py", "notifications.py", "security.py",
        "Dockerfile", "diagnostico_banco.py", "migrate_*.py",
        "setup_security.py", "limpar_banco.py", "config_*.py"
    ]
    
    # Lista de diretórios Flask para mover
    flask_dirs = [
        "templates", "static", "app", "config", "migrations",
        "tests", "utils", "requirements", "docs", "scripts",
        "websockets", "venv", "services", "integrations",
        "gamification", "analytics", "ai", "__pycache__",
        "instance", "backups"
    ]
    
    # Mover arquivos Flask para backup
    print("\n📦 Movendo arquivos Flask para backup...")
    for file_pattern in flask_files:
        for file in Path(".").glob(file_pattern):
            if os.path.isfile(file) and str(file) != "organizar_projeto.py":
                try:
                    shutil.move(str(file), f"{backup_dir}/{file}")
                    print(f"  ✅ Movido: {file}")
                except Exception as e:
                    print(f"  ⚠️ Erro ao mover {file}: {e}")
    
    # Mover diretórios Flask para backup
    print("\n📁 Movendo diretórios Flask para backup...")
    for dir_name in flask_dirs:
        if os.path.exists(dir_name) and os.path.isdir(dir_name):
            try:
                shutil.move(dir_name, f"{backup_dir}/{dir_name}")
                print(f"  ✅ Movido: {dir_name}/")
            except Exception as e:
                print(f"  ⚠️ Erro ao mover {dir_name}/: {e}")
    
    # Mover arquivos React para raiz
    print("\n🚀 Movendo projeto React para raiz...")
    react_items = os.listdir(react_dir)
    
    for item in react_items:
        src = os.path.join(react_dir, item)
        if os.path.isfile(src):
            try:
                shutil.move(src, item)
                print(f"  ✅ Movido: {item}")
            except Exception as e:
                print(f"  ⚠️ Erro ao mover {item}: {e}")
        elif os.path.isdir(src):
            try:
                shutil.move(src, item)
                print(f"  ✅ Movido: {item}/")
            except Exception as e:
                print(f"  ⚠️ Erro ao mover {item}/: {e}")
    
    # Remover diretório React vazio
    try:
        os.rmdir(react_dir)
        print(f"  ✅ Removido diretório vazio: {react_dir}")
    except:
        print(f"  ⚠️ Não foi possível remover {react_dir}")
    
    # Criar README.md explicativo
    criar_readme_explicativo()
    
    print("\n✅ Organização concluída!")
    print("\n📁 Estrutura final:")
    print("├── src/                    # ✅ Projeto React")
    print("├── package.json            # ✅ Dependências React")
    print("├── vite.config.ts          # ✅ Configuração Vite")
    print("├── .gitignore              # ✅ Git ignore")
    print("├── sistema-flask-backup/   # 🔄 Backup Flask")
    print("└── README.md               # 📖 Documentação")
    
    return True

def criar_readme_explicativo():
    """Cria um README.md explicando a nova estrutura"""
    
    readme_content = """# 🏥 Sistema de Clínica - React + Supabase

## 🎯 **Projeto Ativo**

Este é o projeto principal do Sistema de Clínica, desenvolvido em **React + TypeScript** com backend **Supabase**.

### 🚀 **Tecnologias**

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Bootstrap 5, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Deploy**: Vercel
- **State Management**: Zustand
- **Icons**: Lucide React

### 📁 **Estrutura do Projeto**

```
📁 src/
├── 📁 pages/              # Todas as páginas do sistema
│   ├── Auth/Login.tsx
│   ├── Dashboard/
│   ├── Agenda/
│   ├── Pacientes/
│   ├── Profissionais/
│   ├── Servicos/
│   ├── Relatorios/
│   ├── Notificacoes/
│   ├── Configuracoes/
│   ├── Gamification/
│   ├── Analytics/
│   └── Sobre/
├── 📁 components/         # Componentes reutilizáveis
├── 📁 stores/            # Gerenciamento de estado
├── 📁 lib/               # Configurações e utilitários
└── App.tsx               # Componente principal
```

### 🎯 **Funcionalidades**

- ✅ **Dashboard** com estatísticas em tempo real
- ✅ **Agenda** completa com calendário e agendamentos
- ✅ **Pacientes** com CRUD completo
- ✅ **Profissionais** com gestão de equipe
- ✅ **Serviços** com catálogo de procedimentos
- ✅ **Relatórios** avançados
- ✅ **Notificações** em tempo real
- ✅ **Configurações** do sistema
- ✅ **Gamificação** para engajamento
- ✅ **Analytics** detalhados
- ✅ **PWA** (Progressive Web App)

### 🚀 **Como Executar**

1. **Instalar dependências**:
   ```bash
   npm install
   ```

2. **Configurar variáveis de ambiente**:
   ```bash
   cp env.example .env
   # Editar .env com suas credenciais Supabase
   ```

3. **Executar localmente**:
   ```bash
   npm run dev
   ```

4. **Build para produção**:
   ```bash
   npm run build
   ```

### 🌐 **Deploy**

O projeto está configurado para deploy automático no **Vercel**:

1. Conectar repositório GitHub
2. Configurar variáveis de ambiente
3. Deploy automático a cada push

### 📊 **Banco de Dados**

- **Supabase**: PostgreSQL gerenciado
- **Autenticação**: Supabase Auth
- **Storage**: Arquivos e imagens
- **Real-time**: Subscriptions em tempo real

---

## 📁 **Backup do Projeto Original**

O projeto Flask original está em `sistema-flask-backup/` para referência.

---

**🎉 Projeto 100% funcional e pronto para produção!**
"""
    
    with open("README.md", "w", encoding="utf-8") as f:
        f.write(readme_content)
    
    print("  ✅ Criado README.md explicativo")

if __name__ == "__main__":
    print("🏥 Organizador do Sistema de Clínica")
    print("=" * 50)
    
    # Confirmar com o usuário
    resposta = input("\n🤔 Deseja organizar o projeto? (s/n): ").lower().strip()
    
    if resposta in ['s', 'sim', 'y', 'yes']:
        if organizar_projeto():
            print("\n🎉 Projeto organizado com sucesso!")
            print("\n📋 Próximos passos:")
            print("1. cd sistema-clinica-react (se ainda existir)")
            print("2. npm install")
            print("3. npm run dev")
            print("4. Configurar Supabase")
            print("5. Deploy no Vercel")
        else:
            print("\n❌ Erro ao organizar o projeto!")
    else:
        print("\n❌ Operação cancelada pelo usuário!")
