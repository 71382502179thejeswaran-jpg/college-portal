# ====================================================================
# Frontend Web Service Dockerfile
# Base Image: Nginx Alpine (Ultra-fast static server & reverse proxy)
# ====================================================================

FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy frontend source files (HTML, CSS, JS, Assets)
COPY . /usr/share/nginx/html/

# Copy custom nginx configuration with reverse proxy for /api/
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port 80
EXPOSE 80

# Health check to ensure Nginx is responding
HEALTHCHECK --interval=20s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Start Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
