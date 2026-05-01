# Multi-stage build for production deployment
# BUILD_ENV controls which .env file is used during the React build.
# Supported values: production (default), uat
ARG BUILD_ENV=production
FROM node:18-alpine as build

ARG BUILD_ENV=production

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev dependencies for build)
RUN npm install --prefer-offline --no-audit

# Copy source code
COPY . .

# Copy the appropriate environment file so Create React App picks it up.
# .env.production is the CRA default for `npm run build`; for other envs we
# place the file as .env.production so the same build command is used.
RUN if [ "$BUILD_ENV" != "production" ]; then \
      cp .env.${BUILD_ENV} .env.production ; \
    fi

# Build the application (CI=false to not treat warnings as errors)
ENV CI=false
RUN npm run build

# Production stage - Use nginx to serve
FROM nginx:alpine

# Copy built app from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx configuration (configured for port 8080)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 8080 for Cloud Run
EXPOSE 8080

# Run nginx in foreground mode (required for Cloud Run)
CMD ["nginx", "-g", "daemon off;"]