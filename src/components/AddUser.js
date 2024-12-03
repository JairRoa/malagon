import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebaseConfig'; // Asegúrate de importar tu configuración de Firebase
import { collection, addDoc } from 'firebase/firestore'; // Métodos para agregar datos a Firestore

const AddUser = () => {
  const [role, setRole] = useState('');  // Estado para el rol
  const [constructionName, setConstructionName] = useState('');  // Nombre de la obra
  const [email, setEmail] = useState(''); // Correo electrónico
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [manager, setManager] = useState('');
  const [managerPhone, setManagerPhone] = useState('');
  const [projectAddress, setProjectAddress] = useState('');
  const [constructor, setConstructor] = useState('');
  const [startDate, setStartDate] = useState('');
  const [tentativeEndDate, setTentativeEndDate] = useState('');
  const [assignedAuditor, setAssignedAuditor] = useState('');
  const [auditorPhone, setAuditorPhone] = useState('');
  const navigate = useNavigate();

  const handleAddUser = async (e) => {
    e.preventDefault();

    // Validación de contraseñas
    if (password !== confirmPassword) {
      alert('Las contraseñas no coinciden. Por favor, verifique.');
      return;
    }

    try {
      const usersCollection = collection(db, 'users');
      await addDoc(usersCollection, {
        constructionName,  // Nombre de la obra
        email,  // Correo electrónico
        password,
        manager,
        managerPhone,
        projectAddress,
        constructor,
        startDate,
        tentativeEndDate,
        assignedAuditor,
        auditorPhone,
        role,  // Guardar el rol del usuario
      });

      console.log('Usuario agregado a la base de datos:', {
        constructionName,  // Nombre de la obra
        email,  // Correo electrónico
        password,
        manager,
        managerPhone,
        projectAddress,
        constructor,
        startDate,
        tentativeEndDate,
        assignedAuditor,
        auditorPhone,
        role,  // Mostrar el rol
      });

      // Mantener el nombre del administrador
      const adminName = localStorage.getItem('adminName');
      localStorage.setItem('adminName', adminName);

      // Redirigir al panel de administrador
      navigate('/admin');
    } catch (error) {
      console.error('Error al agregar usuario:', error);
    }
  };

  return (
    <div>
      <h2>Agregar Usuario</h2>
      <form onSubmit={handleAddUser}>
        {/* Selector de roles al principio */}
        <div>
          <label>Rol:</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          >
            <option value="">Seleccione un rol</option>
            <option value="admin">Admin</option>
            <option value="auditor">Auditor</option>
            <option value="user">Usuario</option>
            <option value="supplier">Proveedor</option>
          </select>
        </div>

        {/* Campos comunes a todos los roles */}
        {role && (
          <>
            {/* Campos que se muestran primero según el rol seleccionado */}
            {role === 'admin' || role === 'auditor' ? (
              <>
                {/* Campos para Admin y Auditor */}
                <div>
                  <label>Nombre:</label>
                  <input
                    type="text"
                    value={manager}
                    onChange={(e) => setManager(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label>Teléfono:</label>
                  <input
                    type="number"
                    value={managerPhone}
                    onChange={(e) => setManagerPhone(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label>Correo electrónico:</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </>
            ) : null}

            {role === 'user' && (
              <>
                {/* Campos para Usuario */}
                <div>
                  <label>Obra / Construcción:</label>
                  <input
                    type="text"
                    value={constructionName}
                    onChange={(e) => setConstructionName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label>Encargado:</label>
                  <input
                    type="text"
                    value={manager}
                    onChange={(e) => setManager(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label>Teléfono del Encargado:</label>
                  <input
                    type="number"
                    value={managerPhone}
                    onChange={(e) => setManagerPhone(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label>Dirección de la Obra:</label>
                  <input
                    type="text"
                    value={projectAddress}
                    onChange={(e) => setProjectAddress(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label>Constructora:</label>
                  <input
                    type="text"
                    value={constructor}
                    onChange={(e) => setConstructor(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label>Fecha de Inicio:</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label>Fecha Final Tentativa:</label>
                  <input
                    type="date"
                    value={tentativeEndDate}
                    onChange={(e) => setTentativeEndDate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label>Auditor Asignado:</label>
                  <input
                    type="text"
                    value={assignedAuditor}
                    onChange={(e) => setAssignedAuditor(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label>Teléfono del Auditor:</label>
                  <input
                    type="number"
                    value={auditorPhone}
                    onChange={(e) => setAuditorPhone(e.target.value)}
                    required
                  />
                </div>
              </>
            )}

            {role === 'supplier' && (
              <>
                {/* Campos para Proveedor */}
                <div>
                  <label>Nombre:</label>
                  <input
                    type="text"
                    value={constructionName}
                    onChange={(e) => setConstructionName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label>Teléfono:</label>
                  <input
                    type="number"
                    value={managerPhone}
                    onChange={(e) => setManagerPhone(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label>Correo electrónico:</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label>Dirección:</label>
                  <input
                    type="text"
                    value={projectAddress}
                    onChange={(e) => setProjectAddress(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label>Auditor Asignado:</label>
                  <input
                    type="text"
                    value={assignedAuditor}
                    onChange={(e) => setAssignedAuditor(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label>Teléfono del Auditor:</label>
                  <input
                    type="number"
                    value={auditorPhone}
                    onChange={(e) => setAuditorPhone(e.target.value)}
                    required
                  />
                </div>
              </>
            )}

            {/* Campos de Contraseña y Repetir Contraseña, solo visibles después de elegir rol */}
            <div>
              <label>Contraseña:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <label>Repetir Contraseña:</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </>
        )}

        <button type="submit">Guardar Usuario</button>
      </form>
    </div>
  );
};

export default AddUser;
