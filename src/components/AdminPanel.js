import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../firebaseConfig";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore"; // Importar 'deleteDoc' y 'doc'

const AdminPanel = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]); // Usado para listar usuarios
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchUsers();
      } else {
        navigate("/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      const usersCollection = collection(db, "users");
      const snapshot = await getDocs(usersCollection);
      const userList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(userList);
    } catch (error) {
      console.error("Error al cargar usuarios:", error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const handleDeleteUser = async (userId) => {
    const adminPassword = window.prompt(
      "Por favor, confirma la eliminación del usuario ingresando tu contraseña de administrador:",
      ""
    );

    if (!adminPassword) {
      alert("La contraseña es obligatoria para eliminar un usuario.");
      return;
    }

    try {
      if (adminPassword === "admin_password") {
        // Elimina el usuario de Firestore
        const userDocRef = doc(db, "users", userId);
        await deleteDoc(userDocRef);
        alert("Usuario eliminado con éxito.");
        fetchUsers(); // Actualiza la lista de usuarios
      } else {
        alert("Contraseña incorrecta. No se puede eliminar al usuario.");
      }
    } catch (error) {
      console.error("Error al eliminar usuario:", error.message);
    }
  };

  const handleViewUser = (userId) => {
    // Lógica para ver los detalles del usuario
    alert(`Ver detalles del usuario con ID: ${userId}`);
  };

  const handleModifyUser = (userId) => {
    // Lógica para modificar los detalles del usuario
    alert(`Modificar detalles del usuario con ID: ${userId}`);
  };

  const handleAddUser = () => {
    // Redirige al formulario de agregar nuevo usuario
    navigate("/add-user");
  };

  if (loading) {
    return <p>Cargando...</p>;
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

          {/* Botón para agregar nuevo usuario */}
          <button
            onClick={handleAddUser}
            style={{
              padding: "10px 20px",
              backgroundColor: "#4CAF50",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              borderRadius: "5px",
              marginBottom: "20px",
            }}
          >
            Agregar Nuevo Usuario
          </button>

          <h3>Lista de Usuarios</h3>
          {users.length > 0 ? (
            <table
              border="1"
              cellPadding="10"
              style={{
                width: "100%",
                marginTop: "20px",
                borderCollapse: "collapse",
                border: "1px solid #ddd",
              }}
            >
              <thead>
                <tr style={{ backgroundColor: "#f2f2f2" }}>
                  <th style={{ textAlign: "left", padding: "10px" }}>Nombre</th>
                  <th style={{ textAlign: "left", padding: "10px" }}>Encargado</th>
                  <th style={{ textAlign: "left", padding: "10px" }}>Teléfono</th>
                  <th style={{ textAlign: "left", padding: "10px" }}>Rol</th>
                  <th style={{ textAlign: "left", padding: "10px" }}>Correo</th>
                  <th style={{ textAlign: "center", padding: "10px" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    {/* Nombre Condicional según el rol */}
                    <td style={{ padding: "8px", textAlign: "left" }}>
                      {user.role === "usuario"
                        ? user.constructionName
                        : user.manager}
                    </td>
                    {/* Encargado Condicional según el rol */}
                    <td style={{ padding: "8px", textAlign: "left" }}>
                      {user.role === "usuario" ? user.manager : "N/A"}
                    </td>
                    {/* Teléfono: para todos los roles se muestra managerPhone */}
                    <td style={{ padding: "8px", textAlign: "left" }}>
                      {user.managerPhone}
                    </td>
                    <td style={{ padding: "8px", textAlign: "left" }}>
                      {user.role}
                    </td>
                    <td style={{ padding: "8px", textAlign: "left" }}>
                      {user.email}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <button
                        onClick={() => handleViewUser(user.id)}
                        style={{
                          padding: "5px 10px",
                          backgroundColor: "#4CAF50",
                          color: "#fff",
                          border: "none",
                          cursor: "pointer",
                          borderRadius: "5px",
                          margin: "5px",
                        }}
                      >
                        Ver
                      </button>
                      <button
                        onClick={() => handleModifyUser(user.id)}
                        style={{
                          padding: "5px 10px",
                          backgroundColor: "#2196F3",
                          color: "#fff",
                          border: "none",
                          cursor: "pointer",
                          borderRadius: "5px",
                          margin: "5px",
                        }}
                      >
                        Modificar
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        style={{
                          padding: "5px 10px",
                          backgroundColor: "#f44336",
                          color: "#fff",
                          border: "none",
                          cursor: "pointer",
                          borderRadius: "5px",
                          margin: "5px",
                        }}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No se encontraron usuarios.</p>
          )}
        </div>
      ) : (
        <p>No estás logueado. Por favor inicia sesión.</p>
      )}
    </div>
  );
};

export default AdminPanel;
