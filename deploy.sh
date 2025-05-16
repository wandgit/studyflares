#!/bin/bash

echo "📦 Installing dependencies..."
npm install || exit 1

echo "🔨 Building project..."
npm run build || exit 1

echo "🚚 Deploying to /var/www/studyflares..."
sudo rm -rf /var/www/studyflares/*
sudo cp -r dist/* /var/www/studyflares/

echo "🔄 Reloading Caddy..."
sudo caddy reload

echo "✅ Deployment complete!"