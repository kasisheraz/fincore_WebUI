import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Routes: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Route: ({ element }: { element: React.ReactNode }) => <div>{element}</div>,
  Navigate: () => <div>Navigate</div>,
  Outlet: () => <div>Outlet</div>,
  useNavigate: () => jest.fn(),
}));

test('renders FinCore application', () => {
  render(
    <AuthProvider>
      <App />
    </AuthProvider>
  );
  const headingElement = screen.getByRole('heading', { name: /FinCore/i });
  expect(headingElement).toBeInTheDocument();
});