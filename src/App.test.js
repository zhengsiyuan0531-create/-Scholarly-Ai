import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Scholara AI platform', () => {
  render(<App />);
  const headingElement = screen.getByText(/Academic AI Platform/i);
  expect(headingElement).toBeInTheDocument();
});
