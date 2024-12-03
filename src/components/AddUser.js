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
  const [adminUsername, setAdminUsername] = useState(""); // Para almacenar el nombre del admin logueado
  const [loading, setLoading] = useState(true); // Estado de carga para la verificación
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar si ya hay un usuario logueado
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Si hay un usuario logueado, obtener el rol desde Firestore
        const userRef = doc(db, "users", user.uid);
        getDoc(userRef).then((docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            if (userData.role === "admin") {
              // Si el usuario es admin, guardar el nombre y habilitar acceso
              setAdminUsername(userData.username);
              setIsAdmin(true);
              setLoading(false);
            } else {
              // Si no es admin, mostrar error
              setError("No tienes permisos para agregar usuarios.");
              setIsAdmin(false);
              setLoading(false);
            }
          } else {
            // Si no encontramos datos del usuario
            setError("Usuario no encontrado en la base de datos.");
            setIsAdmin(false);
            setLoading(false);
          }
        }).catch((error) => {
          setError("Error al verificar el rol del usuario: " + error.message);
          setIsAdmin(false);
          setLoading(false);
        });
      } else {
        // Si no hay usuario logueado, manejar la sesión
        setError("No estás logueado.");
        setIsAdmin(false);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []); // El efecto solo se ejecuta una vez al cargar el componente

  const handleAddUser = async () => {
    if (loading) {
      setError("Cargando..."); // Evitar que se ejecute mientras se cargan los datos
      return;
    }

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
      console.log("Email generado:", email); // Agregar log para verificar

      // Crear el usuario en Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Guardar el usuario en Firestore con el rol y el nombre de usuario
      const userRef = doc(db, "users", user.uid); // Crear referencia al usuario
      await setDoc(userRef, { username, role }); // Guardar los datos del nuevo usuario en Firestore

      // Si el rol del usuario creado es administrador, lo almacenamos en el localStorage
      if (role === "admin") {
        localStorage.setItem("adminUsername", username); // Guardar el nombre del admin
      }

      // Mostrar mensaje de éxito sin redirigir aún
      alert("Usuario agregado con éxito");

      // Redirigir al panel de administración
      navigate("/admin"); // Redirigir sin cambiar el nombre de admin
    } catch (err) {
      console.error("Error al crear el usuario:", err);
      if (err.code === "auth/email-already-in-use") {
        setError("El correo electrónico ya está en uso. Por favor, elige otro nombre de usuario.");
      } else {
        setError("Error al agregar usuario: " + err.message);
      }
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setIsAdmin(false);
    setAdminUsername("");
    navigate("/login");
  };

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
