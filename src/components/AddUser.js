import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addUser } from "../services/apiService"; // Importa el servicio del backend

const AddUser = () => {
  const navigate = useNavigate();

  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [constructionName, setConstructionName] = useState("");
  const [manager, setManager] = useState("");
  const [managerPhone, setManagerPhone] = useState("");
  const [constructor, setConstructor] = useState("");
  const [projectAddress, setProjectAddress] = useState("");
  const [assignedAuditor, setAssignedAuditor] = useState("");
  const [auditorPhone, setAuditorPhone] = useState("");
  const [startDate, setStartDate] = useState("");
  const [tentativeEndDate, setTentativeEndDate] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (password !== confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }
  
    if (!role || !email || !password) {
      alert("Todos los campos obligatorios deben ser llenados");
      return;
    }
  
    const userData = {
      role: role.toLowerCase(),
      email,
      password,
      constructionName: constructionName || undefined, // Asegurar que no se envíe como `null`
      manager: manager || undefined,
      managerPhone: managerPhone || undefined,
      constructor: constructor || undefined,
      projectAddress: projectAddress || undefined,
      assignedAuditor: assignedAuditor || undefined,
      auditorPhone: auditorPhone || undefined,
      startDate: startDate || undefined,
      tentativeEndDate: tentativeEndDate || undefined,
    };
  
    try {
      await addUser(userData); // Llama al servicio para interactuar con el backend
      alert(`Usuario con rol "${role.toLowerCase()}" creado con éxito`);
      navigate("/admin"); // Redirige al panel de administración
    } catch (error) {
      console.error("Error al crear el usuario:", error.message);
      alert(error.response?.data.error || "Hubo un error al crear el usuario. Revisa la consola.");
    }
  };
  

  const handleBack = () => {
    navigate("/admin"); // Redirige a la página principal
  };

  const styles = {
    input: {
      padding: "10px",
      margin: "5px",
      width: "100%",
      boxSizing: "border-box",
      fontSize: "16px",
    },
    button: {
      padding: "15px",
      backgroundColor: "#007BFF",
      color: "white",
      fontWeight: "bold",
      fontSize: "18px",
      border: "none",
      cursor: "pointer",
      width: "100%",
      marginTop: "10px",
    },
    backButton: {
      padding: "10px",
      backgroundColor: "#6c757d",
      color: "white",
      fontWeight: "bold",
      fontSize: "14px",
      border: "none",
      cursor: "pointer",
      display: "block",
      margin: "20px auto",
      textAlign: "center",
      width: "100px",
    },
    formContainer: {
      maxWidth: "500px",
      margin: "20px auto",
      padding: "20px",
      border: "1px solid #ccc",
      borderRadius: "8px",
      backgroundColor: "#f9f9f9",
      boxShadow: "0 0 10px rgba(0,0,0,0.1)",
    },
    title: {
      textAlign: "center",
      color: "#333",
      fontWeight: "bold",
    },
  };

  return (
    <>
      <div style={styles.formContainer}>
        <h1 style={styles.title}>Formulario para Añadir Usuario</h1>
        <form onSubmit={handleSubmit}>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={styles.input}
          >
            <option value="">Selecciona un Rol</option>
            <option value="Supplier">Proveedor</option>
            <option value="Admin">Administrador</option>
            <option value="Account">Contador</option>
            <option value="Auditor">Auditor</option>
            <option value="User">Proyecto</option>
          </select>
          {role && (
            <>
              <input
                type="email"
                placeholder="Correo Electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
              />
              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
              />
              <input
                type="password"
                placeholder="Confirmar Contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={styles.input}
              />
            </>
          )}
          {role === "Supplier" && (
            <>
              <input
                placeholder="Nombre"
                value={constructionName}
                onChange={(e) => setConstructionName(e.target.value)}
                style={styles.input}
              />
              <input
                placeholder="Encargado"
                value={manager}
                onChange={(e) => setManager(e.target.value)}
                style={styles.input}
              />
              <input
                placeholder="Teléfono"
                value={managerPhone}
                onChange={(e) => setManagerPhone(e.target.value)}
                style={styles.input}
              />
            </>
          )}
          {role === "Admin" && (
            <>
              <input
                placeholder="Nombre"
                value={manager}
                onChange={(e) => setManager(e.target.value)}
                style={styles.input}
              />
              <input
                placeholder="Teléfono"
                value={managerPhone}
                onChange={(e) => setManagerPhone(e.target.value)}
                style={styles.input}
              />
            </>
          )}
          {role === "Account" && (
            <>
              <input
                placeholder="Nombre"
                value={manager}
                onChange={(e) => setManager(e.target.value)}
                style={styles.input}
              />
              <input
                placeholder="Teléfono"
                value={managerPhone}
                onChange={(e) => setManagerPhone(e.target.value)}
                style={styles.input}
              />
            </>
          )}
          {role === "Auditor" && (
            <>
              <input
                placeholder="Nombre"
                value={manager}
                onChange={(e) => setManager(e.target.value)}
                style={styles.input}
              />
              <input
                placeholder="Teléfono"
                value={managerPhone}
                onChange={(e) => setManagerPhone(e.target.value)}
                style={styles.input}
              />
            </>
          )}
          {role === "User" && (
            <>
              <input
                placeholder="Nombre de Construcción"
                value={constructionName}
                onChange={(e) => setConstructionName(e.target.value)}
                style={styles.input}
              />
              <input
                placeholder="Encargado"
                value={manager}
                onChange={(e) => setManager(e.target.value)}
                style={styles.input}
              />
              <input
                placeholder="Teléfono"
                value={managerPhone}
                onChange={(e) => setManagerPhone(e.target.value)}
                style={styles.input}
              />
              <input
                placeholder="Constructora"
                value={constructor}
                onChange={(e) => setConstructor(e.target.value)}
                style={styles.input}
              />
              <input
                placeholder="Dirección del Proyecto"
                value={projectAddress}
                onChange={(e) => setProjectAddress(e.target.value)}
                style={styles.input}
              />
              <input
                placeholder="Auditor Asignado"
                value={assignedAuditor}
                onChange={(e) => setAssignedAuditor(e.target.value)}
                style={styles.input}
              />
              <input
                placeholder="Teléfono del Auditor"
                value={auditorPhone}
                onChange={(e) => setAuditorPhone(e.target.value)}
                style={styles.input}
              />
              <input
                type="date"
                placeholder="Fecha de Inicio"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={styles.input}
              />
              <input
                type="date"
                placeholder="Fecha Tentativa de Fin"
                value={tentativeEndDate}
                onChange={(e) => setTentativeEndDate(e.target.value)}
                style={styles.input}
              />
            </>
          )}
          <button type="submit" style={styles.button}>
            Añadir Usuario
          </button>
        </form>
      </div>
      <button type="button" style={styles.backButton} onClick={handleBack}>
        Regresar
      </button>
    </>
  );
};

export default AddUser;
