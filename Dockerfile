# Use uma imagem oficial do Node.js
FROM node:20

# Define o diretório de trabalho dentro do container
WORKDIR /usr/src/app

# Copia os arquivos de dependências para o container
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia os arquivos do projeto
COPY . .

# Expõe a porta da aplicação
EXPOSE 3000

# Comando para rodar o serviço
CMD ["npm", "run", "start"]
