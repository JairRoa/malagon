import React, { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Necesitamos el hook de navegación

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate(); // Usamos useNavigate para redirigir al login

  const logout = () => {
    setUser(null); // Limpiamos el estado del usuario
    navigate("/"); // Redirigimos a la página de login
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
