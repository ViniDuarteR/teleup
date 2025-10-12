# Dockerfile customizado para o TeleUp Backend
FROM node:18-slim

# Definir diretório de trabalho
WORKDIR /usr/src/app

# Copiar package.json e package-lock.json primeiro
COPY package*.json ./

# Instalar TypeScript globalmente para garantir disponibilidade
RUN npm install -g typescript

# Instalar TODAS as dependências (incluindo devDependencies) - FORÇA INSTALAÇÃO COMPLETA
RUN npm install

# Verificar se TypeScript está disponível
RUN which tsc && tsc --version

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
