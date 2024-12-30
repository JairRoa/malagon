const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const admin = require("firebase-admin");

// Inicializar Firebase Admin
const serviceAccount = require("./service-account-key.json");
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://malagon-ea242.firebaseio.com",
  });
}

const db = admin.firestore();
const auth = admin.auth();
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Ruta para crear un usuario
app.post("/create-user", async (req, res) => {
  const {
    email,
    password,
    role,
    manager,
    managerPhone,
    constructionName,
    assignedAuditor,
    auditorPhone,
    projectAddress,
    startDate,
    tentativeEndDate,
    constructor,
  } = req.body;

  try {
    // Validar campos requeridos
    if (!email || !password || !role) {
      return res
        .status(400)
        .json({ error: "Todos los campos obligatorios deben estar llenos." });
    }

    // Crear usuario en Firebase Authentication
    const userRecord = await auth.createUser({
      email,
      password,
    });

    const uid = userRecord.uid; // Obtener el UID del usuario creado

    // Preparar datos para guardar en Firestore
    const userData = {
      uid,
      email,
      role,
      manager: manager || undefined,
      managerPhone: managerPhone || undefined,
      constructionName: constructionName || undefined,
      assignedAuditor: assignedAuditor || undefined,
      auditorPhone: auditorPhone || undefined,
      projectAddress: projectAddress || undefined,
      startDate: startDate ? new Date(startDate).toISOString() : undefined,
      tentativeEndDate: tentativeEndDate
        ? new Date(tentativeEndDate).toISOString()
        : undefined,
      constructor: constructor || undefined,
    };

    // Filtrar claves vacías
    Object.keys(userData).forEach((key) => {
      if (userData[key] === undefined || userData[key] === null) {
        delete userData[key];
      }
    });

    // Guardar usuario en Firestore con UID como identificador
    await db.collection("users").doc(uid).set(userData);

    return res.status(200).json({ message: "Usuario creado exitosamente.", uid });
  } catch (error) {
    console.error("Error al crear el usuario:", error);

    // Manejar error específico de Firebase Authentication
    if (error.code && error.code.startsWith("auth/")) {
      return res.status(400).json({ error: error.message });
    }

    return res
      .status(500)
      .json({ error: "Hubo un error al crear el usuario. Por favor, intenta de nuevo." });
  }
});

// Ruta de prueba
app.get("/", (req, res) => {
  res.status(200).send("Servidor funcionando correctamente.");
});

// Iniciar el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});
