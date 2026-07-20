import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import Impressum from '../pages/impressum';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    query: {},
    pathname: '/impressum',
    asPath: '/impressum',
    route: '/impressum'
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

describe('Impressum Page (§ 5 TMG / DSA Art. 30 Statutory Disclosures)', () => {
  it('renders Impressum page title and main heading', () => {
    render(<Impressum />);
    const heading = screen.getByRole('heading', { level: 1, name: /impressum /i });
    expect(heading).toBeInTheDocument();
  });

  it('renders statutory company information required by § 5 TMG', () => {
    render(<Impressum />);
    expect(screen.getByText(/Information according to § 5 TMG/i)).toBeInTheDocument();
    expect(screen.getByText(/EUshop Marketplace B.V./i)).toBeInTheDocument();
  });

  it('renders contact details and supervisory authority disclosures', () => {
    render(<Impressum />);
    expect(screen.getByText(/Contact: jan.doe@eushop.eu/i)).toBeInTheDocument();
    expect(screen.getByText(/Regulatory & Supervisory Authority/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /dispute resolution/i })).toBeInTheDocument();
  });
});
