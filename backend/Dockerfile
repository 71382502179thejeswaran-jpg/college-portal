# ====================================================================
# Backend API Microservice Dockerfile
# Base Image: Node.js 20 Alpine (Lightweight, Secure, Fast)
# ====================================================================

FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install curl for healthcheck
RUN apk add --no-cache curl

# Copy dependency definitions
COPY package*.json ./

# Install production dependencies
RUN npm install --production

# Copy backend source code
COPY . .

# Set environment defaults
ENV NODE_ENV=production
ENV PORT=5000

# Expose backend REST API port
EXPOSE 5000

# Docker Healthcheck
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

# Launch backend application
CMD ["npm", "start"]
