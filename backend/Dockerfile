# Multi-stage build para o TeleUp Backend
# Stage 1: Build
FROM node:18 AS builder

WORKDIR /usr/src/app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar todas as dependências (incluindo devDependencies)
RUN npm ci

# Copiar código fonte
COPY . .

# Build do TypeScript
RUN npm run build

# Stage 2: Production
FROM node:18 AS production

WORKDIR /usr/src/app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar apenas dependências de produção
RUN npm ci --only=production

# Copiar arquivos compilados do stage anterior
COPY --from=builder /usr/src/app/dist ./dist

# Copiar scripts necessários
COPY --from=builder /usr/src/app/scripts ./scripts

# Expor porta
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "start"]
