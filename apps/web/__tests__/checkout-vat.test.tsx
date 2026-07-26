import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useElements, useStripe } from '@stripe/react-stripe-js';
import Checkout from '../pages/checkout';
import { marketplaceCheckoutAPI, orderAPI } from '../lib/services';

jest.mock('@stripe/stripe-js', () => ({
  loadStripe: jest.fn(() => Promise.resolve({})),
}));

jest.mock('@stripe/react-stripe-js', () => ({
  Elements: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  CardElement: () => <div data-testid="card-element" />,
  useStripe: jest.fn(),
  useElements: jest.fn(),
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
  marketplaceCheckoutAPI: {
    createPaymentIntent: jest.fn(),
  },
}));

const mockConfirmCardPayment = jest.fn().mockResolvedValue({ error: undefined });
const mockGetElement = jest.fn(() => ({}));
const mockCreateMarketplacePaymentIntent =
  marketplaceCheckoutAPI.createPaymentIntent as jest.MockedFunction<
    typeof marketplaceCheckoutAPI.createPaymentIntent
  >;
const mockCreateLegacyOrder = orderAPI.create as jest.MockedFunction<
  typeof orderAPI.create
>;

describe('checkout VAT summary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useStripe as jest.Mock).mockReturnValue({
      confirmCardPayment: mockConfirmCardPayment,
    });
    (useElements as jest.Mock).mockReturnValue({ getElement: mockGetElement });
    mockConfirmCardPayment.mockResolvedValue({ error: undefined });
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

  it('uses the server-authoritative aggregate and does not create legacy orders', async () => {
    mockCreateMarketplacePaymentIntent.mockResolvedValue({
      marketplaceOrderId: 'marketplace-1',
      paymentIntentId: 'pi_1',
      clientSecret: 'pi_1_secret_live',
      status: 'PAYMENT_REQUIRES_ACTION',
      currency: 'EUR',
      grandSubtotalCents: 10_000,
      grandShippingCents: 999,
      grandVatCents: 700,
      grandTotalCents: 11_699,
      sellerOrders: [],
    });

    const { container } = render(<Checkout />);
    await screen.findByDisplayValue('buyer@example.test');
    const inputs = container.querySelectorAll('input');
    fireEvent.change(inputs[0], { target: { value: 'Test' } });
    fireEvent.change(inputs[1], { target: { value: 'Buyer' } });
    fireEvent.change(inputs[3], { target: { value: 'Main Street 1' } });
    fireEvent.change(inputs[4], { target: { value: 'Berlin' } });
    fireEvent.change(inputs[5], { target: { value: '10115' } });
    fireEvent.click(inputs[6]);

    fireEvent.click(await screen.findByRole('button', { name: /Pay & Place Order/ }));

    await waitFor(() => {
      expect(mockCreateMarketplacePaymentIntent).toHaveBeenCalledWith(
        {
          items: [{ foodId: 'food-1', quantity: 1 }],
          destinationCountryIso2: 'DE',
          shippingAddress: 'Main Street 1, 10115 Berlin, DE',
        },
        expect.any(String),
        {
          grandSubtotalCents: 10_000,
          grandShippingCents: 999,
          grandVatCents: 700,
          grandTotalCents: 11_699,
        },
      );
    });
    expect(mockConfirmCardPayment).toHaveBeenCalledWith(
      'pi_1_secret_live',
      expect.any(Object),
    );
    expect(mockCreateLegacyOrder).not.toHaveBeenCalled();
    expect(await screen.findByText('Payment Submitted')).toBeInTheDocument();
  });
});
