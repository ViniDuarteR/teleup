# Dockerfile customizado para o TeleUp Backend
FROM node:18-slim

# Definir diretório de trabalho
WORKDIR /usr/src/app

# Copiar package.json e package-lock.json primeiro
COPY package*.json ./

# Instalar TODAS as dependências (incluindo devDependencies) - FORÇA INSTALAÇÃO COMPLETA
RUN npm install

# Copiar todo o código fonte
COPY . .

# Build do TypeScript
RUN npm run build

# Remover dependências de desenvolvimento para reduzir tamanho da imagem final
RUN npm prune --production

# Expor porta
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "start"]
