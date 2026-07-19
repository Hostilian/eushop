import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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
      becomeSeller: jest.fn(),
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

  it('marks the DSA and DAC7 identity fields as required', async () => {
    render(<BecomeSeller />);
    await screen.findByRole('heading', { name: /become a seller/i });

    const requiredFields = [
      screen.getByPlaceholderText('e.g. Fine Foods Ltd'),
      screen.getByRole('combobox'),
      screen.getByDisplayValue('seller@test.eu'),
      screen.getByPlaceholderText('+49 123 456789'),
      screen.getByPlaceholderText('e.g. HRB 12345'),
      screen.getByPlaceholderText('e.g. DE123456789'),
      screen.getByPlaceholderText(/clavsk/i),
      screen.getByPlaceholderText('e.g. Prague'),
      screen.getByPlaceholderText('e.g. 11000'),
    ];

    requiredFields.forEach(field => expect(field).toBeRequired());
    expect(screen.getByPlaceholderText('e.g. EU VAT Number')).not.toBeRequired();
  });

  it('blocks submission until self-certification and terms are accepted', async () => {
    render(<BecomeSeller />);
    await screen.findByRole('heading', { name: /become a seller/i });

    fireEvent.change(screen.getByPlaceholderText('e.g. Fine Foods Ltd'), { target: { value: 'Fine Foods Ltd' } });
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Germany' } });
    fireEvent.change(screen.getByPlaceholderText('+49 123 456789'), { target: { value: '+49 123 456789' } });
    fireEvent.change(screen.getByPlaceholderText('e.g. HRB 12345'), { target: { value: 'HRB 12345' } });
    fireEvent.change(screen.getByPlaceholderText('e.g. DE123456789'), { target: { value: 'DE123456789' } });
    fireEvent.change(screen.getByPlaceholderText(/clavsk/i), { target: { value: 'Test Street 1' } });
    fireEvent.change(screen.getByPlaceholderText('e.g. Prague'), { target: { value: 'Berlin' } });
    fireEvent.change(screen.getByPlaceholderText('e.g. 11000'), { target: { value: '10115' } });
    fireEvent.click(screen.getByRole('button', { name: /apply to become a seller/i }));

    expect(await screen.findByText(/must self-certify compliance and accept/i)).toBeInTheDocument();
  });
});


