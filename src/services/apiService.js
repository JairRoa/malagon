import axios from "axios";

const API_URL = "http://localhost:5000"; // Cambia la URL según tu configuración

export const addUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/create-user`, userData);
    return response.data; // Retorna la respuesta del servidor
  } catch (error) {
    console.error("Error al agregar usuario:", error.response?.data || error.message);
    throw error; // Lanza el error para que lo maneje el componente
  }
};
