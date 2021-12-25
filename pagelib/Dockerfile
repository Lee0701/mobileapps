FROM node:12
WORKDIR /srv/service

COPY package*.json ./
RUN npm install

COPY . .

CMD ["npm", "start"]
