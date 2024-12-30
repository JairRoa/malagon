import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const EditUser = () => {
  const { userId } = useParams(); // Obtener el ID del usuario de la URL
  const navigate = useNavigate(); // Para redirigir
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({}); // Para manejar los cambios del formulario
  const [password, setPassword] = useState(''); // Nueva contraseña
  const [confirmPassword, setConfirmPassword] = useState(''); // Confirmación de la contraseña

  // Cargar datos del usuario desde Firestore
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userDoc = doc(db, "users", userId);
        const userSnapshot = await getDoc(userDoc);
        if (userSnapshot.exists()) {
          const data = userSnapshot.data();
          setUserData(data);
          setFormData(data); // Inicializar el formulario con los datos existentes
        } else {
          console.error("No se encontró el usuario con el ID proporcionado.");
        }
      } catch (error) {
        console.error("Error al cargar los datos del usuario:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  // Manejar los cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Manejar cambios en la contraseña
  const handlePasswordChange = (e) => setPassword(e.target.value);
  const handleConfirmPasswordChange = (e) => setConfirmPassword(e.target.value);

  // Validar y actualizar los datos del usuario
  const handleUpdateUser = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Las contraseñas no coinciden. Por favor, verifica.");
      return;
    }

    try {
      const updatedData = { ...formData };
      if (password) updatedData.password = password; // Agregar contraseña si se actualizó

      const userDoc = doc(db, "users", userId);
      await updateDoc(userDoc, updatedData);
      alert("¡Usuario actualizado con éxito!");
      navigate('/admin'); // Regresar a la página de administración
    } catch (error) {
      console.error("Error al actualizar los datos del usuario:", error);
      alert("Hubo un error al actualizar el usuario.");
    }
  };

  if (loading) return <p>Cargando...</p>;

  if (!userData) return <p>No se encontraron datos para este usuario.</p>;

  return (
    <div>
      <h2>Editar Usuario</h2>
      <form onSubmit={handleUpdateUser}>
        <div>
          <label>Nombre:</label>
          <input
            type="text"
            name="manager"
            value={formData.manager || ''}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label>Teléfono:</label>
          <input
            type="number"
            name="managerPhone"
            value={formData.managerPhone || ''}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label>Dirección de la Obra:</label>
          <input
            type="text"
            name="projectAddress"
            value={formData.projectAddress || ''}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>Correo Electrónico:</label>
          <input
            type="email"
            name="email"
            value={formData.email || ''}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label>Rol:</label>
          <input
            type="text"
            name="role"
            value={formData.role || ''}
            onChange={handleInputChange}
            disabled // Evita que se cambie el rol desde aquí
          />
        </div>
        <div>
          <label>Nueva Contraseña:</label>
          <input
            type="password"
            value={password}
            onChange={handlePasswordChange}
            placeholder="Dejar en blanco para no cambiar"
          />
        </div>
        <div>
          <label>Confirmar Contraseña:</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            placeholder="Confirmar contraseña"
          />
        </div>
        <button type="submit">Actualizar Usuario</button>
      </form>
      <button onClick={() => navigate('/admin')} style={{ marginTop: '10px' }}>
        Regresar
      </button>
    </div>
  );
};

export default EditUser;
