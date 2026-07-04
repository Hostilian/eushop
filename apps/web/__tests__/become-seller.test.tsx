import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import BecomeSeller from '../pages/become-seller';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    query: {},
    pathname: '/',
    asPath: '/',
    route: '/'
  })
}));

// Mock Next.js Link
jest.mock('next/link', () => {
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
  MockLink.displayName = 'MockLink';
  return MockLink;
});

// Mock the API services — the page calls authAPI.getCurrentUser on mount.
// NOTE: jest.mock is hoisted, so mockUser must be defined INSIDE the factory.
jest.mock('../lib/services', () => {
  const fakeUser = {
    id: 'test-user-id',
    email: 'seller@test.eu',
    name: 'Test Seller',
    country: 'DE',
    role: 'BUYER',
    kycVerified: false,
    emailVerified: true,
    selfCertifiedCompliant: false,
  };
  return {
    authAPI: {
      getCurrentUser: jest.fn().mockResolvedValue(fakeUser),
      getCachedProfile: jest.fn().mockReturnValue(fakeUser),
    },
  };
});

// Storage mock (shared for localStorage + sessionStorage)
const storageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
    length: 0,
    key: (_: number) => null,
  };
})();

Object.defineProperty(window, 'localStorage', { value: storageMock, writable: true });
Object.defineProperty(window, 'sessionStorage', { value: storageMock, writable: true });

describe('BecomeSeller Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    storageMock.clear();
  });

  it('renders become-seller page heading', async () => {
    render(<BecomeSeller />);
    // Wait for async getCurrentUser to resolve and the form to render
    const heading = await screen.findByRole('heading', { name: /become a seller/i });
    expect(heading).toBeInTheDocument();
  });

  it('renders key form section labels after loading', async () => {
    render(<BecomeSeller />);
    // Wait for the loading spinner to disappear and the form to appear
    await waitFor(() => {
      expect(screen.queryByText('Loading user data...')).not.toBeInTheDocument();
    });
    expect(screen.getByText('Business Name')).toBeInTheDocument();
    expect(screen.getByText('Business Email')).toBeInTheDocument();
    expect(screen.getByText('Phone Number')).toBeInTheDocument();
    expect(screen.getByText(/KYB & Tax Verification/)).toBeInTheDocument();
  });
});

