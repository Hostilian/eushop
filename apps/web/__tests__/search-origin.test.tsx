import { act, render, screen } from '@testing-library/react';
import SearchPage from '../pages/search';
import { foodAPI } from '../lib/services';

jest.mock('../components/layout/PageWrapper', () => ({
  PageWrapper: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
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

jest.mock('../lib/services', () => ({
  foodAPI: { searchWithOrigin: jest.fn() },
}));

describe('marketplace catalogue origin', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.mocked(foodAPI.searchWithOrigin).mockResolvedValue({
      data: [{
        id: 'demo-1',
        name: 'Demo Food',
        country: 'Belgium',
        price: 5,
        description: 'Illustrative food',
        sellerId: 'demo-seller',
        isDemo: true,
      }],
      origin: 'demo',
      degraded: true,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('labels demo results instead of presenting them as live inventory', async () => {
    render(<SearchPage />);

    await act(async () => {
      jest.advanceTimersByTime(400);
      await Promise.resolve();
    });

    expect(await screen.findByRole('status')).toHaveTextContent('Demonstration catalogue');
    expect(screen.getByRole('status')).toHaveTextContent('Illustrative products, prices, traders, and label data');
  });
});
