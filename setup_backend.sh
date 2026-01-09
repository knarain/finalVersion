#!/usr/bin/env bash
# Backend Setup Script - Run this to fix the 500 error
# Usage: bash setup_backend.sh

set -e

echo "================================"
echo "Backend Setup & Fix"
echo "================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "backend/setup_database.php" ]; then
    echo -e "${RED}✗ Error: setup_database.php not found${NC}"
    echo "Please run this script from the project root directory"
    exit 1
fi

echo -e "${YELLOW}Step 1: Running database setup...${NC}"
php backend/setup_database.php

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database setup complete${NC}"
else
    echo -e "${RED}✗ Database setup failed${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}Step 2: Clearing cache...${NC}"
if [ -d "backend/writable/cache" ]; then
    rm -rf backend/writable/cache/*
    echo -e "${GREEN}✓ Cache cleared${NC}"
else
    echo -e "${YELLOW}! Cache directory not found (OK)${NC}"
fi

echo ""
echo -e "${YELLOW}Step 3: Testing API connection...${NC}"
# Wait a moment for database to settle
sleep 1

# Try to connect to API
if command -v curl &> /dev/null; then
    response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/api/roles)
    
    if [ "$response" = "200" ]; then
        echo -e "${GREEN}✓ API responding correctly (HTTP 200)${NC}"
    elif [ "$response" = "000" ]; then
        echo -e "${YELLOW}! Backend server not running${NC}"
        echo "  Start with: php -S localhost:8000"
    else
        echo -e "${YELLOW}! API returned HTTP $response${NC}"
        echo "  Check logs in: backend/writable/logs/"
    fi
else
    echo -e "${YELLOW}! curl not installed, skipping API test${NC}"
fi

echo ""
echo "================================"
echo -e "${GREEN}✓ Setup Complete!${NC}"
echo "================================"
echo ""
echo "Next steps:"
echo "1. Start backend server (if not running):"
echo "   cd backend && php -S localhost:8000"
echo ""
echo "2. Test endpoints:"
echo "   curl http://localhost:8000/api/roles"
echo ""
echo "3. Start frontend:"
echo "   npm run dev"
echo ""
echo "Issues? Check:"
echo "- backend/writable/logs/ for error messages"
echo "- BACKEND_FIX_GUIDE.md for detailed troubleshooting"
echo ""
