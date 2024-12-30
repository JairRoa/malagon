import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import * as XLSX from "xlsx";
import Agenda from "./Agenda";

const AuditorDashboard = ({ loggedInUser }) => {
  const [activeTab, setActiveTab] = useState("usuarios");
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [taskForm, setTaskForm] = useState({
    id: null,
    title: "",
    date: "",
    description: "",
  });
  const navigate = useNavigate();

  // Redirigir a login si no hay usuario autenticado
  useEffect(() => {
    if (!loggedInUser) {
      console.error("El usuario no está autenticado.");
      navigate("/");
    }
  }, [loggedInUser, navigate]);

  // Cargar usuarios asignados
  useEffect(() => {
    const fetchAssignedUsers = async () => {
      try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("assignedAuditor", "==", loggedInUser.manager));
        const snapshot = await getDocs(q);
        const usersList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setAssignedUsers(usersList);
      } catch (error) {
        console.error("Error al cargar usuarios asignados:", error.message);
      }
    };

    fetchAssignedUsers();
  }, [loggedInUser]);

  // Redirigir al perfil de usuario
  const handleViewUser = (userId) => {
    navigate(`/view-user/${userId}`);
  };

  // Descargar Excel de usuarios asignados
  const handleDownloadUsersExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(assignedUsers);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "UsuariosAsignados");
    XLSX.writeFile(workbook, "Usuarios_Asignados.xlsx");
  };

  // Cerrar sesión
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Error al cerrar sesión:", error.message);
    }
  };

  // Agregar o editar tarea
  const handleAddOrUpdateTask = () => {
    if (!taskForm.title || !taskForm.date || !taskForm.description) {
      alert("Todos los campos son obligatorios.");
      return;
    }

    const newTask = { ...taskForm, id: taskForm.id || Date.now() };
    setTasks((prev) => {
      const updatedTasks = prev.filter((task) => task.id !== newTask.id);
      return [...updatedTasks, newTask];
    });

    setTaskForm({ id: null, title: "", date: "", description: "" });
  };

  // Eliminar tarea
  const handleDeleteTask = (taskId) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
  };

  // Editar tarea
  const handleEditTask = (task) => {
    setTaskForm(task);
  };

  // Obtener estado de tarea
  const getTaskStatus = (date) => {
    const today = new Date().toISOString().split("T")[0];
    if (date < today) return { text: "Vencida", color: "red" };
    if (date > today) return { text: "Pendiente", color: "green" };
    return { text: "Para Hoy", color: "orange" };
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
      <div style={headerStyle}>
  <h1 style={titleStyle}>Bienvenido {loggedInUser?.name || "Auditor"}</h1>
 
</div>

        <button style={logoutButtonStyle} onClick={handleLogout}>
          Cerrar Sesión
        </button>
      </div>
      <div style={navbarStyle}>
        <button style={tabStyle(activeTab === "usuarios")} onClick={() => setActiveTab("usuarios")}>
          Usuarios a Cargo
        </button>
        <button style={tabStyle(activeTab === "agenda")} onClick={() => setActiveTab("agenda")}>
          Agenda
        </button>
        <button style={tabStyle(activeTab === "tareas")} onClick={() => setActiveTab("tareas")}>
          Tareas Pendientes
        </button>
      </div>
      {activeTab === "usuarios" && (
  <div>
    <h2>Usuarios Asignados</h2>
    <button onClick={handleDownloadUsersExcel} style={btnDownloadStyle}>
      Descargar Lista de Usuarios (Excel)
    </button>
    <table style={tableStyle}>
      <thead>
        <tr>
          <th style={tableHeaderStyle}>Proyecto</th>
          <th style={tableHeaderStyle}>Constructora</th>
          <th style={tableHeaderStyle}>Encargado</th>
          <th style={tableHeaderStyle}>Teléfono</th>
          <th style={tableHeaderStyle}>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {assignedUsers.map((user) => (
          <tr key={user.id}>
            <td style={tableCellStyle}>{user.constructionName || user.manager}</td>
            <td style={tableCellStyle}>{user.constructor || "N/A"}</td>
            <td style={tableCellStyle}>{user.managerPhone}</td>
            <td style={tableCellStyle}>{user.manager || "N/A"}</td>
            <td style={tableCellStyle}>
              <button onClick={() => handleViewUser(user.id)} style={btnActionStyle}>
                Ver
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}

      {activeTab === "agenda" && (
        <div>
          <h2>Agenda</h2>
          <Agenda />
        </div>
      )}
      {activeTab === "tareas" && (
        <div>
          <h2>Tareas Pendientes</h2>
          <div style={formStyle}>
            <input
              type="text"
              placeholder="Título"
              value={taskForm.title}
              onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              style={inputStyle}
            />
            <input
              type="date"
              value={taskForm.date}
              onChange={(e) => setTaskForm({ ...taskForm, date: e.target.value })}
              style={inputStyle}
            />
            <textarea
              placeholder="Descripción"
              value={taskForm.description}
              onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
              style={textareaStyle}
            />
            <button onClick={handleAddOrUpdateTask} style={btnAddStyle}>
              {taskForm.id ? "Actualizar Tarea" : "Agregar Tarea"}
            </button>
          </div>
          <div style={taskGridStyle}>
            {tasks.map((task) => {
              const status = getTaskStatus(task.date);
              return (
                <div key={task.id} style={{ ...taskCardStyle, borderLeft: `5px solid ${status.color}` }}>
                  <div>
                    <strong>{task.title}</strong> ({task.date}) -{" "}
                    <span style={{ color: status.color }}>{status.text}</span>
                    <p>{task.description}</p>
                  </div>
                  <div style={taskActionsStyle}>
                    <button onClick={() => handleEditTask(task)} style={btnEditStyle}>
                      Editar
                    </button>
                    <button onClick={() => handleDeleteTask(task.id)} style={btnDeleteStyle}>
                      Eliminar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// Estilos
const containerStyle = { padding: "20px" };
const headerStyle = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" };
const titleStyle = { fontSize: "1.5rem" };
const logoutButtonStyle = { backgroundColor: "#d9534f", color: "#fff", padding: "10px 15px", borderRadius: "5px", border: "none", cursor: "pointer" };
const navbarStyle = { display: "flex", justifyContent: "center", marginBottom: "20px" };
const tabStyle = (isActive) => ({
  padding: "10px 20px",
  backgroundColor: isActive ? "#007bff" : "#e9ecef",
  color: isActive ? "#fff" : "#000",
  border: "none",
  borderRadius: "5px",
  margin: "0 5px",
  cursor: "pointer",
});
const tableStyle = { width: "100%", borderCollapse: "collapse" };
const tableHeaderStyle = { backgroundColor: "#007bff", color: "#fff", padding: "10px" };
const tableCellStyle = { padding: "10px", border: "1px solid #ddd" };
const btnActionStyle = { backgroundColor: "#28a745", color: "#fff", padding: "5px 10px", borderRadius: "5px", border: "none", cursor: "pointer" };
const btnDownloadStyle = { backgroundColor: "#17a2b8", color: "#fff", padding: "10px 15px", borderRadius: "5px", border: "none", cursor: "pointer", marginBottom: "10px" };
const formStyle = { display: "flex", flexDirection: "column", gap: "10px" };
const inputStyle = { padding: "10px", borderRadius: "5px", border: "1px solid #ddd" };
const textareaStyle = { padding: "10px", borderRadius: "5px", border: "1px solid #ddd", height: "100px" };
const btnAddStyle = { backgroundColor: "#007bff", color: "#fff", padding: "10px 15px", borderRadius: "5px", border: "none", cursor: "pointer" };
const taskGridStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "20px", marginTop: "20px" };
const taskCardStyle = { backgroundColor: "#f8f9fa", padding: "15px", borderRadius: "5px", boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)" };
const taskActionsStyle = { display: "flex", justifyContent: "space-between", marginTop: "10px" };
const btnEditStyle = { backgroundColor: "#ffc107", color: "#fff", padding: "5px 10px", borderRadius: "5px", border: "none", cursor: "pointer" };
const btnDeleteStyle = { backgroundColor: "#dc3545", color: "#fff", padding: "5px 10px", borderRadius: "5px", border: "none", cursor: "pointer" };

export default AuditorDashboard;
