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
  it('renders become-seller page heading and compliance acknowledgment', () => {
    render(<BecomeSeller />);
    expect(screen.getByRole('heading', { level: 2, name: /become a seller/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: /gdpr\/dsc compliance acknowledgment/i })).toBeInTheDocument();
  });

  it('renders EU compliance information and call to action button', () => {
    render(<BecomeSeller />);
    expect(screen.getByText(/Jan Doerner \(EUshop Compliance Officer\)/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /continue to review/i })).toBeInTheDocument();
  });
});
