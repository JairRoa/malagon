import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { ref, onValue } from "firebase/database";

const AuditorDashboard = () => {
  const [buildings, setBuildings] = useState([]);

  useEffect(() => {
    const buildingsRef = ref(db, "buildings");
    onValue(buildingsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setBuildings(Object.keys(data));
      }
    });
  }, []);

  return (
    <div>
      <h2>Dashboard de Auditor</h2>
      <ul>
        {buildings.map((building) => (
          <li key={building}>{building}</li>
        ))}
      </ul>
    </div>
  );
};

export default AuditorDashboard;
