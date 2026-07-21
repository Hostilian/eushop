import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DisputesPage from '../pages/disputes';

describe('DSA Art. 20 Dispute Portal Page (Task 79)', () => {
  it('renders DSA Art. 20 Complaint-Handling & Dispute Portal heading', () => {
    render(<DisputesPage />);
    expect(screen.getByText(/Internal Complaint & Out-of-Court Dispute Portal/i)).toBeInTheDocument();
    expect(screen.getByText(/DSA-DISP-2026-081/i)).toBeInTheDocument();
  });

  it('opens new complaint modal when button is clicked', () => {
    render(<DisputesPage />);
    const button = screen.getByText(/\+ Submit New DSA Complaint/i);
    fireEvent.click(button);
    expect(screen.getByText(/Submit Statutory DSA Complaint/i)).toBeInTheDocument();
  });
});
