FROM node:22-alpine

# Installer les dépendances nécessaires pour argon2
RUN apk add --no-cache make gcc g++ python3

# Créez un répertoire de travail dans le conteneur
WORKDIR /app

# Copiez le package.json et le package-lock.json dans le conteneur
COPY package*.json ./

# Installez les dépendances
RUN npm install --verbose

# Copiez le reste des fichiers de l'application dans le conteneur
COPY . .

# Exposez le port sur lequel le service écoutera
EXPOSE 3000

CMD ["npm", "run", "start:dev"]