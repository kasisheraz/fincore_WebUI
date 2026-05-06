# Multi-stage build for production deployment
FROM node:18-alpine as build

# Accept build argument for environment (default: uat)
ARG BUILD_ENV=uat

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev dependencies for build)
RUN npm install --prefer-offline --no-audit

# Copy source code
COPY . .

# Copy the appropriate .env file based on BUILD_ENV argument
RUN if [ -f ".env.${BUILD_ENV}" ]; then \
      cp ".env.${BUILD_ENV}" .env.production; \
      echo "Using .env.${BUILD_ENV} for build"; \
    else \
      echo "Warning: .env.${BUILD_ENV} not found, using existing .env.production"; \
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