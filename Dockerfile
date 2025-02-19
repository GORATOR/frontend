FROM node:20.16.0-alpine3.20 as npm-install
WORKDIR /home/node/app
ENV PATH /home/node/app/node_modules/.bin:$PATH
COPY package.json package-lock.json ./
RUN npm install

FROM npm-install as prebuild
COPY --from=npm-install /home/node/app/node_modules /home/node/app/node_modules

FROM prebuild as build
ARG VITE_BACKEND_URL
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL
WORKDIR /home/node/app
COPY src/ ./src/
COPY index.html tsconfig.app.json tsconfig.json tsconfig.node.json vite.config.ts ./
RUN npm run build

FROM nginx:1.27.0-alpine3.19 as prod
COPY --from=build /home/node/app/dist /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]