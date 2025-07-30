#!/bin/bash

# Deployment script for React app to nginx
# Make sure to run this script with appropriate permissions

echo "🚀 Starting deployment process..."

# Build the application
echo "📦 Building the application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Exiting..."
    exit 1
fi

echo "✅ Build completed successfully!"

# Check if dist directory exists
if [ ! -d "dist" ]; then
    echo "❌ dist directory not found! Exiting..."
    exit 1
fi

# Create backup of current deployment (optional)
if [ -d "/var/www/html" ]; then
    echo "📋 Creating backup of current deployment..."
    sudo cp -r /var/www/html /var/www/html.backup.$(date +%Y%m%d_%H%M%S)
fi

# Deploy to nginx directory
echo "📤 Deploying to nginx..."
sudo rm -rf /var/www/html/*
sudo cp -r dist/* /var/www/html/

# Set proper permissions
echo "🔐 Setting permissions..."
sudo chown -R www-data:www-data /var/www/html
sudo chmod -R 755 /var/www/html

# Test nginx configuration
echo "🔍 Testing nginx configuration..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Nginx configuration is valid!"
    
    # Reload nginx
    echo "🔄 Reloading nginx..."
    sudo systemctl reload nginx
    
    if [ $? -eq 0 ]; then
        echo "🎉 Deployment completed successfully!"
        echo "🌐 Your application should now be available at: http://localhost"
    else
        echo "❌ Failed to reload nginx!"
        exit 1
    fi
else
    echo "❌ Nginx configuration is invalid!"
    exit 1
fi 