import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        throw new Error("No se encontró información del usuario en Firestore.");
      }

      const userData = userDoc.data();
      if (!userData.role) {
        throw new Error("El rol del usuario no está definido.");
      }

      // Redirigir según el rol
      switch (userData.role) {
        case "admin":
          navigate("/admin");
          break;
        case "account":
          navigate("/account");
          break;
        case "user":
          navigate("/user");
          break;
        case "auditor":
          navigate("/auditor");
          break;
        case "supplier":
          navigate("/supplier");
          break;
        default:
          throw new Error(`Rol desconocido: ${userData.role}`);
      }
    } catch (err) {
      console.error("Error al iniciar sesión:", err.message);
      setError("Credenciales inválidas. Por favor, intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      backgroundImage: "url('/img/malagon-saavedra-ingenieros.jpg')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      textAlign: "center",
    },
    formWrapper: {
      display: "flex",
      alignItems: "center",
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      padding: "30px",
      borderRadius: "10px",
      boxShadow: "0 0 15px rgba(0, 0, 0, 0.2)",
      maxWidth: "800px",
      width: "90%",
    },
    logoWrapper: {
      flex: "1",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
    logo: {
      width: "150px",
      height: "150px",
    },
    formContent: {
      flex: "2",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      padding: "0 20px",
    },
    input: {
      width: "100%",
      padding: "10px",
      marginBottom: "15px",
      fontSize: "16px",
      border: "1px solid #ccc",
      borderRadius: "5px",
    },
    button: {
      width: "100%",
      padding: "10px",
      backgroundColor: "#007BFF",
      color: "#fff",
      border: "none",
      borderRadius: "5px",
      fontSize: "16px",
      cursor: loading ? "not-allowed" : "pointer",
    },
    error: {
      color: "red",
      marginBottom: "15px",
    },
    forgotPassword: {
      marginTop: "10px",
      fontSize: "14px",
      color: "#007BFF",
      cursor: "pointer",
      textDecoration: "underline",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.formWrapper}>
        <div style={styles.logoWrapper}>
          <img src="/img/malago-300-150x150 copia.png" alt="Logo" style={styles.logo} />
        </div>
        <div style={styles.formContent}>
          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Correo Electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
            {error && <p style={styles.error}>{error}</p>}
            <button type="submit" style={styles.button} disabled={loading}>
              {loading ? "Cargando..." : "Iniciar Sesión"}
            </button>
          </form>
          <p
            style={styles.forgotPassword}
            onClick={() => navigate("/forgot-password")}
          >
            Olvidé mi contraseña
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
