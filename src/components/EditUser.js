import React, { useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig'; // Importa tu configuración de Firebase

const EditUser = () => {
  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "MalagonDatabase"));
        querySnapshot.forEach((doc) => {
          console.log(doc.id, " => ", doc.data());
        });
      } catch (error) {
        console.error("Error al obtener documentos:", error);
      }
    };

    fetchData();
  }, []); // Se ejecuta al montar el componente

  return <div>Consulta la consola para ver los datos de Firestore</div>;
};

export default EditUser;
