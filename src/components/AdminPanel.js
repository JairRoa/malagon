import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { db, auth } from "../firebaseConfig";

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null); // Nuevo estado para almacenar el usuario logueado
  const navigate = useNavigate();

  // Función para obtener la lista de usuarios
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollection = collection(db, "users");
        const snapshot = await getDocs(usersCollection);
        const usersList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(usersList);
      } catch (error) {
        console.error("Error al obtener usuarios:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();

    // Obtener el usuario logueado
    const user = auth.currentUser;
    if (user) {
      setCurrentUser(user.displayName || user.email); // Usa displayName o email si no tienes displayName
    }
  }, []);

  // Función para manejar la navegación al componente AddUser
  const handleAddUser = () => {
    navigate("/add-user");
  };

  // Función para manejar la navegación al componente EditUser
  const handleModifyUser = (userId) => {
    navigate(`/edit-user/${userId}`);
  };

  // Función para manejar la navegación al componente ViewUser
  const handleViewUser = (userId) => {
    navigate(`/view-user/${userId}`);
  };

  // Función para eliminar un usuario
  const handleDeleteUser = async (userId) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
      try {
        await deleteDoc(doc(db, "users", userId));
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
        alert("Usuario eliminado exitosamente.");
      } catch (error) {
        console.error("Error al eliminar usuario:", error.message);
        alert("Error al eliminar el usuario.");
      }
    }
  };

  // Función para cerrar sesión
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Error al cerrar sesión:", error.message);
      alert("No se pudo cerrar la sesión. Inténtalo nuevamente.");
    }
  };

  if (loading) {
    return <p>Cargando usuarios...</p>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Bienvenido {currentUser || "Usuario"}</h1> {/* Mostrar el nombre del usuario logueado */}
      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={handleAddUser}
          style={{
            padding: "10px 20px",
            backgroundColor: "#4CAF50",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            borderRadius: "5px",
            marginRight: "10px",
          }}
        >
          Agregar Usuario
        </button>
        <button
          onClick={handleLogout}
          style={{
            padding: "10px 20px",
            backgroundColor: "#f44336",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            borderRadius: "5px",
          }}
        >
          Cerrar Sesión
        </button>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
        <thead>
          <tr style={{ backgroundColor: "#f2f2f2" }}>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Nombre</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Encargado</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Teléfono</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Rol</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Correo</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} style={{ textAlign: "center" }}>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                {user.role === "supplier" || user.role === "user" ? user.constructionName : user.manager}
              </td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>{user.manager}</td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>{user.managerPhone}</td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>{user.role}</td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>{user.email}</td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                <button
                  onClick={() => handleViewUser(user.id)}
                  style={{
                    padding: "5px 10px",
                    backgroundColor: "#008CBA",
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
    </div>
  );
};

export default AdminPanel;
