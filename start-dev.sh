#!/bin/bash

# Configurar variables de entorno para desarrollo
export PORT=3000
export WS_PORT=3001
export FRONTEND_URL=http://localhost:5173
export NATS_SERVERS=nats://localhost:4222

export DB_HOST=localhost
export DB_PORT=5432
export DB_USERNAME=postgres
export DB_PASSWORD=admin123
export DB_DATABASE=server-ms

echo "Starting server-ms with environment variables:"
echo "WS_PORT: $WS_PORT"
echo "FRONTEND_URL: $FRONTEND_URL"
echo "DB_HOST: $DB_HOST"
echo "DB_PORT: $DB_PORT"

# Ejecutar seed si es la primera vez
echo "🌱 Running database seed..."
npm run seed

# Ejecutar el servidor
npm run start:dev
