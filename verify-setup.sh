#!/bin/bash
# EUshop Phase 1 - Verification Script
# Checks all components are ready to run

echo "🍫 EUshop Phase 1 - Verification Checklist"
echo "=========================================="
echo ""

# Check 1: Node.js and pnpm
echo "✓ Checking Node.js and pnpm..."
node_version=$(node --version)
pnpm_version=$(pnpm --version)
echo "  Node.js: $node_version"
echo "  pnpm: $pnpm_version"
echo ""

# Check 2: Project structure
echo "✓ Checking project structure..."
check_dir() {
  if [ -d "$1" ]; then
    echo "  ✅ $1"
  else
    echo "  ❌ $1 - MISSING"
  fi
}

check_file() {
  if [ -f "$1" ]; then
    echo "  ✅ $1"
  else
    echo "  ❌ $1 - MISSING"
  fi
}

check_dir "apps/web"
check_dir "apps/mobile"
check_dir "services/api-gateway"
check_dir "services/core-service"
check_dir "db/migrations"
check_dir "db/seed"
echo ""

# Check 3: Configuration files
echo "✓ Checking configuration files..."
check_file "package.json"
check_file "pnpm-workspace.yaml"
check_file "docker-compose.yml"
check_file ".env.example"
check_file "pnpm-lock.yaml"
echo ""

# Check 4: Dependencies
echo "✓ Checking node_modules..."
if [ -d "node_modules" ]; then
  echo "  ✅ node_modules exists"
  pkg_count=$(find node_modules -maxdepth 1 -type d | wc -l)
  echo "  📦 Packages installed: $pkg_count"
else
  echo "  ❌ node_modules - Run 'pnpm install'"
fi
echo ""

# Check 5: Web pages
echo "✓ Checking web app pages..."
check_file "apps/web/pages/index.tsx"
check_file "apps/web/pages/login.tsx"
check_file "apps/web/pages/signup.tsx"
check_file "apps/web/pages/dashboard.tsx"
check_file "apps/web/pages/search.tsx"
check_file "apps/web/pages/become-seller.tsx"
check_file "apps/web/pages/cart.tsx"
check_file "apps/web/pages/checkout.tsx"
check_file "apps/web/pages/privacy.tsx"
check_file "apps/web/pages/terms.tsx"
check_file "apps/web/pages/admin/dashboard.tsx"
echo ""

# Check 6: API Gateway routes
echo "✓ Checking API Gateway setup..."
check_file "services/api-gateway/src/index.ts"
check_file "services/api-gateway/src/routes/auth.ts"
check_file "services/api-gateway/src/routes/foods.ts"
check_file "services/api-gateway/src/middleware/error-handler.ts"
echo ""

# Check 7: Database setup
echo "✓ Checking database files..."
check_file "db/migrations/001_initial_schema.sql"
check_file "db/seed/001_initial_data.sql"
check_file "db/scripts/migrate.js"
check_file "db/scripts/seed.js"
echo ""

# Check 8: Documentation
echo "✓ Checking documentation..."
check_file "DEVELOPMENT.md"
check_file "API.md"
check_file "README.md"
check_file "STATUS.md"
check_file "docs/AUTH0_SETUP.md"
echo ""

# Check 9: Docker (optional)
echo "✓ Checking Docker..."
if command -v docker &> /dev/null; then
  docker_version=$(docker --version)
  echo "  ✅ $docker_version"
else
  echo "  ⚠️  Docker not found - required for running infrastructure"
fi

if command -v docker-compose &> /dev/null; then
  dc_version=$(docker-compose --version)
  echo "  ✅ $dc_version"
else
  echo "  ⚠️  Docker Compose not found - required for running infrastructure"
fi
echo ""

# Summary
echo "=========================================="
echo "✅ Phase 1 Verification Complete!"
echo ""
echo "Next Steps:"
echo "1. Edit .env.local with your settings"
echo "2. Run: docker-compose up -d"
echo "3. Run: pnpm db:migrate && pnpm db:seed"
echo "4. Run: pnpm dev"
echo "5. Open: http://localhost:3000"
echo ""
echo "For detailed setup instructions, see DEVELOPMENT.md"
