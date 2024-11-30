import React, { useState } from "react";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, setDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

// Inicializa Firebase Auth y Firestore
const auth = getAuth();
const db = getFirestore();

const AddUser = () => {
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("usuario"); // Rol por defecto
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleAddUser = async () => {
    if (!username.trim() || !password.trim()) {
      setError("Por favor, ingresa un nombre de usuario y una contraseña.");
      return;
    }

    try {
      // Crear el usuario en Firebase Authentication con un correo ficticio
      const userCredential = await createUserWithEmailAndPassword(auth, `${username}@example.com`, password);
      const user = userCredential.user;

      // Guardar el nombre de usuario y rol en Firestore
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        username,
        role
      });

      alert("Usuario agregado con éxito");
      navigate("/"); // Redirigir a la página de administración o donde desees
    } catch (err) {
      setError("Error al agregar usuario: " + err.message);
    }
  };

  return (
    <div>
      <h2>Agregar Usuario</h2>
      <input
        type="text"
        placeholder="Nombre de usuario"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
      >
        <option value="usuario">Usuario</option>
        <option value="auditor">Auditor</option>
        <option value="administrador">Administrador</option>
      </select>
      <button onClick={handleAddUser}>Agregar Usuario</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default AddUser;
