# Dockerfile para Sistema de Gestão de Clínica
FROM node:18-alpine AS base

# Instalar dependências necessárias
RUN apk add --no-cache libc6-compat

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production && npm cache clean --force

# Estágio de build
FROM base AS builder

# Instalar todas as dependências (incluindo devDependencies)
RUN npm ci

# Copiar código fonte
COPY . .

# Build da aplicação
RUN npm run build

# Estágio de produção
FROM nginx:alpine AS production

# Copiar build da aplicação
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuração do nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Expor porta 80
EXPOSE 80

# Comando para iniciar o nginx
CMD ["nginx", "-g", "daemon off;"]

# Estágio de desenvolvimento (opcional)
FROM base AS development

# Instalar todas as dependências
RUN npm ci

# Copiar código fonte
COPY . .

# Expor porta 5173 (Vite dev server)
EXPOSE 5173

# Comando para iniciar em modo desenvolvimento
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
