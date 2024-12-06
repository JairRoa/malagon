import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../firebaseConfig';  // Asegúrate de importar tu configuración de Firebase
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';

const AddUser = () => {
  const [role, setRole] = useState('');
  const [constructionName, setConstructionName] = useState('');
  const [email, setEmail] = useState('');
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

    if (password !== confirmPassword) {
      alert('Las contraseñas no coinciden. Por favor, verifique.');
      return;
    }

    try {
      // **Crear el usuario en Firebase Authentication**
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      console.log('UID del usuario:', uid);

      // **Guardar datos del usuario en Firestore**
      const usersCollection = collection(db, 'users');
      await setDoc(doc(usersCollection, uid), {
        constructionName,
        email,
        password,
        manager,
        managerPhone,
        projectAddress,
        constructor,
        startDate,
        tentativeEndDate,
        assignedAuditor,
        auditorPhone,
        role,
      });

      console.log('Usuario agregado a Firestore con UID:', uid);

      // Mantener el nombre del administrador en Local Storage
      const adminName = localStorage.getItem('adminName');
      localStorage.setItem('adminName', adminName);

      // Redirigir al panel del administrador después de agregar el usuario
      navigate('/admin');
    } catch (error) {
      console.error('Error al agregar usuario:', error.message);
      alert(`Error al agregar usuario: ${error.message}`);
    }
  };

  return (
    <div>
      <h2>Agregar Usuario</h2>
      <form onSubmit={handleAddUser}>
        {/* Selección del rol */}
        <label>Rol:</label>
        <select value={role} onChange={(e) => setRole(e.target.value)} required>
          <option value="">Seleccione un rol</option>
          <option value="admin">Admin</option>
          <option value="auditor">Auditor</option>
          <option value="user">Usuario</option>
          <option value="supplier">Proveedor</option>
        </select>

        {/* Campos según el rol seleccionado */}
        {role && (
          <>
            {role === 'admin' || role === 'auditor' ? (
              <>
                <label>Nombre</label>
                <input
                  type="text"
                  value={manager}
                  onChange={(e) => setManager(e.target.value)}
                  required
                />
                <label>Teléfono</label>
                <input
                  type="number"
                  value={managerPhone}
                  onChange={(e) => setManagerPhone(e.target.value)}
                  required
                />
                <label>Correo electrónico</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </>
            ) : null}

            {role === 'user' && (
              <>
                <label>Nombre de la Construcción</label>
                <input
                  type="text"
                  value={constructionName}
                  onChange={(e) => setConstructionName(e.target.value)}
                  required
                />
                <label>Encargado</label>
                <input
                  type="text"
                  value={manager}
                  onChange={(e) => setManager(e.target.value)}
                  required
                />
                <label>Teléfono del Encargado</label>
                <input
                  type="number"
                  value={managerPhone}
                  onChange={(e) => setManagerPhone(e.target.value)}
                  required
                />
                <label>Dirección de la Obra</label>
                <input
                  type="text"
                  value={projectAddress}
                  onChange={(e) => setProjectAddress(e.target.value)}
                  required
                />
              </>
            )}

            {/* Campos para contraseña */}
            <label>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <label>Repetir Contraseña</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </>
        )}

        <button type="submit">Guardar Usuario</button>
      </form>
    </div>
  );
};

export default AddUser;
