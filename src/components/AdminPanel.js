// src/components/AdminPanel.js

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebaseConfig"; // Ajusta la ruta si el archivo firebaseConfig.js está en otro directorio

const AdminPanel = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar el estado de autenticación
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser); // Si hay un usuario autenticado
      } else {
        navigate("/login"); // Si no hay usuario, redirigir al login
      }
      setLoading(false); // Finalizar carga
    });

    return () => unsubscribe(); // Limpiar el listener
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth); // Cerrar sesión
      navigate("/login"); // Redirigir a login
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const handleAddUserClick = () => {
    navigate("/add-user"); // Redirigir para agregar usuario
  };

  const handleEditUserClick = () => {
    navigate("/edit-user"); // Redirigir para editar usuario
  };

  if (loading) {
    return <p>Cargando...</p>; // Mostrar cargando mientras verificamos el estado de autenticación
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>Panel de Administración</h2>
      {user ? (
        <div>
          <p>
            Bienvenido, <strong>{user.displayName || user.email}</strong>!
          </p>
          <button onClick={handleLogout} style={{ marginBottom: "20px" }}>
            Cerrar sesión
          </button>
          <div>
            <button onClick={handleAddUserClick} style={{ marginRight: "10px" }}>
              Agregar Nuevo Usuario
            </button>
            <button onClick={handleEditUserClick}>Editar Usuarios</button>
          </div>
        </div>
      ) : (
        <p>No estás logueado. Por favor inicia sesión.</p>
      )}
    </div>
  );
};

export default AdminPanel;
