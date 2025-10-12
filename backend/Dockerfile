# Dockerfile customizado para o TeleUp Backend
FROM node:18-slim

# Definir diretório de trabalho
WORKDIR /usr/src/app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar TODAS as dependências (incluindo devDependencies)
RUN npm ci

# Copiar todo o código fonte
COPY . .

# Build do TypeScript
RUN npm run build

# Remover dependências de desenvolvimento para reduzir tamanho
RUN npm prune --production

# Expor porta
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "start"]
