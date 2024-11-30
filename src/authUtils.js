// src/authUtils.js
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

export const createUser = async (email, password) => {
  const auth = getAuth();
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("Usuario creado:", user);
  } catch (error) {
    console.error("Error al crear usuario:", error.message);
  }
};
