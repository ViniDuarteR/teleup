# Dockerfile para build multi-stage
FROM node:18-slim as builder

WORKDIR /usr/src/app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar todas as dependências (incluindo devDependencies para o build)
RUN npm ci

# Copiar código fonte
COPY src/ ./src/
COPY tsconfig.json ./

# Build do TypeScript
RUN npm run build

# Estágio de produção
FROM node:18-slim

WORKDIR /usr/src/app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar apenas dependências de produção
RUN npm ci --only=production

# Copiar arquivos compilados e scripts do estágio anterior
COPY --from=builder /usr/src/app/dist/ ./dist/
COPY scripts/ ./scripts/

# Expor porta
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "start"]
