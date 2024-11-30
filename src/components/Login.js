import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore"; // Importar Firestore

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");  // Para mostrar los errores
  const navigate = useNavigate();
  const db = getFirestore(); // Obtener la instancia de Firestore

  const handleLogin = () => {
    const auth = getAuth();  // Obtener el objeto de autenticación de Firebase

    // Verificar que el nombre de usuario no esté vacío y agregar el dominio correctamente
    if (!username.trim()) {
      setError("Por favor ingrese un nombre de usuario.");
      return;
    }

    const email = `${username.trim()}`;  // Crear el email con el nombre de usuario
    console.log("Email de login: ", email);

    signInWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        // El usuario se ha autenticado correctamente
        const user = userCredential.user;
        console.log("Usuario autenticado:", user);

        // Buscar el rol del usuario en Firestore
        const userDocRef = doc(db, "users", user.uid); // Suponiendo que los usuarios están almacenados en una colección 'users'
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          const role = userData.role; // Suponiendo que el rol está en el campo 'role'

          // Redirigir según el rol del usuario
          if (role === "admin") {
            navigate("/admin");
          } else if (role === "auditor") {
            navigate("/auditor");
          } else if (role === "user") {
            navigate("/user");
          } else {
            setError("Rol no reconocido");
          }
        } else {
          setError("Usuario no encontrado en la base de datos.");
        }
      })
      .catch((error) => {
        const errorMessage = error.message;
        console.error("Error al iniciar sesión:", errorMessage); // Mostrar error en la consola para depuración
        setError("Credenciales incorrectas: " + errorMessage);  // Mostrar error si las credenciales son incorrectas
      });
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
