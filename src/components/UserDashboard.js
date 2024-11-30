import React, { useState } from "react";
import { db } from "../firebaseConfig";
import { ref, push } from "firebase/database";

const UserDashboard = () => {
  const [request, setRequest] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [requestNumber, setRequestNumber] = useState(1);

  const handleSendRequest = () => {
    const requestRef = ref(db, "requests");
    const newRequest = {
      id: requestNumber.toString().padStart(5, "0"),
      content: request,
      attachments,
    };
    push(requestRef, newRequest)
      .then(() => {
        alert(`Solicitud enviada. Número de radicación: ${newRequest.id}`);
        setRequestNumber((prev) => prev + 1);
      })
      .catch((err) => alert("Error: " + err.message));
  };

  return (
    <div>
      <h2>Crear Solicitud</h2>
      <textarea
        placeholder="Escribe tu solicitud"
        value={request}
        onChange={(e) => setRequest(e.target.value)}
      ></textarea>
      <input
        type="file"
        accept=".jpg,.png,.pdf,.doc,.docx,.xlsx"
        multiple
        onChange={(e) => setAttachments([...attachments, ...e.target.files])}
      />
      <button onClick={handleSendRequest}>Enviar Solicitud</button>
    </div>
  );
};

export default UserDashboard;
