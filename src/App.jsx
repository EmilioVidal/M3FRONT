import { useState, useEffect } from 'react'

import './App.css'
import UserManagement from './UserManagement'
import Login from './Login'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [usuario, setUsuario] = useState(null);

  // Verificar si hay un usuario en localStorage al cargar la aplicación
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('usuario');
    
    if (token && storedUser) {
      try {
        setUsuario(JSON.parse(storedUser));
        setIsLoggedIn(true);
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
      }
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setUsuario(userData);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null);
    setIsLoggedIn(false);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Gestión de Usuarios</h1>
        {isLoggedIn && (
          <div className="user-info">
            <span>Bienvenido, {usuario?.nombre}</span>
            <button onClick={handleLogout} className="btn-logout">Cerrar Sesión</button>
          </div>
        )}
      </header>
      <main>
        {isLoggedIn ? (
          <UserManagement />
        ) : (
          <Login onLoginSuccess={handleLoginSuccess} />
        )}
      </main>
    </div>
  )
}

export default App
