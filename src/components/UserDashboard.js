import React, { useState, useEffect, useMemo } from "react";
import { getFirestore, doc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { getApp } from "firebase/app";
import { signOut } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";

const db = getFirestore(getApp());

const UserDashboard = ({ loggedInUser }) => {
  const navigate = useNavigate();

  // ---------- ESTADOS PARA EL FORMULARIO DE SOLICITUD ----------
  const initialFormState = useMemo(() => ({
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
  }), []);

  const [forms, setForms] = useState([initialFormState]);
  const [loading, setLoading] = useState(false);

  // ---------- ESTADOS Y LÓGICA PARA MOSTRAR PEDIDOS ----------
  const [requests, setRequests] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");

  // Cargar la información del usuario en el formulario
  useEffect(() => {
    if (loggedInUser) {
      setForms([
        {
          ...initialFormState,
          constructionName: loggedInUser.constructionName || "",
          manager: loggedInUser.manager || "",
          managerPhone: loggedInUser.managerPhone || "",
          projectAddress: loggedInUser.projectAddress || "",
        },
      ]);
    }
  }, [loggedInUser, initialFormState]);

  // Cargar TODAS las solicitudes del usuario
  useEffect(() => {
    const fetchRequests = async () => {
      if (!loggedInUser) return;
      try {
        const currentUid = loggedInUser.uid || auth.currentUser?.uid;
        if (!currentUid) return;

        const purchasesCol = collection(db, "purchases");
        const q = query(purchasesCol, where("userId", "==", currentUid));
        const snapshot = await getDocs(q);

        const results = snapshot.docs.map(docSnap => docSnap.data());
        setRequests(results);
      } catch (error) {
        console.error("Error al obtener pedidos:", error.message);
      }
    };
    fetchRequests();
  }, [loggedInUser]);

  // Manejo de campos del formulario
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

  // Cerrar sesión
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  // Enviar solicitudes a Firestore
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const requestDate = now.toLocaleDateString();
      
      // Hora con dos puntos, tal cual queremos mostrarla
      const requestTime = now.toLocaleTimeString();

      // Mapeo de materiales
      const materials = forms
        .filter(form => form.material && form.quantity)
        .map(form => ({
          material: form.material,
          quantity: form.quantity,
          unit: form.unit,
          supplier: form.supplier || "N/A",
          quotation: form.quotation ? form.quotation.name : null,
        }));

      if (materials.length === 0) {
        alert("Por favor, agrega al menos un material válido.");
        setLoading(false);
        return;
      }

      // El docId sí puede reemplazar ":" para evitar errores en la ruta
      const docId = `${now.getFullYear()}-${
        String(now.getMonth() + 1).padStart(2, "0")
      }-${String(now.getDate()).padStart(2, "0")}_${requestTime.replace(/:/g, "-")}`;

      const currentUid = loggedInUser?.uid || auth.currentUser?.uid || "unknown";

      await setDoc(doc(db, "purchases", docId), {
        userId: currentUid,
        manager: loggedInUser?.manager || "N/A",
        managerPhone: loggedInUser?.managerPhone || "N/A",
        constructionName: loggedInUser?.constructionName || "N/A",
        projectAddress: loggedInUser?.projectAddress || "N/A",
        requestDate,
        requestTime, // Guardar la hora con ":" en la base de datos
        materials,
      });

      alert("Solicitudes enviadas exitosamente.");
      setForms([initialFormState]);

      // Actualizar pedidos localmente
      setRequests(prev => [
        ...prev,
        {
          userId: currentUid,
          manager: loggedInUser?.manager || "N/A",
          managerPhone: loggedInUser?.managerPhone || "N/A",
          constructionName: loggedInUser?.constructionName || "N/A",
          projectAddress: loggedInUser?.projectAddress || "N/A",
          requestDate,
          requestTime,
          materials,
        },
      ]);
    } catch (error) {
      alert("Error al enviar las solicitudes: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fechas únicas
  const uniqueDates = [...new Set(requests.map(req => req.requestDate))]
    .sort((a, b) => new Date(a) - new Date(b));

  // Filtrar pedidos por fecha
  const filteredRequests = requests.filter(r => r.requestDate === selectedDate);

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "800px",
        margin: "50px auto",
        backgroundColor: "#f5f5f5",
        borderRadius: "12px",
        boxShadow: "0 0 20px rgba(0, 0, 0, 0.4)",
        position: "relative",
      }}
    >
      {/* Botón cerrar sesión */}
      <button
        onClick={handleLogout}
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          background: "#ff4b5c",
          color: "white",
          fontSize: "24px",
          padding: "10px",
          border: "none",
          borderRadius: "50%",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        🔒
      </button>

      <h2 style={{ textAlign: "center", color: "#007BFF" }}>
        Bienvenido {loggedInUser?.constructionName || "Usuario"}
      </h2>

      {/* Info del Proyecto */}
      <div
        style={{
          padding: "15px",
          backgroundColor: "#e7f3fe",
          borderRadius: "12px",
          marginBottom: "20px",
        }}
      >
        <strong>Información del Proyecto</strong>
        <p>
          <strong>Auditor Asignado: </strong>
          {loggedInUser?.assignedAuditor || "N/A"}
        </p>
        <p>
          <strong>Teléfono: </strong>
          <a
            href={`https://wa.me/${loggedInUser?.auditorPhone}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {loggedInUser?.auditorPhone || "N/A"}
          </a>
        </p>
        <p>
          <strong>Constructora: </strong>
          {loggedInUser?.constructor || "N/A"}
        </p>
        <p>
          <strong>Dirección Proyecto: </strong>
          {loggedInUser?.projectAddress || "N/A"}
        </p>
      </div>

      {loading && <p>Cargando...</p>}

      {/* Formulario: materiales */}
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
          <select
            name="unit"
            value={form.unit}
            onChange={(e) => handleChange(index, e)}
          >
            <option value="unidad">Unidad</option>
            <option value="metro">Metro</option>
            <option value="caja">Caja</option>
            <option value="paquete">Paquete</option>
            <option value="rollo">Rollo</option>
            <option value="libra">Libra</option>
            <option value="bulto">Bulto</option>
          </select>

          <button
            onClick={() => handleRemoveMaterial(index)}
            style={{
              background: "red",
              color: "white",
              padding: "5px",
              border: "none",
              borderRadius: "5px",
              marginLeft: "10px",
            }}
          >
            Eliminar
          </button>
        </div>
      ))}

      {/* Botones */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px" }}>
        <button
          onClick={handleAddMaterial}
          style={{
            padding: "15px",
            backgroundColor: "#007BFF",
            color: "white",
            borderRadius: "8px",
          }}
        >
          + Agregar Material
        </button>
        <button
          onClick={handleSubmit}
          style={{
            padding: "15px",
            backgroundColor: "#28a745",
            color: "white",
            borderRadius: "8px",
          }}
        >
          Enviar Solicitudes
        </button>
        <button
          onClick={handleLogout}
          style={{
            padding: "15px",
            backgroundColor: "#ff4b5c",
            color: "white",
            borderRadius: "8px",
          }}
        >
          Cerrar Sesión
        </button>
      </div>

      {/* Sección "Tus pedidos" */}
      <div
        style={{
          marginTop: "40px",
          backgroundColor: "#fff",
          padding: "20px",
          borderRadius: "12px",
          boxShadow: "0 0 10px rgba(0,0,0,0.2)",
        }}
      >
        <h2 style={{ marginBottom: "20px", color: "#007BFF" }}>Tus pedidos</h2>

        <label style={{ marginRight: "10px" }}>
          <strong>Selecciona una fecha:</strong>
        </label>
        <select
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          style={{ padding: "5px 10px", marginBottom: "20px" }}
        >
          <option value="">--Seleccione--</option>
          {uniqueDates.map((date) => (
            <option key={date} value={date}>
              {date}
            </option>
          ))}
        </select>

        {selectedDate && filteredRequests.length > 0 && (
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
            <thead>
              <tr style={{ backgroundColor: "#e7f3fe" }}>
                <th style={thStyle}>Fecha</th>
                <th style={thStyle}>Hora de Solicitud</th>
                <th style={thStyle}>Material</th>
                <th style={thStyle}>Cantidad</th>
                <th style={thStyle}>Unidad</th>
                <th style={thStyle}>Manager</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((req, idx) =>
                req.materials.map((item, i) => (
                  <tr key={`${idx}-${i}`} style={{ textAlign: "center" }}>
                    <td style={tdStyle}>{req.requestDate}</td>
                    <td style={tdStyle}>{req.requestTime}</td>
                    <td style={tdStyle}>{item.material}</td>
                    <td style={tdStyle}>{item.quantity}</td>
                    <td style={tdStyle}>{item.unit}</td>
                    <td style={tdStyle}>{req.manager}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {selectedDate && filteredRequests.length === 0 && (
          <p>No hay pedidos para la fecha seleccionada.</p>
        )}
      </div>
    </div>
  );
};

const thStyle = {
  border: "1px solid #ccc",
  padding: "8px",
};

const tdStyle = {
  border: "1px solid #ccc",
  padding: "8px",
};

export default UserDashboard;
