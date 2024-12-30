import React from "react";
import ReactDOM from "react-dom/client"; // Cambié esta línea
import { BrowserRouter } from "react-router-dom"; // Importa BrowserRouter
import { AuthProvider } from "./AuthContext"; // Importa el proveedor del contexto de autenticación
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter> {/* Asegúrate de envolver con BrowserRouter primero */}
      <AuthProvider> {/* Ahora envuelves con AuthProvider */}
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
