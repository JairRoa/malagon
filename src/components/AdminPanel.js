// AdminPanel.js
import React from 'react';
import { useNavigate } from 'react-router-dom';  // Importamos useNavigate para la redirección
import { useAuth } from '../AuthContext'; // Importamos el contexto de autenticación

const AdminPanel = () => {
  const { user, logout } = useAuth(); // Obtenemos el usuario y la función logout
  const navigate = useNavigate(); // Función para navegar a otras rutas

  const handleAddUserClick = () => {
    navigate('/add-user'); // Redirigir al formulario de agregar usuario
  };

  return (
    <div>
      <h2>Panel de Administración</h2>
      {user ? (
        <div>
          <p>Bienvenido, {user.username}!</p> {/* Aquí mostramos el nombre de usuario */}
          <button onClick={logout}>Cerrar sesión</button>

          <div>
            {/* Botón para redirigir a la página de agregar usuario */}
            <button onClick={handleAddUserClick}>Agregar Nuevo Usuario</button>
          </div>
        </div>
      ) : (
        <p>No estás logueado</p>
      )}
    </div>
  );
};

export default AdminPanel;

