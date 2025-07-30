# Production Deployment Guide

This guide will help you deploy your React application to production using nginx.

## Prerequisites

- Linux server with nginx installed
- Node.js and npm installed
- Git (for version control)
- Docker and Docker Compose (optional, for containerized deployment)

## Method 1: Traditional nginx Deployment

### Step 1: Build the Application

```bash
# Install dependencies
npm install

# Build for production
npm run build
```

### Step 2: Install and Configure nginx

```bash
# Install nginx (Ubuntu/Debian)
sudo apt update
sudo apt install nginx

# Install nginx (CentOS/RHEL)
sudo yum install nginx
# or
sudo dnf install nginx
```

### Step 3: Configure nginx

1. Copy the provided `nginx.conf` to your nginx configuration:
   ```bash
   sudo cp nginx.conf /etc/nginx/sites-available/react-app
   sudo ln -s /etc/nginx/sites-available/react-app /etc/nginx/sites-enabled/
   ```

2. Remove the default nginx site (optional):
   ```bash
   sudo rm /etc/nginx/sites-enabled/default
   ```

3. Test the configuration:
   ```bash
   sudo nginx -t
   ```

4. Reload nginx:
   ```bash
   sudo systemctl reload nginx
   ```

### Step 4: Deploy the Application

1. Copy your built files to nginx's web directory:
   ```bash
   sudo rm -rf /var/www/html/*
   sudo cp -r dist/* /var/www/html/
   ```

2. Set proper permissions:
   ```bash
   sudo chown -R www-data:www-data /var/www/html
   sudo chmod -R 755 /var/www/html
   ```

3. Reload nginx:
   ```bash
   sudo systemctl reload nginx
   ```

### Step 5: Using the Deployment Script

For automated deployment, use the provided `deploy.sh` script:

```bash
# Make the script executable
chmod +x deploy.sh

# Run the deployment
./deploy.sh
```

## Method 2: Docker Deployment

### Step 1: Build and Deploy with Docker Compose

```bash
# Build the application
npm run build

# Start the services
docker-compose up -d

# Check the status
docker-compose ps
```

### Step 2: Update the Application

```bash
# Rebuild the application
npm run build

# Restart the nginx container
docker-compose restart nginx
```

## Configuration Options

### Custom Domain

Update the `server_name` in `nginx.conf`:

```nginx
server_name yourdomain.com www.yourdomain.com;
```

### HTTPS/SSL Configuration

1. Obtain SSL certificates (Let's Encrypt recommended)
2. Update `nginx.conf` to include SSL configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    
    # ... rest of your configuration
}
```

### API Proxy Configuration

If your React app needs to communicate with a backend API, uncomment and configure the API proxy section in `nginx.conf`:

```nginx
location /api/ {
    proxy_pass http://localhost:3000/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
}
```

### WebSocket Proxy Configuration

For WebSocket connections (like Socket.IO), uncomment and configure the WebSocket proxy section in `nginx.conf`.

## Troubleshooting

### Common Issues

1. **Permission Denied**: Make sure nginx has read access to your web files
2. **404 Errors**: Check that the `try_files` directive is properly configured for React Router
3. **API Calls Failing**: Ensure your API proxy configuration is correct
4. **Static Assets Not Loading**: Verify file paths and permissions

### Useful Commands

```bash
# Check nginx status
sudo systemctl status nginx

# View nginx error logs
sudo tail -f /var/log/nginx/error.log

# View nginx access logs
sudo tail -f /var/log/nginx/access.log

# Test nginx configuration
sudo nginx -t

# Reload nginx configuration
sudo systemctl reload nginx

# Restart nginx service
sudo systemctl restart nginx
```

### Performance Optimization

1. **Enable Gzip Compression**: Already configured in the provided nginx.conf
2. **Browser Caching**: Static assets are configured with 1-year cache headers
3. **Security Headers**: Basic security headers are included in the configuration

## Monitoring and Maintenance

1. **Regular Updates**: Keep nginx and your application updated
2. **Log Monitoring**: Monitor nginx logs for errors and performance issues
3. **Backup Strategy**: Use the backup feature in the deployment script
4. **SSL Certificate Renewal**: Set up automatic renewal for Let's Encrypt certificates

## Security Considerations

1. **Firewall Configuration**: Only expose necessary ports (80, 443)
2. **Regular Security Updates**: Keep your system and nginx updated
3. **SSL/TLS**: Always use HTTPS in production
4. **Security Headers**: The provided configuration includes basic security headers

Your React application should now be successfully deployed and accessible via your domain or IP address! 