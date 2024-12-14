import React, { useState, useEffect, useMemo } from "react";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { getApp } from "firebase/app";

const db = getFirestore(getApp());

const UserDashboard = ({ loggedInUser, onLogout }) => {
  const initialFormState = useMemo(
    () => ({
      requestDate: new Date().toLocaleDateString(),
      constructionName: "",
      material: "",
      quantity: "",
      unit: "unidad",
      manager: "",
      managerPhone: "",
      supplier: "",
      quotation: null,
      projectAddress: "",
    }),
    []
  );

  const [forms, setForms] = useState([initialFormState]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (loggedInUser) {
      setForms([
        {
          ...initialFormState,
          constructionName: loggedInUser.constructionName || "",
          manager: loggedInUser.manager || "",
          managerPhone: loggedInUser.managerPhone || "",
          projectAddress: loggedInUser.projectAddress,
        }
      ]);
    }
  }, [loggedInUser, initialFormState]);

  const handleChange = (index, e) => {
    const { name, value } = e.target;
    const updatedForms = [...forms];
    updatedForms[index][name] = value;
    setForms(updatedForms);
  };

  const handleAddMaterial = () => {
    setForms([...forms, { material: "", quantity: "", unit: "unidad" }]);
  };

  const handleRemoveMaterial = (index) => {
    const updatedForms = forms.filter((_, idx) => idx !== index);
    setForms(updatedForms);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const requestDate = new Date().toLocaleDateString();
      const materials = forms.map((form) => ({
        material: form.material,
        quantity: form.quantity,
        unit: form.unit,
        supplier: form.supplier,
        quotation: form.quotation ? form.quotation.name : null,
      }));

      const docRef = doc(db, "purchases", `request_${requestDate}`);

      await setDoc(docRef, {
        constructionName: loggedInUser.constructionName,
        manager: loggedInUser.manager,
        managerPhone: loggedInUser.managerPhone,
        requestDate,
        materials,
      });

      alert("Solicitudes enviadas exitosamente.");
      setForms([initialFormState]);
    } catch (error) {
      alert("Error al enviar las solicitudes: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "50px auto", backgroundColor: "#f5f5f5", borderRadius: "12px", boxShadow: "0 0 20px rgba(0, 0, 0, 0.4)" }}>

      {/* Botón cerrar sesión */}
      <button onClick={onLogout} style={{ position: "absolute", top: "10px", right: "10px", background: "#ff4b5c", color: "white", fontSize: "24px", padding: "10px", border: "none", borderRadius: "50%", cursor: "pointer", fontWeight: "bold" }}>
        🔒
      </button>

      <h2 style={{ textAlign: "center", color: "#007BFF" }}>
        Bienvenido {loggedInUser.constructionName}
      </h2>

      {/* Tarjeta de información */}
      <div style={{ padding: "15px", backgroundColor: "#e7f3fe", borderRadius: "12px", marginBottom: "20px" }}>
        <strong>Información del Proyecto</strong>
        <p><strong>Auditor Asignado:</strong> {loggedInUser.manager}</p>
        <p>
          <strong>Teléfono:</strong>
          <a href={`https://wa.me/${loggedInUser.managerPhone}`} target="_blank" rel="noopener noreferrer">
            {loggedInUser.managerPhone}
          </a>
        </p>
        <p><strong>Constructora:</strong> {loggedInUser.constructionName}</p>
        <p><strong>Dirección Proyecto:</strong> {loggedInUser.projectAddress}</p>
      </div>

      {/* Mensaje de carga */}
      {loading && <p>Cargando...</p>}

      {/* Formulario para agregar materiales */}
      {forms.map((form, index) => (
        <div key={index} style={{ display: "flex", alignItems: "center", marginBottom: "15px" }}>
          <input
            type="text"
            placeholder="Nombre del material"
            name="material"
            value={form.material}
            onChange={(e) => handleChange(index, e)}
            style={{ marginRight: "10px", flex: 1 }}
          />
          <input
            type="number"
            placeholder="Cantidad"
            name="quantity"
            value={form.quantity}
            onChange={(e) => handleChange(index, e)}
            style={{ marginRight: "10px", width: "120px" }}
          />
          <select name="unit" value={form.unit} onChange={(e) => handleChange(index, e)}>
            <option value="unidad">Unidad</option>
            <option value="metro">Metro</option>
            <option value="caja">Caja</option>
            <option value="paquete">Paquete</option>
          </select>

          {/* Botón eliminar */}
          <button onClick={() => handleRemoveMaterial(index)} style={{ background: "red", color: "white", padding: "5px", border: "none", borderRadius: "5px" }}>
            Eliminar
          </button>
        </div>
      ))}

      {/* Botones adicionales */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px" }}>
        <button onClick={handleAddMaterial} style={{ padding: "15px", backgroundColor: "#007BFF", color: "white", borderRadius: "8px" }}>
          + Agregar Material
        </button>
        <button onClick={handleSubmit} style={{ padding: "15px", backgroundColor: "#28a745", color: "white", borderRadius: "8px" }}>
          Enviar Solicitudes
        </button>
        <button onClick={onLogout} style={{ padding: "15px", backgroundColor: "#ff4b5c", color: "white", borderRadius: "8px" }}>
          Cerrar Sesión
        </button>
      </div>

    </div>
  );
};

export default UserDashboard;
