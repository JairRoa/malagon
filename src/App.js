import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Componentes
import AdminPanel from "./components/AdminPanel";
import AccountDashboard from "./components/AccountDashboard";
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
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setLoggedInUser({ uid: user.uid, ...userSnap.data() });
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

  // Función para proteger rutas según el rol
  const ProtectedRoute = ({ role, children }) => {
    if (!loggedInUser) {
      return <Navigate to="/" />;
    }

    if (loggedInUser.role !== role) {
      return <Navigate to="/" />;
    }

    return children;
  };

  return (
    <Routes>
      {/* Ruta de inicio de sesión */}
      <Route path="/" element={<Login />} />

      {/* Rutas protegidas según rol */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <AdminPanel loggedInUser={loggedInUser} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/account"
        element={
          <ProtectedRoute role="account">
            <AccountDashboard loggedInUser={loggedInUser} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user"
        element={
          <ProtectedRoute role="user">
            <UserDashboard loggedInUser={loggedInUser} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/auditor"
        element={
          <ProtectedRoute role="auditor">
            <AuditorDashboard loggedInUser={loggedInUser} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/supplier"
        element={
          <ProtectedRoute role="supplier">
            <SupplierDashboard loggedInUser={loggedInUser} />
          </ProtectedRoute>
        }
      />

      {/* Rutas adicionales (no protegidas) */}
      <Route path="/add-building" element={<AddBuilding />} />
      <Route path="/add-user" element={<AddUser />} />
      <Route path="/edit-user/:userId" element={<EditUser />} />
      <Route path="/view-user/:userId" element={<ViewUser />} />
      <Route path="/add-data" element={<AddDataForm />} />
      <Route path="/update-data/:docId" element={<UpdateData />} />
      <Route path="/test-firestore" element={<TestFirestore />} />
    </Routes>
  );
};

export default App;
