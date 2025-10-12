# Dockerfile para executar arquivos JavaScript pré-compilados
FROM node:18

WORKDIR /usr/src/app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar apenas dependências de produção
RUN npm ci --only=production

# Copiar arquivos compilados e scripts
COPY dist/ ./dist/
COPY scripts/ ./scripts/

# Expor porta
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "start"]
