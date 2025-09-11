# Script de Setup - Sistema de Gestão de Clínica (PowerShell)
# Este script automatiza a configuração inicial do projeto no Windows

param(
    [switch]$SkipTests,
    [switch]$SkipBuild,
    [switch]$Help
)

if ($Help) {
    Write-Host "Uso: .\setup.ps1 [opções]" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Opções:" -ForegroundColor Yellow
    Write-Host "  -SkipTests    Pula a execução dos testes" -ForegroundColor White
    Write-Host "  -SkipBuild    Pula a verificação de build" -ForegroundColor White
    Write-Host "  -Help         Mostra esta ajuda" -ForegroundColor White
    Write-Host ""
    exit 0
}

# Configurar política de execução se necessário
$ExecutionPolicy = Get-ExecutionPolicy
if ($ExecutionPolicy -eq "Restricted" -or $ExecutionPolicy -eq "AllSigned") {
    Write-Host "⚠️  Política de execução restritiva detectada. Tentando definir para RemoteSigned..." -ForegroundColor Yellow
    try {
        Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
        Write-Host "✅ Política de execução alterada para RemoteSigned" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Não foi possível alterar a política de execução. Execute como administrador." -ForegroundColor Red
        exit 1
    }
}

# Funções de log colorido
function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Verificar se o Node.js está instalado
function Test-NodeJS {
    Write-Info "Verificando Node.js..."
    
    try {
        $nodeVersion = node --version
        if ($LASTEXITCODE -ne 0) {
            throw "Node.js não está funcionando corretamente"
        }
        
        $majorVersion = [int]($nodeVersion -replace 'v', '' -split '\.')[0]
        if ($majorVersion -lt 18) {
            Write-Error "Node.js versão 18+ é necessária. Versão atual: $nodeVersion"
            exit 1
        }
        
        Write-Success "Node.js $nodeVersion encontrado"
    }
    catch {
        Write-Error "Node.js não está instalado. Por favor, instale o Node.js 18+ primeiro."
        Write-Host "Download: https://nodejs.org/" -ForegroundColor Cyan
        exit 1
    }
}

# Verificar se o npm está instalado
function Test-NPM {
    Write-Info "Verificando npm..."
    
    try {
        $npmVersion = npm --version
        if ($LASTEXITCODE -ne 0) {
            throw "npm não está funcionando corretamente"
        }
        
        Write-Success "npm $npmVersion encontrado"
    }
    catch {
        Write-Error "npm não está instalado. Por favor, instale o npm primeiro."
        exit 1
    }
}

# Verificar se o Git está instalado
function Test-Git {
    Write-Info "Verificando Git..."
    
    try {
        $gitVersion = git --version
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Git encontrado: $gitVersion"
        }
        else {
            Write-Warning "Git não está instalado. Algumas funcionalidades podem não funcionar."
        }
    }
    catch {
        Write-Warning "Git não está instalado. Algumas funcionalidades podem não funcionar."
    }
}

# Instalar dependências
function Install-Dependencies {
    Write-Info "Instalando dependências..."
    
    if (Test-Path "package-lock.json") {
        Write-Info "Usando package-lock.json para instalação..."
        npm ci
    }
    else {
        Write-Info "Instalando dependências com npm install..."
        npm install
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Dependências instaladas com sucesso"
    }
    else {
        Write-Error "Falha ao instalar dependências"
        exit 1
    }
}

# Configurar variáveis de ambiente
function Setup-Environment {
    Write-Info "Configurando variáveis de ambiente..."
    
    if (-not (Test-Path ".env.local")) {
        if (Test-Path "env.example") {
            Copy-Item "env.example" ".env.local"
            Write-Success "Arquivo .env.local criado a partir de env.example"
            Write-Warning "IMPORTANTE: Edite o arquivo .env.local com suas credenciais do Supabase"
        }
        else {
            Write-Warning "Arquivo env.example não encontrado. Crie manualmente o arquivo .env.local"
        }
    }
    else {
        Write-Info "Arquivo .env.local já existe"
    }
}

# Verificar configuração do Supabase
function Test-SupabaseConfig {
    Write-Info "Verificando configuração do Supabase..."
    
    if (Test-Path ".env.local") {
        $envContent = Get-Content ".env.local" -Raw
        if ($envContent -match "VITE_SUPABASE_URL" -and $envContent -match "VITE_SUPABASE_ANON_KEY") {
            Write-Success "Variáveis do Supabase encontradas no .env.local"
        }
        else {
            Write-Warning "Variáveis do Supabase não encontradas no .env.local"
        }
    }
    else {
        Write-Warning "Arquivo .env.local não encontrado"
    }
}

