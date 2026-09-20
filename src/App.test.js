import { render, screen, waitFor } from '@testing-library/react';
import App from './App.jsx';

// Stub the API layer so tests don't touch the network.
jest.mock('./services/api', () => ({
  warmUpBackend: jest.fn(),
  apiBaseUrl: 'http://localhost:8080/api',
  authAPI: { login: jest.fn(), register: jest.fn(), me: jest.fn() },
  workflowAPI: { getAll: jest.fn().mockResolvedValue({ data: { data: [] } }) },
  runAPI: {},
  dlqAPI: {},
  healthAPI: { check: jest.fn() },
  default: {}
}));

beforeEach(() => {
  localStorage.clear();
  window.history.pushState({}, '', '/');
});

test('shows the login screen when the user is not authenticated', async () => {
  render(<App />);
  await waitFor(() => {
    expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
  });
  expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
});

test('shows the dashboard when a token is present', async () => {
  localStorage.setItem('flowToken', 'fake.jwt.token');
  localStorage.setItem(
    'flowUser',
    JSON.stringify({ userId: 'u1', name: 'Test User', email: 't@e.com' })
  );
  window.history.pushState({}, '', '/dashboard');

  render(<App />);
  await waitFor(() => {
    expect(screen.getByText(/welcome back, test/i)).toBeInTheDocument();
  });
});
