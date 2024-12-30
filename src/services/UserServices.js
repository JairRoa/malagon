export const createUser = async (username, password, role) => {
  try {
    if (!username || !password || !role) {
      throw new Error("Todos los campos son obligatorios.");
    }

    const userDocRef = doc(db, "users", username);

    // Verificar si el usuario ya existe
    const existingUser = await getDoc(userDocRef);
    if (existingUser.exists()) {
      throw new Error("El usuario ya existe.");
    }

    // Encriptar la contraseña
    const hashedPassword = bcrypt.hashSync(password, 10);

    await setDoc(userDocRef, {
      username,
      password: hashedPassword,
      role,
    });

    console.log("Usuario creado exitosamente.");
  } catch (error) {
    console.error("Error al crear el usuario:", error.message);
  }
};