# Executar testes
function Invoke-Tests {
    if ($SkipTests) {
        Write-Warning "Testes pulados por opção -SkipTests"
        return
    }
    
    Write-Info "Executando testes..."
    
    try {
        npm test --silent | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Testes executados com sucesso"
        }
        else {
            Write-Warning "Alguns testes falharam. Verifique os logs para mais detalhes"
        }
    }
    catch {
        Write-Warning "Erro ao executar testes: $($_.Exception.Message)"
    }
}

# Verificar build
function Test-Build {
    if ($SkipBuild) {
        Write-Warning "Verificação de build pulada por opção -SkipBuild"
        return
    }
    
    Write-Info "Verificando build..."
    
    try {
        npm run build --silent | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Build executado com sucesso"
            # Limpar build de teste
            if (Test-Path "dist") {
                Remove-Item "dist" -Recurse -Force
            }
        }
        else {
            Write-Error "Build falhou. Verifique os logs para mais detalhes"
            exit 1
        }
    }
    catch {
        Write-Error "Erro ao executar build: $($_.Exception.Message)"
        exit 1
    }
}

# Configurar Git hooks (se disponível)
function Setup-GitHooks {
    if ((Get-Command git -ErrorAction SilentlyContinue) -and (Test-Path ".git")) {
        Write-Info "Configurando Git hooks..."
        
        # Criar diretório de hooks se não existir
        $hooksDir = ".git\hooks"
        if (-not (Test-Path $hooksDir)) {
            New-Item -ItemType Directory -Path $hooksDir -Force | Out-Null
        }
        
        # Hook de pre-commit para linting
        $preCommitHook = @"
#!/bin/bash
echo "🔍 Executando linting antes do commit..."
npm run lint
if [ `$? -ne 0 ]; then
    echo "❌ Linting falhou. Corrija os erros antes de fazer commit."
    exit 1
fi
echo "✅ Linting passou!"
"@
        
        $preCommitHook | Out-File -FilePath "$hooksDir\pre-commit" -Encoding UTF8
        Write-Success "Git hooks configurados"
    }
}

# Mostrar próximos passos
function Show-NextSteps {
    Write-Host ""
    Write-Host "🎉 Setup concluído com sucesso!" -ForegroundColor Green
    Write-Host "==================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📋 Próximos passos:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Configure suas credenciais do Supabase no arquivo .env.local" -ForegroundColor White
    Write-Host "2. Execute o schema SQL no seu projeto Supabase" -ForegroundColor White
    Write-Host "3. Configure as URLs de redirecionamento no Supabase Auth" -ForegroundColor White
    Write-Host "4. Inicie o projeto: npm run dev" -ForegroundColor White
    Write-Host ""
    Write-Host "📚 Documentação:" -ForegroundColor Yellow
    Write-Host "- README.md - Visão geral do projeto" -ForegroundColor White
    Write-Host "- INSTALACAO.md - Guia completo de instalação" -ForegroundColor White
    Write-Host ""
    Write-Host "🐳 Para usar Docker:" -ForegroundColor Yellow
    Write-Host "- docker-compose up app (desenvolvimento)" -ForegroundColor White
    Write-Host "- docker-compose --profile production up (produção)" -ForegroundColor White
    Write-Host ""
    Write-Host "🧪 Para executar testes:" -ForegroundColor Yellow
    Write-Host "- npm test (executar todos os testes)" -ForegroundColor White
    Write-Host "- npm run test:watch (modo watch)" -ForegroundColor White
    Write-Host "- npm run test:coverage (relatório de cobertura)" -ForegroundColor White
    Write-Host ""
    Write-Host "🚀 Para fazer deploy:" -ForegroundColor Yellow
    Write-Host "- npm run build (build de produção)" -ForegroundColor White
    Write-Host "- docker build -t sistema-clinica . (Docker)" -ForegroundColor White
    Write-Host ""
    Write-Host "💡 Dica: Use 'npm run dev' para iniciar o servidor de desenvolvimento" -ForegroundColor Cyan
    Write-Host ""
}

# Função principal
function Main {
    Write-Host "🚀 Iniciando setup do Sistema de Gestão de Clínica..." -ForegroundColor Cyan
    Write-Host "==================================================" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "Iniciando verificação do ambiente..." -ForegroundColor Yellow
    
    Test-NodeJS
    Test-NPM
    Test-Git
    
    Write-Host ""
    Write-Host "Instalando dependências e configurando projeto..." -ForegroundColor Yellow
    
    Install-Dependencies
    Setup-Environment
    Test-SupabaseConfig
    
    Write-Host ""
    Write-Host "Executando verificações de qualidade..." -ForegroundColor Yellow
    
    Invoke-Tests
    Test-Build
    Setup-GitHooks
    
    Show-NextSteps
}

# Executar função principal
try {
    Main
}
catch {
    Write-Error "Erro durante o setup: $($_.Exception.Message)"
    Write-Host "Stack trace: $($_.ScriptStackTrace)" -ForegroundColor Red
    exit 1
}
