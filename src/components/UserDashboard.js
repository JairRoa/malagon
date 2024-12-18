import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";

const ViewUser = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [assignedWorks, setAssignedWorks] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  // Estado para compras realizadas
  const [purchases, setPurchases] = useState([]);

  // 1. Cargar datos del usuario
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUserData({ ...userSnap.data(), id: userId });
        } else {
          console.log("No se encontró el usuario.");
        }
      } catch (error) {
        console.error("Error al obtener el usuario:", error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [userId]);

  // 2. Si el usuario es auditor, obtener obras asignadas
  useEffect(() => {
    const fetchAssignedWorks = async () => {
      if (userData && userData.role === "auditor") {
        try {
          const worksCollection = collection(db, "works");
          const q = query(worksCollection, where("assignedAuditor", "==", userData.manager));
          const snapshot = await getDocs(q);
          const worksList = snapshot.docs.map((doc) => doc.data());
          setAssignedWorks(worksList);
        } catch (error) {
          console.error("Error al obtener obras asignadas:", error.message);
        }
      }
    };
    fetchAssignedWorks();
  }, [userData]);

  // 3. Cargar compras realizadas desde Firestore
  useEffect(() => {
    const fetchPurchases = async () => {
      if (!userId) return;
      try {
        const purchasesCol = collection(db, "purchases");
        const q = query(purchasesCol, where("userId", "==", userId));
        const snapshot = await getDocs(q);
        const results = snapshot.docs.map(docSnap => docSnap.data());
        setPurchases(results);
      } catch (error) {
        console.error("Error al obtener compras:", error.message);
      }
    };
    fetchPurchases();
  }, [userId]);

  if (loading) return <p>Cargando detalles del usuario...</p>;
  if (!userData) return <p>No se encontró el usuario.</p>;

  const handleGoBack = () => {
    navigate("/admin");
  };

  // ---- EDICIÓN EN TIEMPO REAL DEL USUARIO ----
  const handleInputChange = async (field, value) => {
    try {
      const updated = { ...userData, [field]: value };
      setUserData(updated);
      const userRef = doc(db, "users", userData.id);
      await updateDoc(userRef, { [field]: value });
    } catch (error) {
      console.error("Error al actualizar campo:", error.message);
    }
  };

  const toggleEditing = () => {
    setIsEditing(!isEditing);
  };

  const renderField = (label, fieldName) => {
    if (isEditing) {
      return (
        <p>
          <strong>{label}: </strong>
          <input
            type="text"
            value={userData[fieldName] || ""}
            onChange={(e) => handleInputChange(fieldName, e.target.value)}
            style={{ width: "250px" }}
          />
        </p>
      );
    } else {
      return (
        <p>
          <strong>{label}: </strong>
          {userData[fieldName] || "N/A"}
        </p>
      );
    }
  };

  // Función para editar una compra (se activa solo si role === "admin")
  const handleEditPurchase = (purchase) => {
    if (userData.role !== "admin") return;
    alert(`Editando compra: ${purchase.material}, Cantidad: ${purchase.quantity}`);
    // Aquí podrías implementar:
    // - Abrir un modal con formulario
    // - Actualizar Firestore en tiempo real, etc.
  };

  return (
    <div style={{ padding: "20px", maxWidth: "700px", margin: "30px auto" }}>
      <h1>Detalles del Usuario</h1>

      <div
        style={{
          backgroundColor: "#f5f5f5",
          padding: "20px",
          borderRadius: "10px",
          marginBottom: "20px",
        }}
      >
        {userData.role === "admin" || userData.role === "auditor" ? (
          <>
            {renderField("Nombre (manager)", "manager")}
            {renderField("Teléfono (managerPhone)", "managerPhone")}
            {renderField("Correo (email)", "email")}

            {/* Obras asignadas si es auditor */}
            {userData.role === "auditor" && assignedWorks.length > 0 && (
              <div style={{ marginTop: "15px" }}>
                <h2>Obras Asignadas</h2>
                <ul>
                  {assignedWorks.map((work, i) => (
                    <li key={i}>
                      {work.constructionName} - {work.projectAddress}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : (
          // Si es user o supplier
          <>
            {userData.role === "user" && (
              <>
                {renderField("Nombre (constructionName)", "constructionName")}
                {renderField("Dirección (projectAddress)", "projectAddress")}
                {renderField("Constructora (constructor)", "constructor")}
                {renderField("Encargado (manager)", "manager")}
                {renderField("Teléfono (managerPhone)", "managerPhone")}
                {renderField("Auditor Asignado (assignedAuditor)", "assignedAuditor")}
                {renderField("Teléfono Auditor (auditorPhone)", "auditorPhone")}
                {renderField("Fecha de inicio (startDate)", "startDate")}
                {renderField("Fecha de terminación tentativa (tentativeEndDate)", "tentativeEndDate")}
              </>
            )}
            {userData.role === "supplier" && (
              <>
                {renderField("Nombre (constructionName)", "constructionName")}
                {renderField("Dirección (projectAddress)", "projectAddress")}
                {renderField("Constructora (constructor)", "constructor")}
                {renderField("Encargado (manager)", "manager")}
                {renderField("Teléfono (managerPhone)", "managerPhone")}
                {renderField("Auditor Asignado (assignedAuditor)", "assignedAuditor")}
                {renderField("Teléfono Auditor (auditorPhone)", "auditorPhone")}
              </>
            )}
          </>
        )}
      </div>

      <button
        onClick={toggleEditing}
        style={{
          padding: "10px 20px",
          backgroundColor: isEditing ? "#ff4b5c" : "#2196F3",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          marginRight: "10px",
          cursor: "pointer",
        }}
      >
        {isEditing ? "Finalizar Edición" : "Editar"}
      </button>

      <button
        onClick={handleGoBack}
        style={{
          padding: "10px 20px",
          backgroundColor: "#4caf50",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Regresar
      </button>

      {/* ---- Sección de COMPRAS REALIZADAS ---- */}
      <div
        style={{
          marginTop: "30px",
          backgroundColor: "#fff",
          padding: "20px",
          borderRadius: "12px",
          boxShadow: "0 0 10px rgba(0,0,0,0.2)",
        }}
      >
        <h2 style={{ marginBottom: "15px" }}>Compras Realizadas</h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#f5f5f5" }}>
              <th style={thStyle}>Fecha</th>
              <th style={thStyle}>Material</th>
              <th style={thStyle}>Cantidad</th>
              <th style={thStyle}>Unidad</th>
              <th style={thStyle}>Proveedor</th>
              {userData.role === "admin" && <th style={thStyle}>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {purchases.map((purchase, index) => (
              <tr key={index}>
                <td style={tdStyle}>{purchase.requestDate || "N/A"}</td>
                {/* Suponiendo que cada 'purchase' puede tener varios materiales 
                    Si tus compras guardan 'materials' como array, ajusta el mapeo. 
                    Aquí, asumimos un 'purchase' con 'material' suelto. */}
                <td style={tdStyle}>{purchase.material || "N/A"}</td>
                <td style={tdStyle}>{purchase.quantity || 0}</td>
                <td style={tdStyle}>{purchase.unit || "N/A"}</td>
                <td style={tdStyle}>{purchase.supplier || "N/A"}</td>
                {userData.role === "admin" && (
                  <td style={tdStyle}>
                    <button style={editBtnStyle} onClick={() => handleEditPurchase(purchase)}>
                      Editar
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Estilos básicos
const thStyle = {
  border: "1px solid #ccc",
  padding: "10px",
  textAlign: "left",
};

const tdStyle = {
  border: "1px solid #ccc",
  padding: "10px",
};

const editBtnStyle = {
  padding: "8px 12px",
  backgroundColor: "#007BFF",
  color: "#fff",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
};

export default ViewUser;
