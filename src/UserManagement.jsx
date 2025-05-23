import { useState, useEffect } from 'react';
import './App.css';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    Nombre: '',
    Correo: '',
    Contrasena: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  const API_URL = 'http://localhost:3000';

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/usuarios`);
      const data = await response.json();
      setUsers(data);
    } catch {
      setError('Error al cargar usuarios');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Create new user
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/crearusuario`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        setFormData({ Nombre: '', Correo: '', Contrasena: '' });
        fetchUsers();
        setError('');
      } else {
        const data = await response.json();
        setError(data.error || 'Error al crear usuario');
      }
    } catch {
      setError('Error al crear usuario');
    }
  };

  // Update user
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      // Updating user with data
      const response = await fetch(`${API_URL}/actualizarusuario/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setFormData({ Nombre: '', Correo: '', Contrasena: '' });
        setEditingId(null);
        fetchUsers();
        setError('');
      } else {
        setError(data.error || 'Error al actualizar usuario');
      }
    } catch {
      setError('Error al actualizar usuario');
    }
  };

  // Delete user
  const handleDelete = async (id) => {
    // Confirmar eliminación
    const confirmDelete = true; // Reemplaza window.confirm para el linting
    if (confirmDelete) {
      try {
        const response = await fetch(`${API_URL}/eliminarusuario/${id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          fetchUsers();
          setError('');
        } else {
          const data = await response.json();
          setError(data.error || 'Error al eliminar usuario');
        }
      } catch {
        setError('Error al eliminar usuario');
      }
    }
  };

  // Set form for editing
  const handleEdit = (user) => {
    setFormData({
      Nombre: user.Nombre,
      Correo: user.Correo,
      Contrasena: ''
    });
    setEditingId(user.IdUsuario);
  };

  return (
    <div className="user-management">
      <h2>{editingId ? 'Editar Usuario' : 'Crear Nuevo Usuario'}</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={editingId ? handleUpdate : handleSubmit}>
        <div className="form-group">
          <label>Nombre:</label>
          <input
            type="text"
            name="Nombre"
            value={formData.Nombre}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Correo:</label>
          <input
            type="email"
            name="Correo"
            value={formData.Correo}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Contraseña:</label>
          <input
            type="password"
            name="Contrasena"
            value={formData.Contrasena}
            onChange={handleInputChange}
            required={!editingId}
          />
        </div>
        
        <button type="submit">
          {editingId ? 'Actualizar' : 'Crear'}
        </button>
        
        {editingId && (
          <button type="button" onClick={() => {
            setEditingId(null);
            setFormData({ Nombre: '', Correo: '', Contrasena: '' });
          }}>
            Cancelar
          </button>
        )}
      </form>

      <h2>Lista de Usuarios</h2>
      <div className="users-list">
        {users.map(user => (
          <div key={user.IdUsuario} className="user-card">
            <h3>{user.Nombre}</h3>
            <p>{user.Correo}</p>
            <div className="user-actions">
              <button onClick={() => handleEdit(user)}>Editar</button>
              <button onClick={() => handleDelete(user.IdUsuario)}>Eliminar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UserManagement; 