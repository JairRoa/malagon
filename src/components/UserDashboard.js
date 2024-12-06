import React, { useState } from "react";
import { db } from "../firebaseConfig";
import { ref, push } from "firebase/database"; // Eliminado onValue

const UserDashboard = ({ loggedInUser }) => {
  const [form, setForm] = useState({
    requestDate: new Date().toISOString().split("T")[0], // Fecha automática
    constructionName: loggedInUser?.constructionName || "", // Nombre de la obra
    material: "",
    quantity: "",
    unit: "unidad",
    manager: loggedInUser?.manager || "", // Encargado
    managerPhone: loggedInUser?.managerPhone || "", // Teléfono
    supplier: "",
    quotation: null, // Documento adjunto
  });

  const [loading, setLoading] = useState(false);

  // Manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({ ...prevForm, [name]: value }));
  };

  // Manejar cambios en el archivo adjunto
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && !["application/pdf", "image/png", "image/jpeg"].includes(file.type)) {
      alert("Solo se permiten archivos en formato PDF, PNG o JPG.");
      e.target.value = null; // Resetea el campo de archivo
      return;
    }
    setForm((prevForm) => ({ ...prevForm, quotation: file }));
  };

  // Manejar envío del formulario
  const handleSubmit = () => {
    if (!form.material.trim() || !form.quantity || !form.unit) {
      alert("Por favor, completa todos los campos requeridos.");
      return;
    }

    setLoading(true);

    const purchasesRef = ref(db, "purchases");
    const newPurchase = {
      ...form,
      quotation: form.quotation ? form.quotation.name : null, // Guardar solo el nombre del archivo
    };

    push(purchasesRef, newPurchase)
      .then(() => {
        alert("Solicitud enviada exitosamente.");
        setForm({
          requestDate: new Date().toISOString().split("T")[0],
          constructionName: loggedInUser?.constructionName || "",
          material: "",
          quantity: "",
          unit: "unidad",
          manager: loggedInUser?.manager || "",
          managerPhone: loggedInUser?.managerPhone || "",
          supplier: "",
          quotation: null,
        });
      })
      .catch((err) => alert("Error al enviar la solicitud: " + err.message))
      .finally(() => setLoading(false));
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2>Solicitud Semanal de Material</h2>
      <form style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        {/* Fecha de solicitud */}
        <div>
          <label>Fecha de Solicitud:</label>
          <input
            type="date"
            name="requestDate"
            value={form.requestDate}
            readOnly
            style={{ width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
          />
        </div>

        {/* Nombre de la obra */}
        <div>
          <label>Nombre de la Obra:</label>
          <input
            type="text"
            name="constructionName"
            value={form.constructionName}
            readOnly
            style={{ width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
          />
        </div>

        {/* Material */}
        <div>
          <label>Material / Elemento / Insumo:</label>
          <input
            type="text"
            name="material"
            value={form.material}
            onChange={handleChange}
            style={{ width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
          />
        </div>

        {/* Cantidad */}
        <div>
          <label>Cantidad:</label>
          <input
            type="number"
            name="quantity"
            value={form.quantity}
            onChange={handleChange}
            step="0.01"
            style={{ width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
          />
        </div>

        {/* Unidad */}
        <div>
          <label>Unidad:</label>
          <select
            name="unit"
            value={form.unit}
            onChange={handleChange}
            style={{ width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
          >
            <option value="metro">Metro</option>
            <option value="rollo">Rollo</option>
            <option value="unidad">Unidad</option>
            <option value="caja">Caja</option>
            <option value="paquete">Paquete</option>
            <option value="galón">Galón</option>
            <option value="botella">Botella</option>
            <option value="litro">Litro</option>
            <option value="libra">Libra</option>
          </select>
        </div>

        {/* Encargado */}
        <div>
          <label>Encargado:</label>
          <input
            type="text"
            name="manager"
            value={form.manager}
            readOnly
            style={{ width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
          />
        </div>

        {/* Teléfono del encargado */}
        <div>
          <label>Teléfono del Encargado:</label>
          <input
            type="tel"
            name="managerPhone"
            value={form.managerPhone}
            readOnly
            style={{ width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
          />
        </div>

        {/* Proveedor */}
        <div>
          <label>Proveedor Sugerido:</label>
          <input
            type="text"
            name="supplier"
            value={form.supplier}
            onChange={handleChange}
            style={{ width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
          />
        </div>

        {/* Documento adjunto */}
        <div>
          <label>Adjuntar Cotización (opcional):</label>
          <input
            type="file"
            accept=".pdf,.png,.jpg"
            onChange={handleFileChange}
            style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
          />
        </div>

        {/* Botón de envío */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          style={{ padding: "10px", backgroundColor: "#4CAF50", color: "white", borderRadius: "5px", cursor: "pointer" }}
        >
          {loading ? "Enviando..." : "Enviar Solicitud"}
        </button>
      </form>
    </div>
  );
};

export default UserDashboard;
