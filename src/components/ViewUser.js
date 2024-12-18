import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs
} from "firebase/firestore";
import { db } from "../firebaseConfig";

const ViewUser = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [assignedWorks, setAssignedWorks] = useState([]);
  const [purchases, setPurchases] = useState([]); // Agregar estado para las compras

  // 1. Obtener información del usuario
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userDocRef = doc(db, "users", userId);
        const userSnapshot = await getDoc(userDocRef);

        if (userSnapshot.exists()) {
          setUser(userSnapshot.data());
        } else {
          console.log("No se encontró el usuario");
        }
      } catch (error) {
        console.error("Error al obtener el usuario:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  // 2. Obtener obras asignadas para rol "auditor"
  useEffect(() => {
    const fetchAssignedWorks = async () => {
      if (user && user.role === "auditor") {
        try {
          const worksCollection = collection(db, "works");
          const qWorks = query(
            worksCollection,
            where("assignedAuditor", "==", user.manager)
          );
          const snapshot = await getDocs(qWorks);
          const worksList = snapshot.docs.map((doc) => doc.data());
          setAssignedWorks(worksList);
        } catch (error) {
          console.error("Error al obtener obras asignadas:", error.message);
        }
      }
    };
    fetchAssignedWorks();
  }, [user]);

  // 3. Obtener compras/pedidos realizados por este usuario
  useEffect(() => {
    const fetchPurchases = async () => {
      if (user && user.role === "user") {
        try {
          const purchasesCollection = collection(db, "purchases");
          const qPurchases = query(purchasesCollection, where("userId", "==", userId));
          const snapshot = await getDocs(qPurchases);
          const purchasesList = snapshot.docs.map((doc) => doc.data());
          setPurchases(purchasesList);
        } catch (error) {
          console.error("Error al obtener compras:", error.message);
        }
      }
    };
    fetchPurchases();
  }, [user, userId]);

  // Manejo de carga
  if (loading) {
    return <p style={styles.loading}>Cargando detalles del usuario...</p>;
  }

  if (!user) {
    return <p style={styles.error}>No se encontró el usuario.</p>;
  }

  // Botón para regresar al panel
  const handleGoBack = () => {
    navigate("/admin");
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Detalles del Usuario</h1>

      {/* Sección principal de información */}
      <div style={styles.card}>
        {user.role === "admin" || user.role === "auditor" ? (
          <>
            <p>
              <strong>Nombre: </strong>
              {user.manager}
            </p>
            <p>
              <strong>Teléfono: </strong>
              {user.managerPhone}
            </p>
            <p>
              <strong>Correo: </strong>
              {user.email}
            </p>

            {/* Obras asignadas si el rol es auditor */}
            {user.role === "auditor" && assignedWorks.length > 0 && (
              <div>
                <h2 style={styles.subtitle}>Obras Asignadas</h2>
                <ul>
                  {assignedWorks.map((work, index) => (
                    <li key={index}>
                      {work.constructionName} - {work.projectAddress}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : (
          // Mostrar datos específicos si es user o supplier
          <>
            {user.role === "user" && (
              <>
                <p>
                  <strong>Nombre: </strong>
                  {user.constructionName}
                </p>
                <p>
                  <strong>Dirección: </strong>
                  {user.projectAddress}
                </p>
                <p>
                  <strong>Constructora: </strong>
                  {user.constructor}
                </p>
                <p>
                  <strong>Encargado: </strong>
                  {user.manager}
                </p>
                <p>
                  <strong>Teléfono: </strong>
                  {user.managerPhone}
                </p>
                <p>
                  <strong>Auditor asignado: </strong>
                  {user.assignedAuditor}
                </p>
                <p>
                  <strong>Teléfono del auditor: </strong>
                  {user.auditorPhone}
                </p>
                <p>
                  <strong>Fecha de inicio de obra: </strong>
                  {user.startDate}
                </p>
                <p>
                  <strong>Fecha de terminación tentativa: </strong>
                  {user.tentativeEndDate}
                </p>
              </>
            )}

            {user.role === "supplier" && (
              <>
                <p>
                  <strong>Nombre: </strong>
                  {user.constructionName}
                </p>
                <p>
                  <strong>Dirección: </strong>
                  {user.projectAddress}
                </p>
                <p>
                  <strong>Constructora: </strong>
                  {user.constructor}
                </p>
                <p>
                  <strong>Encargado: </strong>
                  {user.manager}
                </p>
                <p>
                  <strong>Teléfono: </strong>
                  {user.managerPhone}
                </p>
                <p>
                  <strong>Auditor asignado: </strong>
                  {user.assignedAuditor}
                </p>
                <p>
                  <strong>Teléfono del auditor: </strong>
                  {user.auditorPhone}
                </p>
              </>
            )}
          </>
        )}
      </div>

      {/* Tabla de compras realizadas (solo para rol 'user') */}
      {user.role === "user" && purchases.length > 0 && (
        <div style={styles.purchasesSection}>
          <h2 style={styles.subtitle}>Compras Realizadas</h2>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Material</th>
                <th>Cantidad</th>
                <th>Unidad</th>
                <th>Proveedor</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map((purchase, idx) => (
                // Asumimos que purchase.materials es un array con cada compra
                purchase.materials?.map((item, index) => (
                  <tr key={`${idx}-${index}`}>
                    <td>{purchase.requestDate || "N/A"}</td>
                    <td>{item.material}</td>
                    <td>{item.quantity}</td>
                    <td>{item.unit}</td>
                    <td>{item.supplier}</td>
                  </tr>
                ))
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Botón de regresar al panel */}
      <button style={styles.button} onClick={handleGoBack}>
        Regresar
      </button>
    </div>
  );
};

// Estilos en línea para ejemplo
const styles = {
  container: {
    padding: "20px",
    maxWidth: "800px",
    margin: "50px auto",
    fontFamily: "Arial, sans-serif",
  },
  title: {
    fontSize: "1.8rem",
    marginBottom: "20px",
  },
  card: {
    backgroundColor: "#f5f5f5",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 0 8px rgba(0,0,0,0.1)",
    marginBottom: "20px",
  },
  subtitle: {
    marginTop: "20px",
    marginBottom: "10px",
    fontSize: "1.3rem",
  },
  purchasesSection: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 0 8px rgba(0,0,0,0.1)",
    marginBottom: "20px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "10px",
  },
  button: {
    padding: "10px 20px",
    backgroundColor: "#2196F3",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    borderRadius: "5px",
  },
  loading: {
    textAlign: "center",
    marginTop: "50px",
  },
  error: {
    textAlign: "center",
    color: "red",
    marginTop: "50px",
  },
};

export default ViewUser;
