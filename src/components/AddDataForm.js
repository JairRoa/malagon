import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const AddDataForm = () => {
  const [campo1, setCampo1] = useState("");
  const [campo2, setCampo2] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const docRef = await addDoc(collection(db, "MalagonDatabase"), {
        campo1,
        campo2,
      });
      console.log("Documento agregado con ID:", docRef.id);
    } catch (error) {
      console.error("Error al agregar documento:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Campo 1"
        value={campo1}
        onChange={(e) => setCampo1(e.target.value)}
      />
      <input
        type="text"
        placeholder="Campo 2"
        value={campo2}
        onChange={(e) => setCampo2(e.target.value)}
      />
      <button type="submit">Agregar</button>
    </form>
  );
};

export default AddDataForm;
