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
import * as XLSX from "xlsx";
import { db } from "../firebaseConfig";

const ViewUser = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [assignedWorks, setAssignedWorks] = useState([]);
  const [purchases, setPurchases] = useState([]);

  // Obtener información del usuario
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

  // Obtener obras asignadas para rol "auditor"
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

  // Obtener compras/pedidos realizados por este usuario
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

  const handleDownloadExcel = (filterType) => {
    if (!purchases || purchases.length === 0) {
      alert("No hay datos de compras para exportar.");
      return;
    }
  
    console.log("Compras iniciales:", purchases);
  
    const now = new Date();
    const filteredPurchases = purchases.filter((purchase) => {
      let purchaseDate;
  
      // Convertir fecha al formato correcto
      if (typeof purchase.requestDate === "string") {
        // Convertir formato DD/MM/YYYY a YYYY-MM-DD
        const [day, month, year] = purchase.requestDate.split("/");
        purchaseDate = new Date(`${year}-${month}-${day}`);
      } else if (purchase.requestDate instanceof Object && purchase.requestDate.toDate) {
        purchaseDate = purchase.requestDate.toDate(); // Timestamp de Firebase
      }
  
      if (isNaN(purchaseDate)) {
        console.error("Fecha inválida:", purchase.requestDate);
        return false; // Ignorar compras con fecha inválida
      }
  
      console.log("Comparando fecha de compra:", purchaseDate);
  
      // Filtrar por tipo
      if (filterType === "year") {
        return purchaseDate.getFullYear() === now.getFullYear();
      }
  
      if (filterType === "month") {
        const sameYear = purchaseDate.getFullYear() === now.getFullYear();
        const sameMonth = purchaseDate.getMonth() === now.getMonth();
        console.log("¿Mismo mes?", sameMonth);
        return sameYear && sameMonth;
      }
  
      if (filterType === "week") {
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Lunes
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // Domingo
        return purchaseDate >= startOfWeek && purchaseDate <= endOfWeek;
      }
  
      return false;
    });
  
    console.log("Compras filtradas:", filteredPurchases);
  
    if (filteredPurchases.length === 0) {
      alert("No hay compras en el rango seleccionado.");
      return;
    }
  
    const formattedData = filteredPurchases.flatMap((purchase) => {
      if (!purchase.materials || purchase.materials.length === 0) {
        console.warn("Sin materiales:", purchase);
        return [];
      }
  
      return purchase.materials.map((item) => ({
        Fecha: purchase.requestDate || "N/A",
        Material: item.material || "N/A",
        Cantidad: item.quantity || 0,
        Unidad: item.unit || "N/A",
        Proveedor: item.supplier || "N/A",
        Encargado: user?.manager || "N/A", // Incluir el manager que realizó la compra
      }));
    });
  
    console.log("Datos a exportar:", formattedData);
  
    if (formattedData.length === 0) {
      alert("No hay materiales para exportar.");
      return;
    }
  
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Compras");
    XLSX.writeFile(
      workbook,
      `Informe_Compras_${filterType}_${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };
  
  
  

  if (loading) {
    return <p style={styles.loading}>Cargando detalles del usuario...</p>;
  }

  if (!user) {
    return <p style={styles.error}>No se encontró el usuario.</p>;
  }

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
          </>
        )}
      </div>

      {user.role === "user" && purchases.length > 0 && (
        <div style={styles.purchasesSection}>
          <h2 style={styles.subtitle}>Compras Realizadas</h2>
          <div style={styles.filterButtons}>
            <button style={styles.button} onClick={() => handleDownloadExcel("year")}>
              Descargar Informe Anual
            </button>
            <button style={styles.button} onClick={() => handleDownloadExcel("month")}>
              Descargar Informe Mensual
            </button>
            <button style={styles.button} onClick={() => handleDownloadExcel("week")}>
              Descargar Informe Semanal
            </button>
          </div>
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
              {purchases.map((purchase, idx) =>
                purchase.materials?.map((item, index) => (
                  <tr key={`${idx}-${index}`}>
                    <td>{purchase.requestDate || "N/A"}</td>
                    <td>{item.material}</td>
                    <td>{item.quantity}</td>
                    <td>{item.unit}</td>
                    <td>{item.supplier}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <button style={styles.button} onClick={() => navigate("/admin")}>
        Regresar
      </button>
    </div>
  );
};

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
  filterButtons: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
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
