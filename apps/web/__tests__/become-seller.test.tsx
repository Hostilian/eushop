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

<<<<<<< HEAD
jest.mock('../components/layout/PageWrapper', () => ({
  PageWrapper: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock the API services
=======
// Mock the API services — the page calls authAPI.getCurrentUser on mount.
// NOTE: jest.mock is hoisted, so mockUser must be defined INSIDE the factory.
>>>>>>> pull-1
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
<<<<<<< HEAD
      becomeSeller: jest.fn(),
=======
>>>>>>> pull-1
    },
  };
});

<<<<<<< HEAD
// Storage mock
=======
// Storage mock (shared for localStorage + sessionStorage)
>>>>>>> pull-1
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
<<<<<<< HEAD
  it('renders trader onboarding page heading and DSA Art. 30 disclosures', () => {
    render(<BecomeSeller />);
    expect(screen.getByRole('heading', { level: 1, name: /Trader Onboarding & Cross-Border Identity Verification/i })).toBeInTheDocument();
    expect(screen.getByText(/Regulation \(EU\) 2016\/1191/i)).toBeInTheDocument();
  });

  it('renders EU compliance information and submit verification button', () => {
    render(<BecomeSeller />);
    expect(screen.getByText(/DSA Art. 30 Public Trader Disclosure/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Submit Verification Data/i })).toBeInTheDocument();
  });
});
=======
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


>>>>>>> pull-1
