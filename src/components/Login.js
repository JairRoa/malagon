import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore"; // Importar Firestore

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // Para mostrar los errores
  const navigate = useNavigate();
  const db = getFirestore(); // Instancia de Firestore

  const handleLogin = async () => {
    const auth = getAuth(); // Objeto de autenticación de Firebase

    if (!username.trim()) {
      setError("Por favor ingrese un nombre de usuario.");
      return;
    }

    const email = `${username.trim()}@malagonsaavedra.com`; // Formatear como email válido
    console.log("Intentando iniciar sesión con email:", email);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log("Usuario autenticado:", user);

      // Buscar datos del usuario en Firestore
      const userDocRef = doc(db, "users", user.uid); // Documento con UID del usuario
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const role = userData.role; // Suponiendo que el rol está en el campo 'role'

        // Redirigir según el rol
        if (role === "admin") {
          navigate("/admin");
        } else if (role === "auditor") {
          navigate("/auditor");
        } else if (role === "user") {
          navigate("/user");
        } else {
          setError("Rol no reconocido. Contacta al administrador.");
        }
      } else {
        setError("Usuario no encontrado en la base de datos.");
      }
    } catch (error) {
      const errorCode = error.code;
      let errorMessage = "Error al iniciar sesión.";

      if (errorCode === "auth/user-not-found") {
        errorMessage = "Usuario no encontrado. Verifica tu nombre de usuario.";
      } else if (errorCode === "auth/wrong-password") {
        errorMessage = "Contraseña incorrecta. Intenta de nuevo.";
      } else if (errorCode === "auth/invalid-email") {
        errorMessage = "Formato de usuario inválido.";
      }

      console.error("Error al iniciar sesión:", error);
      setError(errorMessage);
    }
  };

  return (
    <div>
      <h2>Inicio de Sesión</h2>
      <input
        type="text"
        placeholder="Usuario"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>Iniciar sesión</button>
      {error && <p style={{ color: "red" }}>{error}</p>} {/* Mostrar error si ocurre */}
    </div>
  );
};

export default Login;
