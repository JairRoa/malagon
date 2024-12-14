import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminPanel from "./components/AdminPanel";
import Login from "./components/Login";
import UserDashboard from "./components/UserDashboard";
import AuditorDashboard from "./components/AuditorDashboard";
import AddBuilding from "./components/AddBuilding";
import AddUser from "./components/AddUser";
import EditUser from "./components/EditUser";
import ViewUser from "./components/ViewUser";
import AddDataForm from "./components/AddDataForm";
import UpdateData from "./components/UpdateData";
import TestFirestore from "./components/TestFirestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./firebaseConfig"; // Importamos la base de datos
import { getDoc, doc } from "firebase/firestore";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loggedInUser, setLoggedInUser] = useState(null); // Estado para guardar los datos del usuario

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Obtener los datos del usuario desde Firestore
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setLoggedInUser(userSnap.data());
          } else {
            console.error("No se encontraron datos del usuario.");
          }
        } catch (err) {
          console.error("Error al obtener los datos del usuario:", err);
        }
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        setLoggedInUser(null);
      }
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
      <Route
        path="/user"
        element={
          isAuthenticated ? <UserDashboard loggedInUser={loggedInUser} /> : <Navigate to="/" />
        }
      />
      <Route path="/auditor" element={isAuthenticated ? <AuditorDashboard /> : <Navigate to="/" />} />
      <Route path="/add-building" element={isAuthenticated ? <AddBuilding /> : <Navigate to="/" />} />
      <Route path="/add-user" element={isAuthenticated ? <AddUser /> : <Navigate to="/" />} />
      <Route
        path="/edit-user/:userId"
        element={isAuthenticated ? <EditUser /> : <Navigate to="/" />}
      />
      <Route
        path="/view-user/:userId"
        element={isAuthenticated ? <ViewUser /> : <Navigate to="/" />}
      />
      <Route path="/add-data" element={isAuthenticated ? <AddDataForm /> : <Navigate to="/" />} />
      <Route
        path="/update-data/:docId"
        element={isAuthenticated ? <UpdateData /> : <Navigate to="/" />}
      />
      <Route
        path="/test-firestore"
        element={isAuthenticated ? <TestFirestore /> : <Navigate to="/" />}
      />
    </Routes>
  );
};

export default App;
