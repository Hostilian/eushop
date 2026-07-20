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
      name: 'Buy authentic regional foods from European sellers.',
    })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Explore Marketplace' })[0])
      .toHaveAttribute('href', '/search');
    expect(screen.getByRole('link', { name: 'Sell on EUshop' }))
      .toHaveAttribute('href', '/become-seller');
  });

  it('shows the three-step workflow and qualified trust layer', () => {
    render(<Home />);

    expect(screen.getByRole('heading', { name: 'Discover by place and preference' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Review the listing before buying' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Order through one marketplace' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Allergen disclosures' })).toBeInTheDocument();
    expect(screen.getByText(/not a legal certification or product guarantee/i)).toBeInTheDocument();
    expect(screen.getByText(/require qualified human review/i)).toBeInTheDocument();
  });
});
