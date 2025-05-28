import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Login from '../Login';

// Mock fetch
global.fetch = jest.fn();

describe('Login Component', () => {
  const mockOnLoginSuccess = jest.fn();

  beforeEach(() => {
    fetch.mockClear();
    mockOnLoginSuccess.mockClear();
    localStorage.clear();
  });

  test('renders login form', () => {
    render(<Login onLoginSuccess={mockOnLoginSuccess} />);
    
    expect(screen.getByRole('heading', { name: 'Iniciar Sesión' })).toBeInTheDocument();
    expect(screen.getByLabelText('Correo')).toBeInTheDocument();
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Iniciar Sesión' })).toBeInTheDocument();
  });

  test('shows error when only email is provided', async () => {
    const user = userEvent.setup();
    render(<Login onLoginSuccess={mockOnLoginSuccess} />);
    
    // Solo llenar el correo, dejar contraseña vacía
    await user.type(screen.getByLabelText('Correo'), 'test@test.com');
    
    // Usar fireEvent.submit para evitar la validación HTML
    const form = screen.getByLabelText('Correo').closest('form');
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(screen.getByText('Por favor ingrese correo y contraseña')).toBeInTheDocument();
    });
  });

  test('submits form with valid credentials', async () => {
    const user = userEvent.setup();
    const mockResponse = {
      usuario: { id: 1, nombre: 'Test User', correo: 'test@test.com' },
      token: 'fake-token'
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    render(<Login onLoginSuccess={mockOnLoginSuccess} />);
    
    await user.type(screen.getByLabelText('Correo'), 'test@test.com');
    await user.type(screen.getByLabelText('Contraseña'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Iniciar Sesión' }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          Correo: 'test@test.com',
          Contrasena: 'password123'
        })
      });
    });

    expect(mockOnLoginSuccess).toHaveBeenCalledWith(mockResponse.usuario);
  });

  test('shows error on failed login', async () => {
    const user = userEvent.setup();
    
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Credenciales inválidas' }),
    });

    render(<Login onLoginSuccess={mockOnLoginSuccess} />);
    
    await user.type(screen.getByLabelText('Correo'), 'test@test.com');
    await user.type(screen.getByLabelText('Contraseña'), 'wrongpassword');
    await user.click(screen.getByRole('button', { name: 'Iniciar Sesión' }));

    await waitFor(() => {
      expect(screen.getByText('Credenciales inválidas')).toBeInTheDocument();
    });

    expect(mockOnLoginSuccess).not.toHaveBeenCalled();
  });

  test('shows loading state during submission', async () => {
    const user = userEvent.setup();
    
    // Mock a delayed response
    fetch.mockImplementationOnce(() => 
      new Promise(resolve => 
        setTimeout(() => resolve({
          ok: true,
          json: async () => ({ usuario: {}, token: 'token' })
        }), 100)
      )
    );

    render(<Login onLoginSuccess={mockOnLoginSuccess} />);
    
    await user.type(screen.getByLabelText('Correo'), 'test@test.com');
    await user.type(screen.getByLabelText('Contraseña'), 'password123');
    
    const submitButton = screen.getByRole('button', { name: 'Iniciar Sesión' });
    await user.click(submitButton);

    // Check loading state
    expect(screen.getByRole('button', { name: 'Iniciando sesión...' })).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });
}); 