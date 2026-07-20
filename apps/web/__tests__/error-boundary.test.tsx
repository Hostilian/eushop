import { fireEvent, render, screen } from '@testing-library/react';
import ErrorBoundary from '../components/common/ErrorBoundary';

describe('ErrorBoundary', () => {
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;

  beforeEach(() => {
    console.error = jest.fn();
    console.warn = jest.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
  });

  it('contains a region failure and exposes all recovery actions', () => {
    const BrokenRegion = () => { throw new Error('private provider detail'); };

    render(
      <ErrorBoundary region="cart">
        <BrokenRegion />
      </ErrorBoundary>,
    );

    expect(screen.getByRole('alert')).toHaveAttribute('data-error-region', 'cart');
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Load Demo Catalogue' }))
      .toHaveAttribute('href', '/search?catalogue=demo');
    expect(screen.getByRole('link', { name: 'Back to Marketplace' }))
      .toHaveAttribute('href', '/search');
    expect(screen.queryByText('private provider detail')).not.toBeInTheDocument();
  });

  it('rerenders the protected region when Retry is selected', () => {
    let shouldThrow = true;
    const Region = () => {
      if (shouldThrow) throw new Error('failed');
      return <p>Recovered content</p>;
    };

    render(
      <ErrorBoundary region="marketplace">
        <Region />
      </ErrorBoundary>,
    );

    shouldThrow = false;
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(screen.getByText('Recovered content')).toBeInTheDocument();
  });

  it('automatically resets after navigation changes the reset key', () => {
    const BrokenRegion = () => { throw new Error('failed'); };
    const { rerender } = render(
      <ErrorBoundary region="product-details" resetKey="/food/1">
        <BrokenRegion />
      </ErrorBoundary>,
    );

    rerender(
      <ErrorBoundary region="product-details" resetKey="/food/2">
        <p>Next product</p>
      </ErrorBoundary>,
    );

    expect(screen.getByText('Next product')).toBeInTheDocument();
  });
});
