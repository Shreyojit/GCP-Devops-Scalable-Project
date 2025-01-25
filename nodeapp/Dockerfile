FROM --platform=linux/amd64 node:20
WORKDIR /usr/app
COPY package.json .
RUN npm install
COPY . .
EXPOSE 8000
CMD ["npm", "start"]
