import { getFirestore, doc, setDoc } from "firebase/firestore";
import bcrypt from "bcryptjs"; // Instálalo si no lo tienes: npm install bcryptjs

const db = getFirestore();

export const createUser = async (username, password, role) => {
  try {
    const hashedPassword = bcrypt.hashSync(password, 10); // Encriptar la contraseña
    const userDocRef = doc(db, "users", username); // Crear documento con ID del nombre de usuario

    await setDoc(userDocRef, {
      username,
      password: hashedPassword, // Contraseña encriptada
      role,
    });

    console.log("Usuario creado exitosamente.");
  } catch (error) {
    console.error("Error al crear el usuario:", error);
  }
};
