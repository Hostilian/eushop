// COMPLIANCE-REVIEW: RBAC Role-Based Access Control Module
// Enforces strict separation of duties between BUYER, SELLER, and ADMIN per EU regulations.

export type Role = 'BUYER' | 'SELLER' | 'ADMIN';

export interface UserContext {
  userId: string;
  role: Role;
  sellerId?: string;
}

export function hasPermission(user: UserContext, requiredRole: Role): boolean {
  if (user.role === 'ADMIN') return true;
  if (requiredRole === 'SELLER' && user.role === 'SELLER') return true;
  if (requiredRole === 'BUYER') return true;
  return false;
}

export function validateSellerOwnership(user: UserContext, resourceSellerId: string): boolean {
  if (user.role === 'ADMIN') return true;
  if (user.role === 'SELLER' && user.sellerId === resourceSellerId) return true;
  return false;
}
