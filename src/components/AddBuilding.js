import React, { useState } from "react";
import { db } from "../firebaseConfig"; // Asegúrate de importar correctamente Firebase
import { collection, addDoc } from "firebase/firestore"; // Importamos las funciones necesarias de Firestore
import { useNavigate } from "react-router-dom"; // Asegúrate de importar correctamente react-router-dom


const AddBuilding = () => {
  const [buildingData, setBuildingData] = useState({
    name: "",
    address: "",
    city: "",
    managerName: "",
    managerLastName: "",
    phone: "",
    contractor: "",
    contractNumber: "",
    startDate: "",
    endDate: "",
    googleMapsLink: "",
    additionalData: [] // Para agregar campos adicionales
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBuildingData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleAdditionalDataChange = (e, index) => {
    const { name, value } = e.target;
    const updatedAdditionalData = [...buildingData.additionalData];
    updatedAdditionalData[index] = {
      ...updatedAdditionalData[index],
      [name]: value,
    };
    setBuildingData((prevData) => ({
      ...prevData,
      additionalData: updatedAdditionalData,
    }));
  };

  const handleAddAdditionalData = () => {
    setBuildingData((prevData) => ({
      ...prevData,
      additionalData: [...prevData.additionalData, { name: "", value: "" }],
    }));
  };

  const handleAddBuilding = async () => {
    if (!buildingData.name.trim() || !buildingData.address.trim() || !buildingData.city.trim()) {
      setError("Por favor, ingresa los campos obligatorios.");
      return;
    }

    try {
      // Guardamos el nuevo edificio en la colección "edificios"
      await addDoc(collection(db, "edificios"), {
        name: buildingData.name,
        address: buildingData.address,
        city: buildingData.city,
        manager: `${buildingData.managerName} ${buildingData.managerLastName}`,
        phone: buildingData.phone,
        contractor: buildingData.contractor,
        contractNumber: buildingData.contractNumber,
        startDate: buildingData.startDate,
        endDate: buildingData.endDate,
        googleMapsLink: buildingData.googleMapsLink,
        additionalData: buildingData.additionalData,
      });

      alert("Edificio agregado con éxito");
      navigate("/"); // Redirige al panel de administración
    } catch (err) {
      setError("Error al agregar edificio: " + err.message);
    }
  };

  return (
    <div>
      <h2>Agregar Edificio</h2>
      <form>
        <div>
          <label>Nombre del Edificio:</label>
          <input
            type="text"
            name="name"
            value={buildingData.name}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Dirección:</label>
          <input
            type="text"
            name="address"
            value={buildingData.address}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Ciudad:</label>
          <input
            type="text"
            name="city"
            value={buildingData.city}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Encargado Nombre:</label>
          <input
            type="text"
            name="managerName"
            value={buildingData.managerName}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Encargado Apellido:</label>
          <input
            type="text"
            name="managerLastName"
            value={buildingData.managerLastName}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Teléfono:</label>
          <input
            type="number"
            name="phone"
            value={buildingData.phone}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Constructora:</label>
          <input
            type="text"
            name="contractor"
            value={buildingData.contractor}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Número de Contrato:</label>
          <input
            type="text"
            name="contractNumber"
            value={buildingData.contractNumber}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Fecha de Inicio:</label>
          <input
            type="date"
            name="startDate"
            value={buildingData.startDate}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Fecha de Entrega:</label>
          <input
            type="date"
            name="endDate"
            value={buildingData.endDate}
            onChange={handleChange}
          />
        </div>
    

        {/* Sección para datos adicionales */}
        <div>
          <h3>Datos Adicionales</h3>
          {buildingData.additionalData.map((data, index) => (
            <div key={index}>
              <label>Nombre:</label>
              <input
                type="text"
                name="name"
                value={data.name}
                onChange={(e) => handleAdditionalDataChange(e, index)}
              />
              <label>Valor:</label>
              <input
                type="text"
                name="value"
                value={data.value}
                onChange={(e) => handleAdditionalDataChange(e, index)}
              />
            </div>
          ))}
          <button type="button" onClick={handleAddAdditionalData}>
            +
          </button>
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="button" onClick={handleAddBuilding}>Agregar Edificio</button>
      </form>
    </div>
  );
};

export default AddBuilding;
