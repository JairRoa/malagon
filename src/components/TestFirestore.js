import React, { useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig'; // Asegúrate de que el archivo de configuración de Firebase está correctamente importado

const TestFirestore = () => {
  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "MalagonDatabase"));
        querySnapshot.forEach((doc) => {
          console.log(`${doc.id} =>`, doc.data()); // Muestra los datos de cada documento
        });
      } catch (error) {
        console.error("Error al leer los datos:", error);
      }
    };

    fetchData();
  }, []);

  return <div>Verifica la consola para ver los datos de Firestore.</div>;
};

export default TestFirestore;
