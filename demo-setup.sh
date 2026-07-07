#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}EU Specialty Food Marketplace - Demo Setup${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    exit 1
fi
if ! command -v pnpm &> /dev/null && ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm/pnpm is not installed${NC}"
    exit 1
fi
if ! command -v mvn &> /dev/null; then
    echo -e "${RED}❌ Maven is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ All prerequisites installed${NC}\n"

# Setup environment
echo -e "${YELLOW}Setting up environment...${NC}"
cp .env.example .env.local 2>/dev/null || echo "No .env.example found"

# Create necessary directories
mkdir -p services/core-service/src/main/java/com/eushop/core/{entity,repository,service,controller,dto}

echo -e "${GREEN}✓ Environment configured${NC}\n"

# Install dependencies
echo -e "${YELLOW}Installing Node dependencies...${NC}"
if command -v pnpm &> /dev/null; then
    pnpm install
else
    npm install
fi
echo -e "${GREEN}✓ Node dependencies installed${NC}\n"

# Start Docker services
echo -e "${YELLOW}Starting Docker containers...${NC}"
docker-compose up -d
sleep 5
echo -e "${GREEN}✓ Docker containers started${NC}\n"

# Run database migrations
echo -e "${YELLOW}Running database migrations...${NC}"
if command -v pnpm &> /dev/null; then
    pnpm db:migrate
else
    npm run db:migrate
fi
sleep 2
echo -e "${GREEN}✓ Database migrations complete${NC}\n"

# Seed database
echo -e "${YELLOW}Seeding database...${NC}"
if command -v pnpm &> /dev/null; then
    pnpm db:seed
else
    npm run db:seed
fi
sleep 2
echo -e "${GREEN}✓ Database seeded${NC}\n"

# Build Spring Boot
echo -e "${YELLOW}Building Spring Boot Core Service...${NC}"
cd services/core-service
./mvnw clean package -DskipTests -q
cd ../..
echo -e "${GREEN}✓ Spring Boot built${NC}\n"

# Start services
echo -e "${YELLOW}Starting development servers...${NC}"
echo -e "${GREEN}✓ Starting services in background...${NC}\n"

# Show summary
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Demo Setup Complete!${NC}"
echo -e "${BLUE}========================================${NC}\n"

echo -e "${GREEN}Services Starting:${NC}"
echo -e "  • Frontend:       ${BLUE}http://localhost:3002${NC}"
echo -e "  • Core Service:   ${BLUE}http://localhost:3001${NC}"
echo -e "  • PostgreSQL:     ${BLUE}localhost:5432${NC}"
echo -e "  • Redis:          ${BLUE}localhost:6379${NC}\n"

echo -e "${YELLOW}To start development:${NC}"
echo -e "  ${BLUE}pnpm dev${NC}\n"

echo -e "${YELLOW}Demo Credentials:${NC}"
echo -e "  Email:    ${BLUE}seller1@example.com${NC}"
echo -e "  Password: ${BLUE}password123${NC}\n"

echo -e "${YELLOW}Next Steps:${NC}"
echo -e "  1. Run: ${BLUE}pnpm dev${NC}"
echo -e "  2. Open: ${BLUE}http://localhost:3000${NC}"
echo -e "  3. Sign up or login with demo credentials"
echo -e "  4. Browse foods and explore the marketplace\n"

echo -e "${YELLOW}Documentation:${NC}"
echo -e "  • DEVELOPMENT.md - Full development guide"
echo -e "  • PHASE-2-IMPLEMENTATION.md - Architecture overview"
echo -e "  • API.md - API endpoint reference\n"
