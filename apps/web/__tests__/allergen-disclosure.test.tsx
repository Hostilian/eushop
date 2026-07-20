import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { ProductCard } from '../components/ui/ProductCard';

const baseProduct = {
  id: 'food-1',
  name: 'Test Pralines',
  description: 'A test food listing',
  price: 12.5,
  country: 'BE',
  seller: {
    name: 'Test Chocolatier',
    rating: 4.8,
    verified: true,
  },
};

describe('product allergen disclosure', () => {
  it('renders allergen names as accessible text disclosures', () => {
    render(<ProductCard {...baseProduct} allergens={['Milk', 'Soya']} />);

    expect(screen.getByLabelText('Contains allergens:')).toBeInTheDocument();
    expect(screen.getByLabelText('Contains allergen: Milk')).toHaveTextContent('Milk');
    expect(screen.getByLabelText('Contains allergen: Soya')).toHaveTextContent('Soya');
  });

  it('summarizes additional allergens without hiding the disclosed count', () => {
    render(<ProductCard {...baseProduct} allergens={['Milk', 'Eggs', 'Soya', 'Peanuts']} />);

    expect(screen.getByLabelText('Contains allergen: Milk')).toBeInTheDocument();
    expect(screen.queryByLabelText('Contains allergen: Peanuts')).not.toBeInTheDocument();
    expect(screen.getByText('+1 more')).toBeInTheDocument();
  });

  it('does not render an allergen warning container for an empty declaration', () => {
    render(<ProductCard {...baseProduct} allergens={[]} />);

    expect(screen.queryByLabelText('Contains allergens:')).not.toBeInTheDocument();
  });
});

describe('product seller identity', () => {
  it('renders the seller name as an always-visible, non-decorative disclosure', () => {
    render(<ProductCard {...baseProduct} />);

    const sellerIdentity = screen.getByLabelText('Sold by Test Chocolatier');
    expect(sellerIdentity).toBeVisible();
    expect(sellerIdentity).toHaveTextContent('Sold by Test Chocolatier');
    expect(sellerIdentity).not.toHaveClass('hidden');
  });

  it('does not fabricate a seller identity when seller data is absent', () => {
    render(<ProductCard {...baseProduct} seller={undefined} />);

    expect(screen.getByLabelText('Sold by Seller identity unavailable')).toBeVisible();
  });
});

describe('FIC Art. 9 mandatory food disclosures (Task 35)', () => {
  it('renders net quantity and thermal packaging indicators on product card', () => {
    render(<ProductCard {...baseProduct} netQuantity="250g" thermalCategory="chilled_2_8C" />);

    expect(screen.getByText('250g')).toBeInTheDocument();
    expect(screen.getByLabelText('Thermal packaging: Chilled (2-8°C)')).toBeInTheDocument();
  });
});
