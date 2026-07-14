# Deployment Guide

This guide provides instructions for deploying the Bat-Com Research Platform to various environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Setup](#database-setup)
4. [Application Deployment](#application-deployment)
5. [Custom Server Deployment](#custom-server-deployment)
6. [Docker Deployment](#docker-deployment)
7. [CI/CD Setup](#cicd-setup)
8. [Post-Deployment Verification](#post-deployment-verification)
9. [Troubleshooting](#troubleshooting)

## Prerequisites

Before deployment, ensure you have:

- Node.js 18+ installed
- npm 8+ installed
- PostgreSQL 14+ database access
- Git for version control
- Access to the deployment environment

## Environment Setup

### Environment Variables

Create a `.env` file with the following variables:

```
# Database
POSTGRES_URL=postgresql://username:password@localhost:5432/database_name
POSTGRES_CA_CERT=<optional base64-encoded CA cert>

# Server
PORT=5120
NODE_ENV=production

# Security
JWT_SECRET="your-secure-session-secret"
JWT_EXPIRES_IN="7d"
ADMIN_PASSWORD="temporary-admin-password"
```

For production environments, use environment-specific configuration systems:

- **Custom Server**: Use environment variables or a secure .env file
- **Docker**: Pass environment variables through Docker Compose or Kubernetes

## Database Setup

### PostgreSQL Setup

1. Create a PostgreSQL database:

   ```sql
   CREATE DATABASE batcom;
   CREATE USER batcom_user WITH ENCRYPTED PASSWORD 'secure_password';
   GRANT ALL PRIVILEGES ON DATABASE batcom TO batcom_user;
   ```

2. Set up the connection string in your environment:
   ```
   POSTGRES_URL=postgresql://batcom_user:secure_password@localhost:5432/batcom
   POSTGRES_CA_CERT=<optional base64-encoded CA cert>
   ```

### Database Migration

Run the following command to set up the database schema:

```bash
npm run db:push
```

This will:

1. Create all necessary tables
2. Set up relationships
3. Apply any pending migrations

## Application Deployment

### Building for Production

1. Install dependencies:

   ```bash
   npm install
   ```

2. Build the frontend assets:

   ```bash
   npm run build
   ```

3. Start the server:
   ```bash
   npm start
   ```

## Custom Server Deployment

### Node.js Server

1. Clone the repository:

   ```bash
   git clone https://gitlab.coko.foundation/kotahi/batcom.git
   cd batcom
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file with environment variables

4. Build the application:

   ```bash
   npm run build
   ```

5. Start the server:
   ```bash
   npm start
   ```

### PM2 Process Manager (Recommended)

For production environments, use PM2 to manage the Node.js process:

1. Install PM2:

   ```bash
   npm install -g pm2
   ```

2. Start the application with PM2:

   ```bash
   pm2 start npm --name "batcom" -- start
   ```

3. Set up PM2 to start on system boot:
   ```bash
   pm2 startup
   pm2 save
   ```

### Nginx Reverse Proxy

Configure Nginx as a reverse proxy:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5120;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Set up SSL with Let's Encrypt:

```bash
sudo certbot --nginx -d your-domain.com
```

## Docker Deployment

### Docker Compose Setup

1. Create a `docker-compose.yml` file:

```yaml
version: '3'
services:
  app:
    build: .
    ports:
      - '5120:5120'
    environment:
      - POSTGRES_URL=postgresql://batcom_user:secure_password@db:5432/batcom
	  - POSTGRES_CA_CERT=<optional base64-encoded CA cert>
      - NODE_ENV=production
      - PORT=5120
      - JWT_SECRET="your-secure-session-secret"
      - JWT_EXPIRES_IN="7d"
      - ADMIN_PASSWORD="temporary-admin-password"
    depends_on:
      - db
    restart: always

  db:
    image: postgres:14
    ports:
      - '5432:5432'
    environment:
      - POSTGRES_USER=batcom_user
      - POSTGRES_PASSWORD=secure_password
      - POSTGRES_DB=batcom
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: always

volumes:
  postgres_data:
```

2. Start the services:

   ```bash
   docker-compose up -d
   ```

3. Run database migrations:
   ```bash
   docker-compose exec app npm run db:push
   ```

### Kubernetes Deployment

For deploying to Kubernetes, create the following manifests:

1. `deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: batcom
spec:
  replicas: 2
  selector:
    matchLabels:
      app: batcom
  template:
    metadata:
      labels:
        app: batcom
    spec:
      containers:
        - name: batcom
          image: your-registry/batcom:latest
          ports:
            - containerPort: 5120
          env:
            - name: POSTGRES_URL
              valueFrom:
                secretKeyRef:
                  name: batcom-secrets
                  key: database-url
            - name: NODE_ENV
              value: 'production'
            - name: PORT
              value: '5120'
            - name: SESSION_SECRET
              valueFrom:
                secretKeyRef:
                  name: batcom-secrets
                  key: session-secret
```

2. `service.yaml`:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: batcom
spec:
  selector:
    app: batcom
  ports:
    - port: 80
      targetPort: 5120
  type: ClusterIP
```

3. `ingress.yaml`:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: batcom
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  rules:
    - host: your-domain.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: batcom
                port:
                  number: 80
  tls:
    - hosts:
        - your-domain.com
      secretName: batcom-tls
```

4. Apply the manifests:

```bash
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
kubectl apply -f ingress.yaml
```

## CI/CD Setup

### GitHub Actions

Create a `.github/workflows/deploy.yml` file:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build

      - name: Run database migrations
        run: npm run db:push
        env:
          POSTGRES_URL: ${{ secrets.POSTGRES_URL }}

      - name: Deploy to production
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SSH_HOST }}
          username: ${{ secrets.SSH_USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /path/to/deployment
            git pull
            npm ci
            npm run build
            pm2 restart batcom
```

## Post-Deployment Verification

After deployment, verify that:

1. The application is accessible via the configured domain
2. All pages load correctly
3. Database operations work as expected
4. User authentication functions properly
5. File uploads and processing work correctly
6. Analytics tracking is operational

Run the following checks:

```bash
# Check server status
curl -I https://your-domain.com

# Verify API endpoints
curl https://your-domain.com/api/virus-categories

# Check database connection
npm run db:verify
```

## Troubleshooting

### Common Issues

#### Database Connection Issues

If you encounter database connection issues:

1. Verify the `POSTGRES_URL` environment variable is correct
2. Check that PostgreSQL is running and accessible
3. Ensure the database exists and permissions are set correctly
4. Check network connectivity between the application and database servers

#### Application Not Starting

If the application fails to start:

1. Check the logs for error messages:

   ```bash
   npm run logs
   # or if using PM2
   pm2 logs batcom
   ```

2. Verify environment variables are set correctly

3. Check for port conflicts:
   ```bash
   netstat -tuln | grep 5120
   ```

#### Static Assets Not Loading

If static assets fail to load:

1. Check that the build process completed successfully
2. Verify the asset paths in the HTML
3. Check for CORS or CSP issues in the browser console

#### File Upload Issues

If file uploads don't work:

1. Verify the upload directory exists and has proper permissions
2. Check maximum file size settings
3. Verify the Multer configuration in the server code
