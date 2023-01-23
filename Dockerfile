FROM node:16.14.0-alpine as base
# Alpine images missing dependencies
RUN apk add --no-cache git
WORKDIR /usr/app
# Default environment (build + run time)
ARG NODE_ENV=mainnet
ENV NODE_ENV=$NODE_ENV

# App and dev dependencies
COPY ["package.json", "./"]
RUN npm install
# App source
COPY . .

# Build step for production
FROM base
RUN npm run build
# Prune dev dependencies, modules ts files, yarn cache after build
RUN npm install
CMD ["node", "dist/index.js"]