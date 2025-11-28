import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import GeocodingSearch from '../../src/components/GeocodingSearch';
import { vi, describe, it, expect } from 'vitest';

// Mock fetch
global.fetch = vi.fn();

describe('GeocodingSearch', () => {
  it('renders search input', () => {
    render(<GeocodingSearch onLocationSelect={() => {}} />);
    expect(screen.getByPlaceholderText('Search location...')).toBeInTheDocument();
  });

  it('updates input value', () => {
    render(<GeocodingSearch onLocationSelect={() => {}} />);
    const input = screen.getByPlaceholderText('Search location...');
    fireEvent.change(input, { target: { value: 'Berlin' } });
    expect(input).toHaveValue('Berlin');
  });

  it('performs search and displays results', async () => {
    const mockResults = [
      {
        display_name: 'Berlin, Germany',
        lat: '52.52',
        lon: '13.405',
        boundingbox: ['52.3', '52.6', '13.2', '13.6'],
      },
    ];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global.fetch as any).mockResolvedValue({
      json: async () => mockResults,
    });

    render(<GeocodingSearch onLocationSelect={() => {}} />);
    const input = screen.getByPlaceholderText('Search location...');

    fireEvent.change(input, { target: { value: 'Berlin' } });
    fireEvent.keyPress(input, { key: 'Enter', code: 13, charCode: 13 });

    await waitFor(() => {
      expect(screen.getByText('Berlin')).toBeInTheDocument();
    });
  });

  it('calls onLocationSelect when result is clicked', async () => {
    const mockResults = [
      {
        display_name: 'Berlin, Germany',
        lat: '52.52',
        lon: '13.405',
        boundingbox: ['52.3', '52.6', '13.2', '13.6'],
      },
    ];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global.fetch as any).mockResolvedValue({
      json: async () => mockResults,
    });

    const onSelect = vi.fn();
    render(<GeocodingSearch onLocationSelect={onSelect} />);
    const input = screen.getByPlaceholderText('Search location...');

    fireEvent.change(input, { target: { value: 'Berlin' } });
    fireEvent.keyPress(input, { key: 'Enter', code: 13, charCode: 13 });

    await waitFor(() => {
      expect(screen.getByText('Berlin')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Berlin'));

    expect(onSelect).toHaveBeenCalledWith(52.52, 13.405, [52.3, 52.6, 13.2, 13.6]);
  });
});
