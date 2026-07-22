# EUshop Actor & Role Authorization Matrix (RBAC & Session Security)

**Authentication:** Auth0 JWT Filter (`JwtAuthenticationFilter.java`)  
**Session Cookies:** `HttpOnly`, `SameSite=Strict`, `Secure`  

---

## 1. Role-Based Access Control (RBAC) Matrix

| Endpoint Route | Method | Required Role | Object Ownership Check |
| :--- | :---: | :---: | :--- |
| `/api/orders` | `GET` | `BUYER` / `ADMIN` | `X-User-Id` matches order buyer ID |
| `/api/seller/foods` | `POST` | `SELLER` | Verified seller KYBC status gate |
| `/api/admin/moderation` | `POST` | `ADMIN` | Admin role verification header |
| `/api/users/me/anonymize` | `POST` | `BUYER` / `SELLER` | Self-actor ID matching |
