import { render, screen, fireEvent } from '@testing-library/react';

import App from '../App';

// Mock de los componentes hijos
jest.mock('../Login', () => {
  return function MockLogin({ onLoginSuccess }) {
    return (
      <div data-testid="login-component">
        <button onClick={() => onLoginSuccess({ nombre: 'Test User' })}>
          Mock Login
        </button>
      </div>
    );
  };
});

jest.mock('../UserManagement', () => {
  return function MockUserManagement() {
    return <div data-testid="user-management-component">User Management</div>;
  };
});

describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('renders login component when not logged in', () => {
    render(<App />);
    
    expect(screen.getByText('Gestión de Usuarios')).toBeInTheDocument();
    expect(screen.getByTestId('login-component')).toBeInTheDocument();
    expect(screen.queryByTestId('user-management-component')).not.toBeInTheDocument();
  });

  test('renders user management when logged in', () => {
    // Simular usuario logueado en localStorage
    localStorage.setItem('token', 'fake-token');
    localStorage.setItem('usuario', JSON.stringify({ nombre: 'Test User' }));
    
    render(<App />);
    
    expect(screen.getByTestId('user-management-component')).toBeInTheDocument();
    expect(screen.queryByTestId('login-component')).not.toBeInTheDocument();
    expect(screen.getByText('Bienvenido, Test User')).toBeInTheDocument();
  });

  test('switches to user management after successful login', () => {
    render(<App />);
    
    // Inicialmente muestra login
    expect(screen.getByTestId('login-component')).toBeInTheDocument();
    
    // Simular login exitoso
    fireEvent.click(screen.getByText('Mock Login'));
    
    // Ahora debe mostrar user management
    expect(screen.getByTestId('user-management-component')).toBeInTheDocument();
    expect(screen.queryByTestId('login-component')).not.toBeInTheDocument();
    expect(screen.getByText('Bienvenido, Test User')).toBeInTheDocument();
  });

  test('logs out user when logout button is clicked', () => {
    // Simular usuario logueado
    localStorage.setItem('token', 'fake-token');
    localStorage.setItem('usuario', JSON.stringify({ nombre: 'Test User' }));
    
    render(<App />);
    
    // Verificar que está logueado
    expect(screen.getByText('Bienvenido, Test User')).toBeInTheDocument();
    
    // Hacer logout
    fireEvent.click(screen.getByText('Cerrar Sesión'));
    
    // Verificar que se muestra login nuevamente
    expect(screen.getByTestId('login-component')).toBeInTheDocument();
    expect(screen.queryByTestId('user-management-component')).not.toBeInTheDocument();
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('usuario')).toBeNull();
  });

  test('handles corrupted localStorage data gracefully', () => {
    // Simular datos corruptos en localStorage
    localStorage.setItem('token', 'fake-token');
    localStorage.setItem('usuario', 'invalid-json');
    
    render(<App />);
    
    // Debe mostrar login y limpiar localStorage
    expect(screen.getByTestId('login-component')).toBeInTheDocument();
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('usuario')).toBeNull();
  });
}); 