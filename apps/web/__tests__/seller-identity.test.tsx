import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import DiscoveryCanvas from '../components/DiscoveryCanvas';
import ZeroStepCheckout from '../components/ZeroStepCheckout';
import { Footer } from '../components/layout/Footer';
import FoodDetailPage from '../pages/food/[id]';
import { foodAPI } from '../lib/services';

jest.mock('next/router', () => ({
  useRouter: () => ({
    query: { id: 'food-1' },
    push: jest.fn(),
  }),
}));

jest.mock('../lib/services', () => ({
  foodAPI: { getById: jest.fn() },
  orderAPI: { create: jest.fn() },
}));

jest.mock('../components/layout/PageWrapper', () => ({
  PageWrapper: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
}));

jest.mock('../components/chat/StartConversationButton', () => ({
  StartConversationButton: () => <button type="button">Message seller</button>,
}));

const food = {
  id: 'food-1',
  name: 'Test Pralines',
  description: 'A food listing used to verify seller identity disclosure.',
  price: 12.5,
  country: 'BE',
  sellerId: 'seller-1',
  category: 'Chocolate',
  seller: {
    id: 'seller-1',
    name: 'Test Chocolatier',
    rating: 4.8,
    verified: true,
  },
  allergens: ['Milk'],
};

describe('persistent seller identity surfaces', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(foodAPI.getById).mockResolvedValue(food);
  });

  it('keeps seller identity visible in both discovery views', () => {
    render(<DiscoveryCanvas products={[food]} onQuickCheckout={jest.fn()} isLoading={false} />);

    expect(screen.getByLabelText('Sold by Test Chocolatier')).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Editorial Scroll' }));

    const editorialIdentity = screen.getByLabelText('Sold by Test Chocolatier');
    expect(editorialIdentity).toBeVisible();
    expect(editorialIdentity).not.toHaveClass('hidden');
  });

  it('shows the seller in the quick-checkout panel without a fabricated fallback', () => {
    const { rerender } = render(
      <ZeroStepCheckout product={food} isOpen onClose={jest.fn()} />,
    );

    expect(screen.getByLabelText('Sold by Test Chocolatier')).toBeVisible();

    rerender(<ZeroStepCheckout product={{ ...food, seller: undefined }} isOpen onClose={jest.fn()} />);
    expect(screen.getByLabelText('Sold by Seller identity unavailable')).toBeVisible();
  });

  it('keeps the food-detail seller identity sticky while the listing scrolls', async () => {
    render(<FoodDetailPage />);

    const sellerIdentity = await screen.findByLabelText('Sold by Test Chocolatier');
    expect(sellerIdentity).toBeVisible();
    expect(sellerIdentity).toHaveClass('sticky');
    expect(sellerIdentity).not.toHaveClass('hidden');
  });

  it('explains the marketplace and trader roles in the global footer', () => {
    render(<Footer />);

    expect(
      screen.getByText(/The “Sold by \[seller name\]” disclosure identifies the trader offering a product\./),
    ).toBeVisible();
  });
});
