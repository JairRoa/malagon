import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminPanel from "./components/AdminPanel";
import Login from "./components/Login";
import UserDashboard from "./components/UserDashboard";
import AuditorDashboard from "./components/AuditorDashboard";
import AddBuilding from "./components/AddBuilding";
import AddUser from "./components/AddUser";
import EditUser from "./components/EditUser";
import AddDataForm from "./components/AddDataForm";
import UpdateData from "./components/UpdateData";
import TestFirestore from "./components/TestFirestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebaseConfig";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Observar cambios de autenticación
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <p>Cargando...</p>;
  }

  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Navigate to="/admin" /> : <Login />} />
      <Route path="/admin" element={isAuthenticated ? <AdminPanel /> : <Navigate to="/" />} />
      <Route path="/user" element={isAuthenticated ? <UserDashboard /> : <Navigate to="/" />} />
      <Route path="/auditor" element={isAuthenticated ? <AuditorDashboard /> : <Navigate to="/" />} />

      {/* Rutas adicionales protegidas */}
      <Route path="/add-building" element={isAuthenticated ? <AddBuilding /> : <Navigate to="/" />} />
      <Route path="/add-user" element={isAuthenticated ? <AddUser /> : <Navigate to="/" />} />
      <Route path="/edit-user/:userId" element={isAuthenticated ? <EditUser /> : <Navigate to="/" />} />
      <Route path="/add-data" element={isAuthenticated ? <AddDataForm /> : <Navigate to="/" />} />
      <Route path="/update-data/:docId" element={isAuthenticated ? <UpdateData /> : <Navigate to="/" />} />
      <Route path="/test-firestore" element={isAuthenticated ? <TestFirestore /> : <Navigate to="/" />} />
    </Routes>
  );
};

export default App;
