import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import CartPage from '../pages/cart';

jest.mock('../components/layout/PageWrapper', () => ({
  PageWrapper: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('CartPage Component', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('renders cart page header', () => {
    render(<CartPage />);
    const heading = screen.getByRole('heading', { level: 1, name: /^your cart$/i });
    expect(heading).toBeInTheDocument();
  });

  it('renders the empty state if localStorage is empty', () => {
    render(<CartPage />);
    expect(screen.getByRole('heading', { name: /your cart is empty/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /browse foods/i })).toHaveAttribute('href', '/search');
  });

  it('calculates the correct subtotal', () => {
    const mockCart = [
      { id: '1', name: 'Belgian Chocolates', country: 'Belgium', price: 25.00, quantity: 2 }, // €50
      { id: '2', name: 'Italian Balsamic', country: 'Italy', price: 30.00, quantity: 1 }    // €30
    ];
    window.localStorage.setItem('cart', JSON.stringify(mockCart));
    
    render(<CartPage />);
    
    // Subtotal should be €80
    const subtotalElements = screen.getAllByText('€80.00');
    expect(subtotalElements.length).toBeGreaterThan(0);
  });
});
