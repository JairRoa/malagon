import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminPanel from './components/AdminPanel';
import Login from './components/Login';
import UserDashboard from './components/UserDashboard';
import AuditorDashboard from './components/AuditorDashboard';
import AddBuilding from './components/AddBuilding';
import AddUser from './components/AddUser';
import EditUser from './components/EditUser';
import AddDataForm from './components/AddDataForm';
import UpdateData from './components/UpdateData';
import TestFirestore from './components/TestFirestore';

const App = () => {
  return (
    <div>
      <Routes>
        {/* Ruta principal: Login */}
        <Route path="/" element={<Login />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/user" element={<UserDashboard />} />
        <Route path="/auditor" element={<AuditorDashboard />} />
        
        {/* Rutas adicionales */}
        <Route path="/add-building" element={<AddBuilding />} />
        <Route path="/add-user" element={<AddUser />} />
        <Route path="/view-users" element={<EditUser />} />
        <Route path="/add-data" element={<AddDataForm />} />
        <Route path="/update-data/:docId" element={<UpdateData />} />
        <Route path="/test-firestore" element={<TestFirestore />} />
      </Routes>
    </div>
  );
};

export default App;
