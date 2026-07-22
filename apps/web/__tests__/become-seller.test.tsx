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

jest.mock('../components/layout/PageWrapper', () => ({
  PageWrapper: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock the API services
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
      becomeSeller: jest.fn(),
    },
  };
});

// Storage mock
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
  it('renders trader onboarding page heading and DSA Art. 30 disclosures', () => {
    render(<BecomeSeller />);
    expect(screen.getByRole('heading', { level: 1, name: /Sell Regional Specialty Foods Across the EU/i })).toBeInTheDocument();
    expect(screen.getByText(/Regulation \(EU\) 2016\/1191/i)).toBeInTheDocument();
  });

  it('renders EU compliance information and submit verification button', () => {
    render(<BecomeSeller />);
    expect(screen.getByText(/DSA Art. 30 Public Trader Disclosure/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Submit Verification Data/i })).toBeInTheDocument();
  });
});
