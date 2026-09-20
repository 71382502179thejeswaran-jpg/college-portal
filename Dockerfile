# Unified Project Dockerfile (Serves Full-Stack API + Frontend via Node)
# Use this when deploying a single combined container to cloud platforms (e.g. IBM Cloud Code Engine)
FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache curl

# Copy backend dependencies and install
COPY backend/package*.json ./backend/
RUN cd backend && npm install --production

# Copy application files
COPY backend/ ./backend/
COPY frontend/ ./frontend/

WORKDIR /app/backend

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

HEALTHCHECK --interval=20s --timeout=5s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

CMD ["npm", "start"]
