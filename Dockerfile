# Define a imagem base
FROM node:14

# Define o diretório de trabalho no container
WORKDIR /usr/src/app

# Copia o arquivo de dependências para o container
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia o restante dos arquivos do projeto para o container
COPY . .

# Expõe a porta que o aplicativo usa
EXPOSE 8080

# Define o comando para iniciar o aplicativo
CMD [ "node", "index.js" ]