FROM node:20-alpine AS build
WORKDIR /app

ARG BUILD_DATE
ENV BUILD_DATE=$BUILD_DATE

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build:prod

FROM nginx:stable-alpine
WORKDIR /usr/share/nginx/html

RUN rm -rf ./*

COPY --from=build /app/dist .

RUN sed -i "s/import.meta.env.BUILD_DATE/$BUILD_DATE/g" version.json

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"] 
