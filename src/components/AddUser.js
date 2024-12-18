import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { getApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

const db = getFirestore(getApp());
const newUserAuth = getAuth(getApp());

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
      role: role.toLowerCase(), // Convertir el rol a minúsculas
      email,
      constructionName,
      manager,
      managerPhone,
      constructor,
      projectAddress,
      assignedAuditor,
      auditorPhone,
      startDate,
      tentativeEndDate,
    };
  
    try {
      // Crear nuevo usuario sin cambiar el estado del administrador actual
      const currentUser = newUserAuth.currentUser;
  
      const userCredential = await createUserWithEmailAndPassword(
        newUserAuth,
        email,
        password
      );
      const uid = userCredential.user.uid;
  
      await setDoc(doc(db, "users", uid), userData);
  
      alert(`Usuario con rol "${role.toLowerCase()}" creado con éxito`);
  
      // Restaurar el login del administrador y redirigir al panel
      if (currentUser) {
        await newUserAuth.updateCurrentUser(currentUser);
      }
      navigate("/admin");
    } catch (error) {
      console.error("Error al crear el usuario:", error.message);
      alert("Hubo un error al crear el usuario. Revisa la consola.");
    }
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
    <div style={styles.formContainer}>
      <h1 style={styles.title}>Formulario para Añadir Usuario</h1>
      <form onSubmit={handleSubmit}>
        {/* Selección de roles */}
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={styles.input}
        >
          <option value="">Selecciona un Rol</option>
          <option value="Supplier">Supplier</option>
          <option value="Admin">Admin</option>
          <option value="Auditor">Auditor</option>
          <option value="User">User</option>
        </select>

        {/* Correo Electrónico y contraseña */}
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

        {/* Campos específicos por rol */}
        {role === "Supplier" && (
          <>
            <input
              placeholder="Nombre de Construcción"
              value={constructionName}
              onChange={(e) => setConstructionName(e.target.value)}
              style={styles.input}
            />
            <input
              placeholder="Manager"
              value={manager}
              onChange={(e) => setManager(e.target.value)}
              style={styles.input}
            />
            <input
              placeholder="Teléfono Manager"
              value={managerPhone}
              onChange={(e) => setManagerPhone(e.target.value)}
              style={styles.input}
            />
          </>
        )}

        {role === "Admin" && (
          <>
            <input
              placeholder="Manager"
              value={manager}
              onChange={(e) => setManager(e.target.value)}
              style={styles.input}
            />
            <input
              placeholder="Teléfono Manager"
              value={managerPhone}
              onChange={(e) => setManagerPhone(e.target.value)}
              style={styles.input}
            />
          </>
        )}

        {role === "Auditor" && (
          <>
            <input
              placeholder="Manager"
              value={manager}
              onChange={(e) => setManager(e.target.value)}
              style={styles.input}
            />
            <input
              placeholder="Teléfono Manager"
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
              placeholder="Manager"
              value={manager}
              onChange={(e) => setManager(e.target.value)}
              style={styles.input}
            />
            <input
              placeholder="Teléfono del Manager"
              value={managerPhone}
              onChange={(e) => setManagerPhone(e.target.value)}
              style={styles.input}
            />
            <input
              placeholder="Constructor"
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
  );
};

export default AddUser;
