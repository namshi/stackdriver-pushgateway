FROM library/node:9-alpine

ENV GOOGLE_APPLICATION_CREDENTIALS /credentials/credentials.json
WORKDIR /src
COPY package.json package-lock.json /src/
RUN npm i --production
COPY . /src

CMD ["node", "index.js"]