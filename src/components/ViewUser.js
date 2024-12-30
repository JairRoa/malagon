import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import * as XLSX from "xlsx";

const ViewUser = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchases, setPurchases] = useState([]);
  const [notes, setNotes] = useState([]); // Ahora utilizado
  const [newNote, setNewNote] = useState(""); // Para añadir nuevas notas
  const [activeTab, setActiveTab] = useState("info");
  const [filterDate, setFilterDate] = useState(new Date());

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userDocRef = doc(db, "users", userId);
        const userSnapshot = await getDoc(userDocRef);

        if (userSnapshot.exists()) {
          setUser(userSnapshot.data());
        } else {
          console.error(`Usuario con ID ${userId} no encontrado.`);
        }
      } catch (error) {
        console.error("Error al obtener el usuario:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  useEffect(() => {
    const fetchPurchases = async () => {
      if (user?.role === "user") {
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

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const notesCollection = collection(db, "notes");
        const snapshot = await getDocs(notesCollection);
        const notesList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setNotes(notesList);
      } catch (error) {
        console.error("Error al obtener notas:", error.message);
      }
    };

    fetchNotes();
  }, []);

  const handleAddNote = async () => {
    if (newNote.trim() === "") return;
    try {
      const notesCollection = collection(db, "notes");
      const noteDoc = await addDoc(notesCollection, {
        content: newNote,
        createdBy: user.email || "Usuario desconocido",
        createdAt: new Date(),
      });
      setNotes((prev) => [...prev, { id: noteDoc.id, content: newNote, createdBy: user.email }]);
      setNewNote("");
    } catch (error) {
      console.error("Error al añadir nota:", error.message);
    }
  };

  const filterPurchasesByDate = (type) => {
    const now = new Date(filterDate);
    return purchases.filter((purchase) => {
      let purchaseDate;

      if (typeof purchase.requestDate === "string") {
        const [day, month, year] = purchase.requestDate.split("/");
        purchaseDate = new Date(`${year}-${month}-${day}`);
      } else if (purchase.requestDate?.toDate) {
        purchaseDate = purchase.requestDate.toDate();
      }

      if (!purchaseDate || isNaN(purchaseDate)) return false;

      if (type === "week") {
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay() + 1);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        return purchaseDate >= startOfWeek && purchaseDate <= endOfWeek;
      }

      if (type === "month") {
        return (
          purchaseDate.getFullYear() === now.getFullYear() &&
          purchaseDate.getMonth() === now.getMonth()
        );
      }

      if (type === "year") {
        return purchaseDate.getFullYear() === now.getFullYear();
      }

      return false;
    });
  };

  const handleDownloadExcel = (type) => {
    const filteredPurchases = filterPurchasesByDate(type);

    if (filteredPurchases.length === 0) {
      alert("No hay datos para exportar en el rango seleccionado.");
      return;
    }

    const formattedData = filteredPurchases.flatMap((purchase) =>
      purchase.materials.map((item) => ({
        Fecha: purchase.requestDate || "N/A",
        Material: item.material || "N/A",
        Cantidad: item.quantity || "N/A",
        Unidad: item.unit || "N/A",
        Proveedor: item.supplier || "N/A",
      }))
    );

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Compras");
    XLSX.writeFile(workbook, `Compras_${type}_${new Date().toISOString().split("T")[0]}.xlsx`);
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
      <div style={styles.tabs}>
        <button
          style={activeTab === "info" ? styles.activeTab : styles.tab}
          onClick={() => setActiveTab("info")}
        >
          Información del Usuario
        </button>
        {user.role === "user" && (
          <button
            style={activeTab === "purchases" ? styles.activeTab : styles.tab}
            onClick={() => setActiveTab("purchases")}
          >
            Materiales Solicitados
          </button>
        )}
        <button
          style={activeTab === "notes" ? styles.activeTab : styles.tab}
          onClick={() => setActiveTab("notes")}
        >
          Notas Importantes
        </button>
      </div>

      {activeTab === "info" && (
        <div style={styles.card}>
          {/* Información del usuario */}
          <p>
            <strong>Nombre de Construcción: </strong>
            {user.constructionName || "N/A"}
          </p>
          <p>
            <strong>Correo Electrónico: </strong>
            {user.email || "N/A"}
          </p>
          <p>
            <strong>Constructora: </strong>
            {user.constructor || "N/A"}
          </p>
          <p>
            <strong>Encargado: </strong>
            {user.manager || "N/A"}
          </p>
          <p>
            <strong>Teléfono del Encargado: </strong>
            {user.managerPhone || "N/A"}
          </p>
          <p>
            <strong>Dirección: </strong>
            {user.projectAddress || "N/A"}
          </p>
          <p>
            <strong>Interventor: </strong>
            {user.assignedAuditor || "N/A"}
          </p>
          <p>
            <strong>Teléfono del Interventor: </strong>
            {user.auditorPhone || "N/A"}
          </p>
          <p>
            <strong>Fecha de inicio del proyecto: </strong>
            {user.startDate || "N/A"}
          </p>
          <p>
            <strong>Fecha tentativa de fin del proyecto: </strong>
            {user.tentativeEndDate || "N/A"}
          </p>
        </div>
      )}

      {activeTab === "purchases" && (
        <div>
          <h2 style={styles.subtitle}>Materiales Solicitados</h2>
          <input
            type="date"
            style={styles.datePicker}
            value={filterDate.toISOString().split("T")[0]}
            onChange={(e) => setFilterDate(new Date(e.target.value))}
          />
          <div style={styles.filterButtons}>
            <button style={styles.button} onClick={() => handleDownloadExcel("week")}>
              Descargar Semana
            </button>
            <button style={styles.button} onClick={() => handleDownloadExcel("month")}>
              Descargar Mes
            </button>
            <button style={styles.button} onClick={() => handleDownloadExcel("year")}>
              Descargar Año
            </button>
          </div>
        </div>
      )}

      {activeTab === "notes" && (
        <div>
          <h2 style={styles.subtitle}>Notas Importantes</h2>
          <textarea
            style={styles.textarea}
            placeholder="Escribe una nueva nota..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
          />
          <button style={styles.button} onClick={handleAddNote}>
            Añadir Nota
          </button>
          {notes.map((note) => (
            <div key={note.id} style={styles.note}>
              <p>{note.content}</p>
              <small>Creado por: {note.createdBy}</small>
            </div>
          ))}
        </div>
      )}

      <button style={styles.button} onClick={() => navigate(-1)}>
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
  tabs: {
    display: "flex",
    marginBottom: "20px",
    gap: "10px",
  },
  tab: {
    padding: "10px 20px",
    backgroundColor: "#e0e0e0",
    border: "none",
    cursor: "pointer",
    borderRadius: "5px",
  },
  activeTab: {
    padding: "10px 20px",
    backgroundColor: "#2196F3",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    borderRadius: "5px",
  },
  card: {
    backgroundColor: "#f5f5f5",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 0 8px rgba(0,0,0,0.1)",
    marginBottom: "20px",
  },
  subtitle: {
    fontSize: "1.5rem",
    marginBottom: "10px",
  },
  filterButtons: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
  },
  button: {
    padding: "10px 20px",
    backgroundColor: "#2196F3",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    borderRadius: "5px",
  },
  datePicker: {
    marginBottom: "20px",
    padding: "5px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  note: {
    backgroundColor: "#f9f9f9",
    padding: "10px",
    borderRadius: "5px",
    marginBottom: "10px",
  },
};

export default ViewUser;
