#!/bin/bash

# Script de Setup - Sistema de Gestão de Clínica
# Este script automatiza a configuração inicial do projeto

set -e  # Para o script se houver erro

echo "🚀 Iniciando setup do Sistema de Gestão de Clínica..."
echo "=================================================="

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log colorido
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se o Node.js está instalado
check_node() {
    log_info "Verificando Node.js..."
    if ! command -v node &> /dev/null; then
        log_error "Node.js não está instalado. Por favor, instale o Node.js 18+ primeiro."
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        log_error "Node.js versão 18+ é necessária. Versão atual: $(node --version)"
        exit 1
    fi
    
    log_success "Node.js $(node --version) encontrado"
}

# Verificar se o npm está instalado
check_npm() {
    log_info "Verificando npm..."
    if ! command -v npm &> /dev/null; then
        log_error "npm não está instalado. Por favor, instale o npm primeiro."
        exit 1
    fi
    
    log_success "npm $(npm --version) encontrado"
}

# Verificar se o Git está instalado
check_git() {
    log_info "Verificando Git..."
    if ! command -v git &> /dev/null; then
        log_warning "Git não está instalado. Algumas funcionalidades podem não funcionar."
    else
        log_success "Git $(git --version | cut -d' ' -f3) encontrado"
    fi
}

# Instalar dependências
install_dependencies() {
    log_info "Instalando dependências..."
    
    if [ -f "package-lock.json" ]; then
        log_info "Usando package-lock.json para instalação..."
        npm ci
    else
        log_info "Instalando dependências com npm install..."
        npm install
    fi
    
    log_success "Dependências instaladas com sucesso"
}

# Configurar variáveis de ambiente
setup_env() {
    log_info "Configurando variáveis de ambiente..."
    
    if [ ! -f ".env.local" ]; then
        if [ -f "env.example" ]; then
            cp env.example .env.local
            log_success "Arquivo .env.local criado a partir de env.example"
            log_warning "IMPORTANTE: Edite o arquivo .env.local com suas credenciais do Supabase"
        else
            log_warning "Arquivo env.example não encontrado. Crie manualmente o arquivo .env.local"
        fi
    else
        log_info "Arquivo .env.local já existe"
    fi
}

# Verificar configuração do Supabase
check_supabase_config() {
    log_info "Verificando configuração do Supabase..."
    
    if [ -f ".env.local" ]; then
        if grep -q "VITE_SUPABASE_URL" .env.local && grep -q "VITE_SUPABASE_ANON_KEY" .env.local; then
            log_success "Variáveis do Supabase encontradas no .env.local"
        else
            log_warning "Variáveis do Supabase não encontradas no .env.local"
        fi
    else
        log_warning "Arquivo .env.local não encontrado"
    fi
}

# Executar testes
run_tests() {
    log_info "Executando testes..."
    
    if npm run test --silent &> /dev/null; then
        log_success "Testes executados com sucesso"
    else
        log_warning "Alguns testes falharam. Verifique os logs para mais detalhes"
    fi
}

# Verificar build
check_build() {
    log_info "Verificando build..."
    
    if npm run build --silent &> /dev/null; then
        log_success "Build executado com sucesso"
        # Limpar build de teste
        rm -rf dist
    else
        log_error "Build falhou. Verifique os logs para mais detalhes"
        exit 1
    fi
}

# Configurar Git hooks (se disponível)
setup_git_hooks() {
    if command -v git &> /dev/null && [ -d ".git" ]; then
        log_info "Configurando Git hooks..."
        
        # Criar diretório de hooks se não existir
        mkdir -p .git/hooks
        
        # Hook de pre-commit para linting
        cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
echo "🔍 Executando linting antes do commit..."
npm run lint
if [ $? -ne 0 ]; then
    echo "❌ Linting falhou. Corrija os erros antes de fazer commit."
    exit 1
fi
echo "✅ Linting passou!"
EOF
        
        chmod +x .git/hooks/pre-commit
        log_success "Git hooks configurados"
    fi
}

# Mostrar próximos passos
show_next_steps() {
    echo ""
    echo "🎉 Setup concluído com sucesso!"
    echo "=================================================="
    echo ""
    echo "📋 Próximos passos:"
    echo ""
    echo "1. Configure suas credenciais do Supabase no arquivo .env.local"
    echo "2. Execute o schema SQL no seu projeto Supabase"
    echo "3. Configure as URLs de redirecionamento no Supabase Auth"
    echo "4. Inicie o projeto: npm run dev"
    echo ""
    echo "📚 Documentação:"
    echo "- README.md - Visão geral do projeto"
    echo "- INSTALACAO.md - Guia completo de instalação"
    echo ""
    echo "🐳 Para usar Docker:"
    echo "- docker-compose up app (desenvolvimento)"
    echo "- docker-compose --profile production up (produção)"
    echo ""
    echo "🧪 Para executar testes:"
    echo "- npm test (executar todos os testes)"
    echo "- npm run test:watch (modo watch)"
    echo "- npm run test:coverage (relatório de cobertura)"
    echo ""
    echo "🚀 Para fazer deploy:"
    echo "- npm run build (build de produção)"
    echo "- docker build -t sistema-clinica . (Docker)"
    echo ""
    echo "💡 Dica: Use 'npm run dev' para iniciar o servidor de desenvolvimento"
    echo ""
}

# Função principal
main() {
    echo "Iniciando verificação do ambiente..."
    
    check_node
    check_npm
    check_git
    
    echo ""
    echo "Instalando dependências e configurando projeto..."
    
    install_dependencies
    setup_env
    check_supabase_config
    
    echo ""
    echo "Executando verificações de qualidade..."
    
    run_tests
    check_build
    setup_git_hooks
    
    show_next_steps
}

# Executar função principal
main "$@"
