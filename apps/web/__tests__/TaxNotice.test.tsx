import React from 'react';
import { render, screen } from '@testing-library/react';
import { TaxNotice } from '../components/common/TaxNotice';

describe('TaxNotice Component (Task 68)', () => {
  it('renders full OSS destination tax calculation notice for Germany (DE)', () => {
    render(<TaxNotice destinationCountryIso2="DE" subtotalEur={100} />);
    expect(screen.getByTestId('tax-notice-full')).toBeInTheDocument();
    expect(screen.getByText(/7% VAT \(DE\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Germany/i)).toBeInTheDocument();
    expect(screen.getByText(/€7.00/i)).toBeInTheDocument();
  });

  it('renders compact tax notice when compact prop is true', () => {
    render(<TaxNotice destinationCountryIso2="FR" subtotalEur={50} compact />);
    expect(screen.getByTestId('tax-notice-compact')).toBeInTheDocument();
    expect(screen.getByText(/France OSS rate/i)).toBeInTheDocument();
  });
});
