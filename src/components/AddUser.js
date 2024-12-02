import React, { useState, useEffect } from "react";
import { getAuth, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, setDoc, doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const auth = getAuth();
const db = getFirestore();

const AddUser = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("usuario");
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminUsername, setAdminUsername] = useState(""); // Para mantener el nombre del admin logueado
  const [loading, setLoading] = useState(true); // Estado de carga para la verificación
  const navigate = useNavigate();

  const TIMEOUT_LIMIT = 5 * 60 * 1000; // 5 minutos en milisegundos

  useEffect(() => {
    // Verificar si hay un usuario logueado en el almacenamiento local
    const savedAdmin = localStorage.getItem("adminUsername");
    const savedLastActivityTime = localStorage.getItem("lastActivityTime");

    // Si existe un usuario logueado, verificamos si no ha pasado más de 5 minutos
    if (savedAdmin && savedLastActivityTime) {
      const timeDiff = Date.now() - savedLastActivityTime;
      if (timeDiff < TIMEOUT_LIMIT) {
        setAdminUsername(savedAdmin); // Recuperar el nombre del admin
        setIsAdmin(true); // El usuario sigue siendo administrador
      } else {
        localStorage.removeItem("adminUsername");
        localStorage.removeItem("lastActivityTime");
        signOut(auth); // Cerrar sesión si ha pasado el tiempo límite
        setIsAdmin(false);
        setError("Tu sesión ha expirado. Por favor, inicia sesión nuevamente.");
      }
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && !savedAdmin) {
        // Si el usuario es administrador, almacenamos el nombre y el tiempo de la última actividad
        const userRef = doc(db, "users", user.uid);
        getDoc(userRef)
          .then((docSnap) => {
            if (docSnap.exists()) {
              const userData = docSnap.data();
              if (userData.role === "admin") {
                setAdminUsername(userData.username);
                setIsAdmin(true);
                localStorage.setItem("adminUsername", userData.username); // Guardar en localStorage
                localStorage.setItem("lastActivityTime", Date.now().toString()); // Actualizar tiempo de actividad
              } else {
                setIsAdmin(false);
                setError("No tienes permisos para agregar usuarios.");
              }
            } else {
              setError("Usuario no encontrado en la base de datos.");
              setIsAdmin(false);
            }
            setLoading(false);
          })
          .catch((error) => {
            setError("Error al verificar el rol del usuario: " + error.message);
            setIsAdmin(false);
            setLoading(false);
          });
      } else {
        setLoading(false);
        setError("No estás logueado.");
        setIsAdmin(false);
      }
    });

    return () => unsubscribe();
  }, [TIMEOUT_LIMIT]); // Aseguramos que TIMEOUT_LIMIT esté en la lista de dependencias

  const handleAddUser = async () => {
    if (!username.trim() || !password.trim()) {
      setError("Por favor, ingresa un nombre de usuario y una contraseña.");
      return;
    }

    if (!isAdmin) {
      setError("No tienes permisos para agregar usuarios.");
      return;
    }

    try {
      // Crear un correo electrónico único usando el nombre de usuario
      let email = `${username.toLowerCase().replace(/\s+/g, "")}-${Date.now()}@example.com`; // Asegurar unicidad con timestamp

      // Crear el usuario en Firebase Authentication
      await createUserWithEmailAndPassword(auth, email, password);

      // Obtener el usuario autenticado
      const user = auth.currentUser;
      const userRef = doc(db, "users", user.uid); // Crear referencia al usuario
      await setDoc(userRef, { username, role }); // Guardar los datos del nuevo usuario en Firestore

      // Redirigir al panel de administración con el nombre del admin
      alert("Usuario agregado con éxito");
      navigate("/admin"); // Redirigir al panel de administración

      // Actualizamos la última actividad al agregar un usuario
      localStorage.setItem("lastActivityTime", Date.now().toString());
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        setError("El correo electrónico ya está en uso. Por favor, elige otro nombre de usuario.");
      } else {
        setError("Error al agregar usuario: " + err.message);
      }
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem("adminUsername");
    localStorage.removeItem("lastActivityTime");
    setIsAdmin(false);
    navigate("/login");
  };

  if (loading) {
    return <p>Cargando...</p>; // Mostrar mensaje de carga mientras verificamos los permisos
  }

  return (
    <div>
      <h2>Agregar Usuario</h2>
      {isAdmin ? (
        <>
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
            <option value="admin">Administrador</option>
          </select>
          <button onClick={handleAddUser}>Agregar Usuario</button>
        </>
      ) : (
        <p style={{ color: "red" }}>{error}</p>
      )}

      {/* Mostrar el nombre del admin logueado */}
      {isAdmin && <h3>Bienvenido, {adminUsername}!</h3>}

      <button onClick={handleLogout}>Cerrar sesión</button>
    </div>
  );
};

export default AddUser;
