# EU Specialty Food Marketplace - Demo Guide

## ⚡ Quick Start (5 minutes)

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ / pnpm
- Maven 3.8+
- Git

### Setup

```bash
# 1. Clone and install
git clone <repo-url>
cd eushop

# 2. Run setup script (Linux/Mac)
chmod +x demo-setup.sh
./demo-setup.sh

# 3. On Windows - run commands manually:
docker-compose up -d
pnpm install
pnpm db:migrate
pnpm db:seed

# 4. Start development
pnpm dev
```

### Access the Demo
- **Web App**: http://localhost:3000
- **API Gateway**: http://localhost:3001/api
- **Core Service**: http://localhost:8080/api

### Demo Credentials
```
Email:    seller1@example.com (also: buyer1@example.com, seller2@example.com)
Password: password123
```

---

## 🎯 Demo Flow

### 1. Landing Page (Auto-play)
- Homepage with featured foods
- Browse trending items
- Navigate to Search page

### 2. Sign Up (New User)
- Click "Sign Up" in header
- Enter: email, password, name, country
- Creates account and auto-logs in
- Redirects to Dashboard

### 3. Dashboard
- View profile info
- Quick action buttons:
  - Browse Foods
  - Create Listing (seller)

### 4. Food Search
- Search by food name (e.g., "Chocolate")
- Filter by country
- Pagination through results
- Click food card to see details

### 5. Food Detail Page
- Full product information:
  - Price and finder fee
  - Country/Category
  - Description & dietary info
  - Seller rating & verification
- Quantity selector
- Add to Cart button
- Message Seller option

### 6. Seller Dashboard (if seller account)
- View own listings
- Edit/Delete products
- View orders
- Track revenue

### 7. Logout
- Click profile → Logout
- Redirected to home page
- Token cleared from storage

---

## 🔄 Full Feature Demo

### Authentication Flow
```
Sign Up → Create Account → Login → Dashboard → Browse Foods → View Details → Message Seller → Logout
```

### Data Flow
```
Frontend (Next.js)
     ↓
API Gateway (Express)
     ↓
Core Service (Spring Boot)
     ↓
PostgreSQL Database
```

---

## 📊 Demo Data

### Pre-seeded Sellers (3)
1. **Belgian Chocolatier** (Belgium)
   - Products: Premium Belgian Chocolate
   - Rating: ⭐⭐⭐⭐⭐
   - Status: Verified

2. **Italian Truffles** (Italy)
   - Products: Fresh Truffles, Truffle Oil
   - Rating: ⭐⭐⭐⭐
   - Status: Verified

3. **Swiss Cheese Expert** (Switzerland)
   - Products: Emmental, Gruyère
   - Rating: ⭐⭐⭐⭐⭐
   - Status: Verified

### Products (9 items)
- €24.99 - €44.99 price range
- Multiple countries represented
- Various categories (Chocolate, Cheese, Wine, etc.)
- Mix of featured and standard products

### Test Users
- **Buyer Account**: buyer1@example.com
- **Seller Accounts**: seller1@example.com, seller2@example.com
- **Password**: password123 (all accounts)

---

## 🛠 Troubleshooting

### Ports Already in Use
```bash
# Find and kill process on port 3000
lsof -i :3000
kill -9 <PID>

# Or use different ports
NEXT_PUBLIC_API_URL=http://localhost:3001/api pnpm dev
```

### Database Connection Error
```bash
# Check PostgreSQL is running
docker-compose ps

# Restart containers
docker-compose down
docker-compose up -d

# Re-run migrations
pnpm db:migrate
```

### Build Errors
```bash
# Clear cache and rebuild
rm -rf node_modules .next
pnpm install
pnpm build

# For Spring Boot
cd services/core-service
mvn clean compile
```

### API Gateway Not Responding
```bash
# Check if running
curl http://localhost:3001/health

# Check logs
docker-compose logs api-gateway
```

---

## 📱 Mobile App Demo (React Native)

```bash
# Start Expo development
cd apps/mobile
npm start

# Scan QR code with:
# - Expo Go app on iOS
# - Expo Go or Android Studio on Android

# Same features as web:
- Browse foods
- View details
- Message sellers
- Profile management
```

---

## 🔐 Authentication Details

### Mock Auth (Phase 1 - Default)
- JWT tokens created on frontend
- Base64 encoded with 24-hour expiry
- Stored in localStorage

### Real Auth0 (Phase 2 - Production)
To enable:
1. Set `NEXT_PUBLIC_USE_MOCK_AUTH=false` in .env.local
2. Configure Auth0 credentials (see AUTH0_SETUP.md)
3. Restart development server

