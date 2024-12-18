import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Componentes
import AdminPanel from "./components/AdminPanel";
import Login from "./components/Login";
import UserDashboard from "./components/UserDashboard";
import AuditorDashboard from "./components/AuditorDashboard";
import SupplierDashboard from "./components/SupplierDashboard";

import AddBuilding from "./components/AddBuilding";
import AddUser from "./components/AddUser";
import EditUser from "./components/EditUser";
import ViewUser from "./components/ViewUser";
import AddDataForm from "./components/AddDataForm";
import UpdateData from "./components/UpdateData";
import TestFirestore from "./components/TestFirestore";

// Firebase
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./firebaseConfig";
import { getDoc, doc } from "firebase/firestore";

const App = () => {
  const [loading, setLoading] = useState(true);
  const [loggedInUser, setLoggedInUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Obtener el documento Firestore del usuario
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            setLoggedInUser(userSnap.data());
          } else {
            console.error("No se encontraron datos del usuario en Firestore.");
          }
        } catch (err) {
          console.error("Error al obtener los datos del usuario:", err);
        }
      } else {
        setLoggedInUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <p style={{ textAlign: "center", marginTop: "50px" }}>Cargando...</p>;
  }

  return (
    <Routes>
      {/* Ruta principal (Login) */}
      <Route path="/" element={<Login />} />

      {/* Panel de administrador */}
      <Route
        path="/admin"
        element={loggedInUser ? <AdminPanel /> : <Navigate to="/" />}
      />

      {/* Panel de usuario */}
      <Route
        path="/user"
        element={loggedInUser ? <UserDashboard loggedInUser={loggedInUser} /> : <Navigate to="/" />}
      />

      {/* Panel de auditor */}
      <Route
        path="/auditor"
        element={loggedInUser ? <AuditorDashboard /> : <Navigate to="/" />}
      />

      {/* Panel de supplier */}
      <Route
        path="/supplier"
        element={loggedInUser ? <SupplierDashboard /> : <Navigate to="/" />}
      />

      <Route
        path="/add-building"
        element={loggedInUser ? <AddBuilding /> : <Navigate to="/" />}
      />
      <Route
        path="/add-user"
        element={loggedInUser ? <AddUser /> : <Navigate to="/" />}
      />
      <Route
        path="/edit-user/:userId"
        element={loggedInUser ? <EditUser /> : <Navigate to="/" />}
      />
      <Route
        path="/view-user/:userId"
        element={loggedInUser ? <ViewUser /> : <Navigate to="/" />}
      />
      <Route
        path="/add-data"
        element={loggedInUser ? <AddDataForm /> : <Navigate to="/" />}
      />
      <Route
        path="/update-data/:docId"
        element={loggedInUser ? <UpdateData /> : <Navigate to="/" />}
      />
      <Route
        path="/test-firestore"
        element={loggedInUser ? <TestFirestore /> : <Navigate to="/" />}
      />
    </Routes>
  );
};

export default App;
