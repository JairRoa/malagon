import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";

const ViewUser = () => {
  const { userId } = useParams(); // Obtener el ID del usuario desde la URL
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [assignedWorks, setAssignedWorks] = useState([]); // Estado para obras asignadas
  const navigate = useNavigate(); // Para redirigir al usuario

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userDoc = doc(db, "users", userId);
        const userSnapshot = await getDoc(userDoc);

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

  // Función para obtener las obras asignadas al auditor
  useEffect(() => {
    const fetchAssignedWorks = async () => {
      if (user && user.role === "auditor") {
        try {
          const worksCollection = collection(db, "works"); // Suponiendo que tienes una colección "works"
          const q = query(worksCollection, where("assignedAuditor", "==", user.manager)); // Filtrar por el nombre del auditor
          const snapshot = await getDocs(q);
          const worksList = snapshot.docs.map((doc) => doc.data());
          setAssignedWorks(worksList);
        } catch (error) {
          console.error("Error al obtener obras asignadas:", error.message);
        }
      }
    };

    fetchAssignedWorks();
  }, [user]);

  if (loading) {
    return <p>Cargando detalles del usuario...</p>;
  }

  if (!user) {
    return <p>No se encontró el usuario.</p>;
  }

  // Función para regresar al panel
  const handleGoBack = () => {
    navigate("/admin"); // Redirige al panel de administración
  };

  // Renderizar los detalles del usuario dependiendo de su rol
  return (
    <div style={{ padding: "20px" }}>
      <h1>Detalles del Usuario</h1>
      <div>
        {/* Si es admin o auditor, solo mostramos nombre, teléfono y correo */}
        {user.role === "admin" || user.role === "auditor" ? (
          <>
            <p><strong>Nombre: </strong>{user.manager}</p>
            <p><strong>Teléfono: </strong>{user.managerPhone}</p>
            <p><strong>Correo: </strong>{user.email}</p>

            {/* Mostrar las obras asignadas solo si el rol es auditor */}
            {user.role === "auditor" && assignedWorks.length > 0 && (
              <div>
                <h2>Obras Asignadas:</h2>
                <ul>
                  {assignedWorks.map((work, index) => (
                    <li key={index}>{work.constructionName} - {work.projectAddress}</li> 
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : (
          // Mostrar datos específicos de cada rol (usuario, proveedor, etc.)
          <>
            {user.role === "user" && (
              <>
                <p><strong>Nombre: </strong>{user.constructionName}</p>
                <p><strong>Dirección: </strong>{user.projectAddress}</p>
                <p><strong>Constructora: </strong>{user.constructor}</p>
                <p><strong>Encargado: </strong>{user.manager}</p>
                <p><strong>Teléfono: </strong>{user.managerPhone}</p>
                <p><strong>Auditor asignado: </strong>{user.assignedAuditor}</p>
                <p><strong>Teléfono del auditor: </strong>{user.auditorPhone}</p>
                <p><strong>Fecha de inicio de obra: </strong>{user.startDate}</p>
                <p><strong>Fecha de terminación tentativa: </strong>{user.tentativeEndDate}</p>
              </>
            )}

            {user.role === "supplier" && (
              <>
                <p><strong>Nombre: </strong>{user.constructionName}</p>
                <p><strong>Dirección: </strong>{user.projectAddress}</p>
                <p><strong>Constructora: </strong>{user.constructor}</p>
                <p><strong>Encargado: </strong>{user.manager}</p>
                <p><strong>Teléfono: </strong>{user.managerPhone}</p>
                <p><strong>Auditor asignado: </strong>{user.assignedAuditor}</p>
                <p><strong>Teléfono del auditor: </strong>{user.auditorPhone}</p>
              </>
            )}
          </>
        )}
      </div>

      {/* Botón de regresar al panel */}
      <div style={{ marginTop: "20px" }}>
        <button
          onClick={handleGoBack}
          style={{
            padding: "10px 20px",
            backgroundColor: "#2196F3",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            borderRadius: "5px",
          }}
        >
          Regresar
        </button>
      </div>
    </div>
  );
};

export default ViewUser;
