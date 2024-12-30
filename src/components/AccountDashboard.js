import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { db, auth } from "../firebaseConfig";
import * as XLSX from "xlsx";
import Agenda from "./Agenda";

const AccountDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("usuarios");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollection = collection(db, "users");
        const snapshot = await getDocs(usersCollection);
        const usersList = snapshot.docs
          .map((doc) => ({ ...doc.data() }))
          .filter((user) =>
            ["auditor", "user", "supplier"].includes(user.role?.toLowerCase())
          ); // Filter users by roles
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

  const handleDownloadUsersExcel = () => {
    const formattedData = users.map((user) => ({
      Role: user.role || "N/A",
      Email: user.email || "N/A",
      ConstructionName: user.constructionName || "N/A",
      Constructor: user.constructor || "N/A",
      Manager: user.manager || "N/A",
      ManagerPhone: user.managerPhone || "N/A",
      ProjectAddress: user.projectAddress || "N/A",
      AssignedAuditor: user.assignedAuditor || "N/A",
      AuditorPhone: user.auditorPhone || "N/A",
      StartDate: user.startDate || "N/A",
      TentativeEndDate: user.tentativeEndDate || "N/A",
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Usuarios");
    XLSX.writeFile(workbook, "Lista_Usuarios.xlsx");
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
            onClick={handleDownloadUsersExcel}
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
            Descargar Lista de Usuarios (Excel)
          </button>

          {loading ? (
            <p>Cargando usuarios...</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#f2f2f2" }}>
                  <th style={tableHeaderStyle}>Rol</th>
                  <th style={tableHeaderStyle}>Correo</th>
                  <th style={tableHeaderStyle}>Encargado</th>
                  <th style={tableHeaderStyle}>Teléfono</th>
                  <th style={tableHeaderStyle}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr key={index} style={{ textAlign: "center" }}>
                    <td style={tableCellStyle}>{user.role || "N/A"}</td>
                    <td style={tableCellStyle}>{user.email || "N/A"}</td>
                    <td style={tableCellStyle}>{user.manager || "N/A"}</td>
                    <td style={tableCellStyle}>{user.managerPhone || "N/A"}</td>
                    <td style={tableCellStyle}>
                      <button
                        onClick={() => navigate(`/view-user/${user.uid}`)}
                        style={actionButtonStyle}
                      >
                        Ver
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

export default AccountDashboard;
