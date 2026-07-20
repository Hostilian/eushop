import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OcrScanner } from '../components/seller/OcrScanner';

describe('OcrScanner Component (Tasks 71 & 72)', () => {
  it('renders Vision AI Allergen & Ingredient Scanner container', () => {
    render(<OcrScanner />);
    expect(screen.getByTestId('ocr-scanner')).toBeInTheDocument();
    expect(screen.getByText(/Vision AI Allergen & Ingredient Scanner/i)).toBeInTheDocument();
  });

  it('runs demo OCR scan and extracts German cookie allergens correctly', async () => {
    const handleScan = jest.fn();
    render(<OcrScanner onScanComplete={handleScan} />);

    const cookieBtn = screen.getByText(/German Bakery Cookie Label/i);
    fireEvent.click(cookieBtn);

    await waitFor(() => {
      expect(screen.getByText(/Extracted Ingredient Text/i)).toBeInTheDocument();
    }, { timeout: 2000 });

    expect(screen.getByText(/Cereals containing gluten/i)).toBeInTheDocument();
    expect(screen.getByText(/Milk/i)).toBeInTheDocument();
    expect(screen.getByText(/Eggs/i)).toBeInTheDocument();
    expect(handleScan).toHaveBeenCalled();
  });
});
