import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBj8V07VtlLN5fRkqgaZyzYiunutqF5jTY",
  authDomain: "malagon-ea242.firebaseapp.com",
  databaseURL: "https://malagon-ea242-default-rtdb.firebaseio.com",
  projectId: "malagon-ea242",
  storageBucket: "malagon-ea242.appspot.com",
  messagingSenderId: "177651887574",
  appId: "1:177651887574:web:ad123539ef58f01b244877",
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar autenticación, Firestore y Storage
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
