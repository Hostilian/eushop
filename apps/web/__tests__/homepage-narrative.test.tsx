import { render, screen } from '@testing-library/react';
import Home from '../pages/index';

jest.mock('../components/layout/PageWrapper', () => ({
  PageWrapper: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('../components/ui/ProductCard', () => ({
  ProductCard: ({
    name,
    ...rest
  }: {
    name: string;
    [key: string]: any;
  }) => <article>{name}</article>,
}));

jest.mock('../lib/services', () => {
  const foods = [
    { id: '1', name: 'Belgian Pralines', description: 'Food', country: 'Belgium', price: 12, sellerId: 's1' },
    { id: '2', name: 'Czech Wafers', description: 'Food', country: 'Czechia', price: 8, sellerId: 's2' },
    { id: '3', name: 'Italian Cream', description: 'Food', country: 'Italy', price: 10, sellerId: 's3' },
  ];
  return {
    fallbackTrendingFoods: foods,
    foodAPI: { getTrendingWithOrigin: jest.fn(() => new Promise(() => undefined)) },
  };
});

describe('homepage clarity narrative', () => {
  it('states the value proposition and primary buyer/seller actions', () => {
    render(<Home />);

    expect(screen.getByRole('heading', {
      level: 1,
      name: /Shop Europe like a local/i,
    })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /Explore European Marketplace/i })[0])
      .toHaveAttribute('href', '/search');
    expect(screen.getAllByRole('link', { name: /Sell on EUshop/i })[0])
      .toHaveAttribute('href', '/become-seller');
  });

  it('shows the European Food Atlas and trust architecture shield', () => {
    render(<Home />);

    expect(screen.getByRole('heading', { name: 'Shop Europe by Origin & Specialty' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'From Europe This Week' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Explore Curated European Collections' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'European Marketplace Trust & Compliance Shield' })).toBeInTheDocument();
    expect(screen.getByText(/DSA Art\. 30 Named Traders/i)).toBeInTheDocument();
    expect(screen.getByText(/14 EU Regulated Allergens/i)).toBeInTheDocument();
  });
});
