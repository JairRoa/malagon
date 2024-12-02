import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";

const AdminPanel = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();

    // Escuchar cambios en el estado de autenticación
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser); // Establecer el usuario autenticado
      } else {
        navigate("/login"); // Redirigir al login si no está autenticado
      }
      setLoading(false); // Finalizar la carga
    });

    // Limpiar el listener al desmontar el componente
    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth); // Cerrar sesión
      navigate("/login"); // Redirigir al login
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const handleAddUserClick = () => {
    navigate("/add-user"); // Redirigir a la página de agregar usuario
  };

  const handleEditUserClick = () => {
    navigate("/edit-user"); // Redirigir a la página de editar usuario
  };

  if (loading) {
    return <p>Cargando...</p>; // Mostrar un mensaje mientras se verifica el estado de autenticación
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

