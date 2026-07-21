import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { NoticeAndActionModal } from '../components/common/NoticeAndActionModal';

describe('DSA Art. 16 Notice and Action Modal (Task 85)', () => {
  it('renders modal when isOpen is true', () => {
    render(<NoticeAndActionModal isOpen={true} onClose={() => {}} />);
    expect(screen.getByText(/DSA Article 16 Illegal Content Notice/i)).toBeInTheDocument();
  });

  it('submits statutory notice form successfully', () => {
    render(<NoticeAndActionModal isOpen={true} onClose={() => {}} />);
    
    fireEvent.change(screen.getByPlaceholderText(/Consumer Protection Agency/i), { target: { value: 'Jan Inspector' } });
    fireEvent.change(screen.getByPlaceholderText(/reporter@example.eu/i), { target: { value: 'jan@gov.de' } });
    fireEvent.change(screen.getByPlaceholderText(/Explain why you consider the content/i), { target: { value: 'Missing wheat allergen warning.' } });
    
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    const submitBtn = screen.getByRole('button', { name: /Submit DSA Art. 16 Notice/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/Notice Submitted Successfully/i)).toBeInTheDocument();
  });
});
