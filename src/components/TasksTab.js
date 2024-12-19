import React, { useState, useEffect } from "react";
import { collection, addDoc, getDocs, deleteDoc, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebaseConfig";

const TasksTab = ({ loggedInUser }) => {
  const [tasks, setTasks] = useState([]); // Lista de tareas
  const [taskForm, setTaskForm] = useState({ title: "", date: "", description: "" });
  const [editTaskId, setEditTaskId] = useState(null); // ID de la tarea en edición

  useEffect(() => {
    fetchTasks();
  }, []);

  // Obtener tareas de Firestore
  const fetchTasks = async () => {
    const querySnapshot = await getDocs(collection(db, "tasks"));
    const tasksList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setTasks(tasksList);
  };

  // Agregar o editar tarea
  const handleAddOrEditTask = async () => {
    if (!taskForm.title || !taskForm.date || !taskForm.description) {
      alert("Todos los campos son obligatorios");
      return;
    }

    try {
      if (editTaskId) {
        // Editar tarea existente
        const taskRef = doc(db, "tasks", editTaskId);
        await updateDoc(taskRef, taskForm);
        alert("Tarea actualizada con éxito.");
      } else {
        // Crear nueva tarea
        await addDoc(collection(db, "tasks"), { ...taskForm, createdBy: loggedInUser.uid });
        alert("Tarea agregada con éxito.");
      }
      setTaskForm({ title: "", date: "", description: "" });
      setEditTaskId(null);
      fetchTasks(); // Actualizar lista
    } catch (error) {
      console.error("Error al agregar/editar la tarea:", error);
    }
  };

  // Eliminar tarea
  const handleDeleteTask = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar esta tarea?")) {
      try {
        await deleteDoc(doc(db, "tasks", id));
        alert("Tarea eliminada con éxito.");
        fetchTasks(); // Actualizar lista
      } catch (error) {
        console.error("Error al eliminar la tarea:", error);
      }
    }
  };

  // Formatear estado de la tarea
  const getTaskStatus = (date) => {
    const today = new Date();
    const taskDate = new Date(date);
    if (taskDate < today) return { status: "Vencida", color: "red" };
    if (taskDate.toDateString() === today.toDateString()) return { status: "Para hoy", color: "orange" };
    return { status: "Pendiente", color: "green" };
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Tareas Pendientes</h2>

      {/* Formulario */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Título"
          value={taskForm.title}
          onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
          style={inputStyle}
        />
        <input
          type="date"
          value={taskForm.date}
          onChange={(e) => setTaskForm({ ...taskForm, date: e.target.value })}
          style={inputStyle}
        />
        <textarea
          placeholder="Descripción"
          value={taskForm.description}
          onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
          style={{ ...inputStyle, height: "100px" }}
        />
        <button onClick={handleAddOrEditTask} style={btnAddStyle}>
          {editTaskId ? "Actualizar Tarea" : "Agregar Tarea"}
        </button>
      </div>

      {/* Lista de tareas */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
        {tasks.map((task) => {
          const { status, color } = getTaskStatus(task.date);
          return (
            <div
              key={task.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "15px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                backgroundColor: "#fff",
              }}
            >
              <h3 style={{ margin: 0 }}>{task.title}</h3>
              <p style={{ color: color, fontWeight: "bold" }}>{status}</p>
              <p style={{ margin: "5px 0" }}>Fecha: {task.date}</p>
              <p>{task.description}</p>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={() => {
                    setTaskForm({ title: task.title, date: task.date, description: task.description });
                    setEditTaskId(task.id);
                  }}
                  style={{ ...btnStyle, backgroundColor: "#ffc107" }}
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  style={{ ...btnStyle, backgroundColor: "#dc3545" }}
                >
                  Eliminar
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Estilos
const inputStyle = { padding: "10px", borderRadius: "5px", border: "1px solid #ddd" };
const btnAddStyle = { padding: "10px", backgroundColor: "#28a745", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" };
const btnStyle = { padding: "5px 10px", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" };

export default TasksTab;
