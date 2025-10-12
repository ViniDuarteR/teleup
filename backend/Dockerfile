# Dockerfile simplificado para o TeleUp Backend
FROM node:18

WORKDIR /usr/src/app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar todas as dependências (incluindo devDependencies)
RUN npm install

# Verificar se TypeScript foi instalado
RUN ls -la node_modules/.bin/ | grep tsc

# Copiar código fonte
COPY . .

# Verificar se o arquivo tsconfig.json existe
RUN ls -la tsconfig.json

# Build do TypeScript com debug
RUN echo "Iniciando build..." && npm run build && echo "Build concluído!"

# Expor porta
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "start"]
