import React from 'react';
import { useParams } from 'react-router-dom';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const UpdateData = () => {
  const { id } = useParams(); // Obtiene el ID de la URL

  const handleUpdate = async () => {
    try {
      const docRef = doc(db, "MalagonDatabase", id); // Usa el ID dinámico
      await updateDoc(docRef, {
        campo1: "nuevoValor",
      });
      console.log("Documento actualizado");
    } catch (error) {
      console.error("Error al actualizar documento:", error);
    }
  };

  return <button onClick={handleUpdate}>Actualizar Documento</button>;
};

export default UpdateData;
