import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminPanel from './components/AdminPanel';
import Login from './components/Login';
import UserDashboard from './components/UserDashboard';
import AuditorDashboard from './components/AuditorDashboard';
import AddBuilding from './components/AddBuilding';
import AddUser from './components/AddUser'; // Importar el componente AddUser
import EditUser from './components/EditUser'; // Componente para listar datos
import AddDataForm from './components/AddDataForm'; // Componente para agregar datos
import UpdateData from './components/UpdateData'; // Componente para actualizar datos
import TestFirestore from './components/TestFirestore';

const App = () => {
  return (
    <div>
      <Routes>
        {/* Rutas principales */}
        <Route path="/" element={<Login />} /> {/* Página de login */}
        <Route path="/admin" element={<AdminPanel />} /> {/* Panel de administrador */}
        <Route path="/user" element={<UserDashboard />} /> {/* Dashboard del usuario */}
        <Route path="/auditor" element={<AuditorDashboard />} /> {/* Dashboard del auditor */}
        
        {/* Rutas específicas */}
        <Route path="/add-building" element={<AddBuilding />} /> {/* Agregar edificios */}
        <Route path="/add-user" element={<AddUser />} /> {/* Agregar usuarios */}
        <Route path="/view-users" element={<EditUser />} /> {/* Ver/editar usuarios */}
        <Route path="/add-data" element={<AddDataForm />} /> {/* Agregar datos */}
        <Route path="/update-data/:docId" element={<UpdateData />} /> {/* Actualizar datos */}
        <Route path="/test-firestore" element={<TestFirestore />} /> {/* Probar Firestore */}
      </Routes>
    </div>
  );
};

export default App;
