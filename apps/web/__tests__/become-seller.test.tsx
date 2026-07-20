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
  beforeEach(() => {
    jest.clearAllMocks();
    storageMock.clear();
  });

  it('renders become-seller page heading', async () => {
    render(<BecomeSeller />);
    const heading = await screen.findByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
  });

  it('renders key form section labels after loading', async () => {
    render(<BecomeSeller />);
    await waitFor(() => {
      expect(screen.queryByText('Loading user data...')).not.toBeInTheDocument();
    });
    expect(screen.getByText('Business Name')).toBeInTheDocument();
    expect(screen.getByText('Business Email')).toBeInTheDocument();
    expect(screen.getByText('Phone Number')).toBeInTheDocument();
  });

  it('marks required form input fields appropriately', async () => {
    render(<BecomeSeller />);
    await screen.findByRole('heading', { level: 1 });

    const requiredFields = [
      screen.getByPlaceholderText('e.g. Artisanal Foods Ltd'),
      screen.getByDisplayValue('seller@test.eu'),
      screen.getByPlaceholderText('+49 123 456789'),
      screen.getByPlaceholderText(/Václavské/i),
      screen.getByPlaceholderText('e.g. Prague'),
      screen.getByPlaceholderText('e.g. 11000'),
    ];

    requiredFields.forEach(field => expect(field).toBeRequired());
  });

  it('renders multi-step progress steps', async () => {
    render(<BecomeSeller />);
    await screen.findByRole('heading', { level: 1 });

    expect(screen.getByText('Step 1 of 4')).toBeInTheDocument();
    expect(screen.getByText('Step 2 of 4')).toBeInTheDocument();
    expect(screen.getByText('Step 3 of 4')).toBeInTheDocument();
    expect(screen.getByText('Step 4 of 4')).toBeInTheDocument();
  });
});
