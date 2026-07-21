import React from 'react';
import { render, screen } from '@testing-library/react';
import { AllergenWarning } from '../components/ui/AllergenWarning';

describe('AllergenWarning Component (Task 77)', () => {
  it('renders green safe badge when no allergens present', () => {
    render(<AllergenWarning allergens={[]} />);
    expect(screen.getByText(/No EU Annex II Allergens Contained/i)).toBeInTheDocument();
  });

  it('renders translated allergen warning tags for German locale', () => {
    render(<AllergenWarning allergens={['Milk', 'Eggs']} locale="de" />);
    expect(screen.getByTestId('allergen-warning-full')).toBeInTheDocument();
    expect(screen.getByText(/Milch/i)).toBeInTheDocument();
    expect(screen.getByText(/Eier/i)).toBeInTheDocument();
  });
});
