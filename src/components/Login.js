import React, { useState } from "react";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const db = getFirestore();

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetError, setResetError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      const userDoc = await getDoc(doc(db, "users", uid));
      if (!userDoc.exists()) {
        throw new Error("No se encontró información de usuario en Firestore.");
      }

      const userData = userDoc.data();
      if (!userData.role) {
        throw new Error("El campo 'role' no está definido en el documento del usuario.");
      }

      // Redirigir según el rol
      switch (userData.role) {
        case "admin":
          navigate("/admin");
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
      setError("Error al iniciar sesión. Por favor, verifica tus credenciales.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setResetError("Por favor, introduce tu correo electrónico.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      alert(
        "Se ha enviado un correo de restablecimiento de contraseña. Por favor, revisa tu bandeja de entrada."
      );
      setResetError("");
    } catch (err) {
      console.error("Error al enviar correo de restablecimiento:", err.message);
      setResetError("No se pudo enviar el correo de restablecimiento. Por favor, verifica tu correo.");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "0 auto", padding: 20, textAlign: "center" }}>
      <h2>Iniciar Sesión</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Correo Electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: "100%", padding: 10, marginBottom: 10 }}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: "100%", padding: 10, marginBottom: 10 }}
        />
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: 10,
            backgroundColor: "#007BFF",
            color: "#fff",
            border: "none",
            borderRadius: 5,
            cursor: loading ? "not-allowed" : "pointer",
            marginBottom: 10,
          }}
        >
          {loading ? "Cargando..." : "Iniciar Sesión"}
        </button>
      </form>
      <button
        onClick={handleForgotPassword}
        style={{
          width: "100%",
          padding: 10,
          backgroundColor: "#6c757d",
          color: "#fff",
          border: "none",
          borderRadius: 5,
          cursor: "pointer",
        }}
      >
        Olvidé mi Contraseña
      </button>
      {resetError && <p style={{ color: "red", marginTop: 10 }}>{resetError}</p>}
    </div>
  );
};

export default Login;
