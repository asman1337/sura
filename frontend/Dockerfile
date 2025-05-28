# Frontend Dockerfile
FROM node:22-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build stage
FROM base AS build

# Build the application
RUN pnpm run build

# Production stage - using nginx to serve static files
FROM nginx:alpine AS production

# Create cache directories with proper permissions first
RUN mkdir -p /tmp/nginx-cache/client_temp /tmp/nginx-cache/proxy_temp /tmp/nginx-cache/fastcgi_temp /tmp/nginx-cache/uwsgi_temp /tmp/nginx-cache/scgi_temp && \
    chown -R nginx:nginx /tmp/nginx-cache

# Copy custom nginx main config (without user directive)
COPY <<EOF /etc/nginx/nginx.conf
worker_processes auto;
error_log /var/log/nginx/error.log notice;
pid /tmp/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    # Use writable directories for nginx cache
    client_body_temp_path /tmp/nginx-cache/client_temp;
    proxy_temp_path /tmp/nginx-cache/proxy_temp;
    fastcgi_temp_path /tmp/nginx-cache/fastcgi_temp;
    uwsgi_temp_path /tmp/nginx-cache/uwsgi_temp;
    scgi_temp_path /tmp/nginx-cache/scgi_temp;
    
    log_format main '\$remote_addr - \$remote_user [\$time_local] "\$request" '
                    '\$status \$body_bytes_sent "\$http_referer" '
                    '"\$http_user_agent" "\$http_x_forwarded_for"';
    
    access_log /var/log/nginx/access.log main;
    
    sendfile on;
    tcp_nopush on;
    keepalive_timeout 65;
    
    include /etc/nginx/conf.d/*.conf;
}
EOF

# Copy custom nginx config
COPY <<EOF /etc/nginx/conf.d/default.conf
server {
    listen 5567;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Handle client-side routing
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
EOF

# Copy built application from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Set proper permissions for nginx user
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html && \
    chown -R nginx:nginx /tmp/nginx-cache

# Switch to nginx user (already exists in nginx:alpine image)
USER nginx

# Expose port
EXPOSE 5567

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5567/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
