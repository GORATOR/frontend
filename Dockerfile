FROM node:20.16.0-alpine3.20 AS npm-install

WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH

COPY package.json package-lock.json ./

RUN npm install


FROM npm-install AS build

WORKDIR /app

COPY --from=npm-install /app/node_modules /app/node_modules

COPY . .

RUN npm run build


FROM nginx:1.27.0-alpine3.19 AS prod

COPY --from=build /app/dist /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]
