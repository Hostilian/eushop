import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import BecomeSeller from '../pages/become-seller';

describe('BecomeSeller Page', () => {
  it('renders become-seller page heading', () => {
    render(<BecomeSeller />);
    const heading = screen.getByRole('heading', { name: /become a seller/i });
    expect(heading).toBeInTheDocument();
  });

  it('renders all form input section texts', () => {
    render(<BecomeSeller />);
    expect(screen.getByText('Business Name')).toBeInTheDocument();
    expect(screen.getByText('Country')).toBeInTheDocument();
    expect(screen.getByText('Business Email')).toBeInTheDocument();
    expect(screen.getByText('Phone Number')).toBeInTheDocument();
    expect(screen.getByText('KYB & Tax Verification (DSA / DAC7 Compliance)')).toBeInTheDocument();
  });
});
