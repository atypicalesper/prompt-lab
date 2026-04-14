#!/bin/bash
set -e

cd "$(dirname "$0")"

echo "LLM Observatory — setup"
echo ""

# Backend
echo "[1/4] Installing backend dependencies..."
cd backend && npm install

echo "[2/4] Generating Prisma client..."
npx prisma generate

echo "[3/4] Running database migration..."
npx prisma migrate dev --name init

cd ..

# Frontend
echo "[4/4] Installing frontend dependencies..."
cd frontend && npm install

cd ..

echo ""
echo "Setup complete."
echo ""
echo "Start the app:"
echo "  Terminal 1: cd backend && npm run start:dev"
echo "  Terminal 2: cd frontend && npm run dev"
echo ""
echo "URLs:"
echo "  Dashboard : http://localhost:3000"
echo "  API docs  : http://localhost:3001/api/docs"
echo ""
echo "Make sure Ollama is running: ollama serve"
