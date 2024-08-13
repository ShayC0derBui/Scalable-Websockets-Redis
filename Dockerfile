# Base image with Node.js
FROM node:22-alpine3.19 AS base

# Build stage
FROM base AS build

WORKDIR /usr/src/app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install --no-package-lock

# Copy the rest of the application code and build it
COPY . .
RUN npm run build

# Production stage
FROM base AS production

# Copy the node_modules and built code from the build stage
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/package.json .
COPY --from=build /usr/src/app/package-lock.json .
COPY .env .env

# Command to run the application in production mode
CMD ["sh", "-c", "npm run start:prod"]
