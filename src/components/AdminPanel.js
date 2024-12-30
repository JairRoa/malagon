import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { db, auth } from "../firebaseConfig";
import Agenda from "./Agenda"; // Importa el componente de Agenda

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("usuarios"); // Nueva pestaña activa
  const navigate = useNavigate();

  // Obtener usuarios
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

    const user = auth.currentUser;
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  const handleAddUser = () => navigate("/add-user");
  const handleModifyUser = (userId) => navigate(`/edit-user/${userId}`);
  const handleViewUser = (userId) => navigate(`/view-user/${userId}`);
  const handleDeleteUser = async (userId) => {
    if (currentUser && currentUser.uid === userId) {
      alert("No puedes eliminar tu propia cuenta.");
      return;
    }

    if (window.confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
      try {
        await deleteDoc(doc(db, "users", userId));
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
        alert("Usuario eliminado exitosamente.");
      } catch (error) {
        console.error("Error al eliminar usuario:", error.message);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Error al cerrar sesión:", error.message);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Bienvenido {currentUser?.displayName || currentUser?.email || "Usuario"}</h1>

      {/* Navbar */}
      <nav style={navbarStyle}>
        <button style={navButtonStyle} onClick={() => setActiveTab("usuarios")}>
          Usuarios
        </button>
        <button style={navButtonStyle} onClick={() => setActiveTab("agenda")}>
          Agenda
        </button>
        <button style={navButtonStyle} onClick={() => setActiveTab("informes")}>
          Informes
        </button>
        <button style={logoutButtonStyle} onClick={handleLogout}>
          Cerrar Sesión
        </button>
      </nav>

      {/* TAB USUARIOS */}
      {activeTab === "usuarios" && (
        <section>
          <h2>Usuarios</h2>
          <button
            onClick={handleAddUser}
            style={{
              padding: "10px 20px",
              backgroundColor: "#4CAF50",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              borderRadius: "5px",
              marginBottom: "10px",
            }}
          >
            Agregar Usuario
          </button>

          {loading ? (
            <p>Cargando usuarios...</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#f2f2f2" }}>
                  <th style={tableHeaderStyle}>Nombre</th>
                  <th style={tableHeaderStyle}>Encargado</th>
                  <th style={tableHeaderStyle}>Teléfono</th>
                  <th style={tableHeaderStyle}>Rol</th>
                  <th style={tableHeaderStyle}>Correo</th>
                  <th style={tableHeaderStyle}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} style={{ textAlign: "center" }}>
                    <td style={tableCellStyle}>
                      {user.role === "supplier" || user.role === "user"
                        ? user.constructionName
                        : user.manager}
                    </td>
                    <td style={tableCellStyle}>{user.manager}</td>
                    <td style={tableCellStyle}>{user.managerPhone}</td>
                    <td style={tableCellStyle}>{user.role}</td>
                    <td style={tableCellStyle}>{user.email}</td>
                    <td style={tableCellStyle}>
                      <button onClick={() => handleViewUser(user.id)} style={actionButtonStyle}>
                        Ver
                      </button>
                      <button onClick={() => handleModifyUser(user.id)} style={actionButtonStyle}>
                        Modificar
                      </button>
                      <button onClick={() => handleDeleteUser(user.id)} style={deleteButtonStyle}>
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}

      {/* TAB AGENDA */}
      {activeTab === "agenda" && (
        <section>
          <h2>Agenda</h2>
          <Agenda />
        </section>
      )}

      {/* TAB INFORMES */}
      {activeTab === "informes" && (
        <section>
          <h2>Informes</h2>
          <p>Pendiente de implementación...</p>
        </section>
      )}
    </div>
  );
};

// Estilos
const navbarStyle = {
  display: "flex",
  justifyContent: "space-between",
  backgroundColor: "#007BFF",
  padding: "10px",
  borderRadius: "5px",
  marginBottom: "20px",
};

const navButtonStyle = {
  backgroundColor: "#fff",
  color: "#007BFF",
  padding: "10px 20px",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  fontWeight: "bold",
};

const logoutButtonStyle = {
  ...navButtonStyle,
  backgroundColor: "#f44336",
  color: "#fff",
};

const tableHeaderStyle = {
  border: "1px solid #ddd",
  padding: "8px",
  backgroundColor: "#f2f2f2",
};

const tableCellStyle = {
  border: "1px solid #ddd",
  padding: "8px",
};

const actionButtonStyle = {
  padding: "5px 10px",
  margin: "5px",
  backgroundColor: "#2196F3",
  color: "#fff",
  border: "none",
  cursor: "pointer",
  borderRadius: "5px",
};

const deleteButtonStyle = {
  ...actionButtonStyle,
  backgroundColor: "#f44336",
};

export default AdminPanel;
