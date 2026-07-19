import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import Checkout from '../pages/checkout';

jest.mock('@stripe/stripe-js', () => ({
  loadStripe: jest.fn(() => Promise.resolve({})),
}));

jest.mock('@stripe/react-stripe-js', () => ({
  Elements: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  CardElement: () => <div data-testid="card-element" />,
  useStripe: () => ({ confirmCardPayment: jest.fn() }),
  useElements: () => ({ getElement: jest.fn() }),
}));

jest.mock('../components/layout/PageWrapper', () => ({
  PageWrapper: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('../lib/services', () => ({
  authAPI: {
    getCurrentUser: jest.fn().mockResolvedValue({
      id: 'buyer-1',
      email: 'buyer@example.test',
      name: 'Test Buyer',
      country: 'DE',
      role: 'BUYER',
    }),
  },
  foodAPI: {
    getById: jest.fn().mockResolvedValue({ sellerId: 'seller-1', finderFee: 5 }),
  },
  orderAPI: { create: jest.fn() },
  paymentAPI: { createPaymentIntent: jest.fn() },
}));

describe('checkout VAT summary', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.localStorage.setItem('cart', JSON.stringify([
      { id: 'food-1', name: 'Test Food', country: 'DE', price: 100, quantity: 1 },
    ]));
  });

  it('renders the destination-country VAT rate and amount for the buyer country', async () => {
    render(<Checkout />);

    await waitFor(() => {
      expect(screen.getByTestId('checkout-vat-amount')).toHaveTextContent('7.00');
    });
    expect(screen.getByText(/VAT \(7%.*DE\)/)).toBeInTheDocument();
    expect(screen.getByTestId('oss-threshold-note')).toHaveTextContent('10,000');
  });

  it('recalculates the displayed VAT when the destination country changes', async () => {
    render(<Checkout />);

    const destinationCountry = await screen.findByRole('combobox');
    fireEvent.change(destinationCountry, { target: { value: 'DK' } });

    await waitFor(() => {
      expect(screen.getByTestId('checkout-vat-amount')).toHaveTextContent('25.00');
    });
    expect(screen.getByText(/VAT \(25%.*DK\)/)).toBeInTheDocument();
  });
});
