import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the Adonai Elevators homepage hero content', () => {
  render(<App />);

  expect(screen.getAllByText(/ADONAI ELEVATORS/i).length).toBeGreaterThan(0);
  expect(screen.getByText(/Premium Elevator Solutions/i)).toBeInTheDocument();
});
