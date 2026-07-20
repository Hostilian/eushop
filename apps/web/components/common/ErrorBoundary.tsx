import Link from 'next/link';
import React, { Component, type ErrorInfo, type ReactNode } from 'react';

export type ErrorRegion =
  | 'navigation'
  | 'marketplace'
  | 'product-details'
  | 'cart'
  | 'seller-onboarding'
  | 'account-controls'
  | 'page';

interface ErrorBoundaryProps {
  children: ReactNode;
  region?: ErrorRegion;
  resetKey?: string;
  compact?: boolean;
  onRetry?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

const REGION_COPY: Record<ErrorRegion, { title: string; detail: string }> = {
  navigation: {
    title: 'Navigation is temporarily unavailable',
    detail: 'The marketplace content below is still available.',
  },
  marketplace: {
    title: 'The marketplace could not be displayed',
    detail: 'Retry this region or open the bundled demonstration catalogue.',
  },
  'product-details': {
    title: 'Product details are temporarily unavailable',
    detail: 'No cart changes were made. You can retry or return to the marketplace.',
  },
  cart: {
    title: 'Your cart could not be displayed',
    detail: 'Retry this region. Locally saved items have not been removed.',
  },
  'seller-onboarding': {
    title: 'Seller onboarding is temporarily unavailable',
    detail: 'Retry this region. This message does not confirm that an application was submitted.',
  },
  'account-controls': {
    title: 'Account controls are temporarily unavailable',
    detail: 'No account change was completed by this failed view.',
  },
  page: {
    title: 'This page encountered an unexpected problem',
    detail: 'Retry the page region or continue with the marketplace catalogue.',
  },
};

/**
 * Contains render failures to one user-experience region.
 * Raw errors are deliberately neither persisted nor rendered because they can
 * include identifiers or provider details.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo): void {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[EUshop] Render failure contained in ${this.props.region ?? 'page'} region.`);
    }
  }

  componentDidUpdate(previousProps: ErrorBoundaryProps): void {
    if (this.state.hasError && previousProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false });
    }
  }

  private retry = (): void => {
    this.setState({ hasError: false });
    this.props.onRetry?.();
  };

  render(): ReactNode {
    if (!this.state.hasError) return this.props.children;

    const region = this.props.region ?? 'page';
    const copy = REGION_COPY[region];

    return (
      <section
        role="alert"
        aria-live="assertive"
        className={[
          'w-full rounded-2xl border border-amber-300 bg-amber-50 text-amber-950',
          'dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-50',
          this.props.compact ? 'px-4 py-3' : 'mx-auto my-6 max-w-3xl p-6 sm:p-8',
        ].join(' ')}
        data-error-region={region}
      >
        <h2 className={this.props.compact ? 'text-sm font-bold' : 'text-xl font-extrabold'}>
          {copy.title}
        </h2>
        <p className="mt-1 text-sm leading-6">{copy.detail}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={this.retry}
            className="rounded-lg bg-brand-green px-4 py-2 text-sm font-bold text-white outline-none hover:opacity-90 focus-visible:ring-2 focus-visible:ring-brand-green focus-visible:ring-offset-2"
          >
            Retry
          </button>
          <Link
            href="/search?catalogue=demo"
            className="rounded-lg border border-amber-600 bg-white px-4 py-2 text-sm font-bold text-amber-950 outline-none hover:bg-amber-100 focus-visible:ring-2 focus-visible:ring-amber-700 focus-visible:ring-offset-2 dark:bg-amber-950 dark:text-amber-50"
          >
            Load Demo Catalogue
          </Link>
          <Link
            href="/search"
            className="rounded-lg px-4 py-2 text-sm font-bold underline underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-amber-700"
          >
            Back to Marketplace
          </Link>
        </div>
      </section>
    );
  }
}

export default ErrorBoundary;
