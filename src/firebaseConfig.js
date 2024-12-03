import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // Asegúrate de importar getAuth desde firebase/auth
import { getFirestore } from "firebase/firestore"; // Para Firestore

const firebaseConfig = {
  apiKey: "AIzaSyBj8V07VtlLN5fRkqgaZyzYiunutqF5jTY",
  authDomain: "malagon-ea242.firebaseapp.com",
  databaseURL: "https://malagon-ea242-default-rtdb.firebaseio.com",
  projectId: "malagon-ea242",
  storageBucket: "malagon-ea242.appspot.com",
  messagingSenderId: "177651887574",
  appId: "1:177651887574:web:ad123539ef58f01b244877"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Obtén las instancias de auth y firestore
const auth = getAuth(app);
const db = getFirestore(app);

// Exporta ambas instancias
export { auth, db };
