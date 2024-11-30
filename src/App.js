import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminPanel from './components/AdminPanel';
import Login from './components/Login';
import UserDashboard from './components/UserDashboard';
import AuditorDashboard from './components/AuditorDashboard';
import AddBuilding from './components/AddBuilding';
import AddUser from './components/AddUser'; // Importar el componente AddUser

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/user" element={<UserDashboard />} />
        <Route path="/auditor" element={<AuditorDashboard />} />
        <Route path="/add-building" element={<AddBuilding />} />
        <Route path="/add-user" element={<AddUser />} /> {/* Nueva ruta para agregar usuarios */}
      </Routes>
    </div>
  );
};

export default App;
