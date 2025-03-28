FROM node:20

WORKDIR /usr/src/app
COPY package.json ./
RUN npm config set registry https://npmreg.proxy.ustclug.org
RUN npm install
COPY . .

CMD [ "node", "index.js" ]

