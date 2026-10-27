import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Home from './page';

describe('Home', () => {
  it('renders correctly', () => {
    render(<Home />);
    expect(screen.getByText('MediSade')).toBeDefined();
  });
});