---

## 📊 API Endpoints

### Foods (Read-only for demo)
```
GET    /api/foods                  # List all foods
GET    /api/foods?query=chocolate  # Search foods
GET    /api/foods/trending         # Trending items
GET    /api/foods/:id              # Food details
POST   /api/foods                  # Create (requires auth)
```

### Users
```
GET    /api/users/:id              # Get user profile
GET    /api/users                  # Current user (requires auth)
GET    /api/users/sellers/top      # Top sellers
GET    /api/users/sellers/country/:country  # Sellers by country
```

### Orders
```
GET    /api/orders                 # User's orders (requires auth)
GET    /api/orders/:id             # Order details
POST   /api/orders                 # Create order (requires auth)
```

---

## 🎨 UI/UX Highlights

### Pages
- ✅ Landing page with hero section
- ✅ Search with filters & pagination
- ✅ Product detail page with rich info
- ✅ User dashboard & profile
- ✅ Login/Signup forms with validation
- ✅ Responsive design (mobile-first)

### Styling
- Tailwind CSS 3.4
- Custom color palette (Indigo primary, Purple secondary)
- Consistent spacing & typography
- Loading states & error messages
- Toast notifications (ready to implement)

---

## 📈 Performance Notes

### Frontend
- Next.js 16 with React 19
- Image optimization
- Code splitting & lazy loading
- API response caching (5 min default)

### Backend
- Spring Boot 3.2 with optimized queries
- Connection pooling (HikariCP)
- Database indexing on foreign keys
- Pagination for large datasets

### Database
- PostgreSQL 16 with proper schemas
- Normalized design (8 tables)
- JSONB columns for flexibility
- Strategic indexes for common queries

---

## 🚀 For Production

### Security Checklist
- [ ] Switch to real Auth0 authentication
- [ ] Enable HTTPS/SSL
- [ ] Set secure CORS origins
- [ ] Use environment-specific .env files
- [ ] Enable database backups
- [ ] Set up monitoring & logging
- [ ] Configure rate limiting
- [ ] Implement payment processing (Stripe)

### Deployment
- Containerize with Docker
- Deploy to Kubernetes or managed platform
- Use environment variables for secrets
- Set up CI/CD pipelines
- Database migrations in deployment
- Health checks & auto-scaling

---

## 📚 Additional Resources

### Documentation
- **DEVELOPMENT.md** - Full development guide
- **API.md** - Complete API reference
- **AUTH0_SETUP.md** - Authentication setup
- **PHASE-2-IMPLEMENTATION.md** - Architecture details
- **PHASE-2-VALIDATION.md** - Testing checklist

### Code Structure
```
eushop/
├── apps/
│   ├── web/          # Next.js frontend
│   └── mobile/       # React Native mobile
├── services/
│   ├── api-gateway/  # Express API Gateway
│   ├── core-service/ # Spring Boot backend
│   └── messaging-service/ # WebFlux messaging
├── db/               # Database migrations & seeds
├── docker-compose.yml
└── pnpm-workspace.yaml
```

---

## ❓ FAQ

**Q: Can I modify products?**
A: Yes! Seller accounts can create, edit, and delete their own listings. Buyer accounts can browse and message sellers.

**Q: How do I become a seller?**
A: On the Dashboard, click "Become Seller" or navigate to `/become-seller` page.

**Q: Is payment integrated?**
A: Stripe integration is in Phase 3. For now, order creation is mocked.

**Q: How do I reset the database?**
A: Run `pnpm db:reset` or manually drop/recreate the database and re-seed.

**Q: Can I use real Auth0?**
A: Yes! See AUTH0_SETUP.md for instructions and set `NEXT_PUBLIC_USE_MOCK_AUTH=false`.

---

## 🎓 Learning Paths

### Frontend Development
1. Explore React 19 features in components
2. Understand Next.js routing (pages, dynamic routes)
3. Study Tailwind CSS responsive patterns
4. Review Axios interceptors for auth

### Backend Development
1. Check Spring Boot entity relationships
2. Study JPA repository query patterns
3. Explore controller request mapping
4. Review error handling middleware

### Full-Stack Integration
1. Follow auth flow from login to API call
2. Trace data from UI to database
3. Understand pagination & filtering
4. Study caching & performance optimization

---

**Demo Version**: Ready for presentation and initial testing  
**Last Updated**: May 2026  
**Status**: ✅ Phase 2 Complete - Demo Ready
