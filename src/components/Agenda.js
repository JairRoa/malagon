import React, { useState } from "react";
import Modal from "react-modal";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import esLocale from "date-fns/locale/es";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./Agenda.css";

Modal.setAppElement("#root");

const locales = {
  es: esLocale,
};
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const Agenda = () => {
  const [events, setEvents] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    startTime: "",
    endTime: "",
    recipients: "",
    description: "",
  });

  const [selectedDate, setSelectedDate] = useState(new Date());

  // Abrir modal
  const openModal = (slotInfo) => {
    setSelectedDate(slotInfo.start);
    setModalIsOpen(true);
  };

  // Cerrar modal
  const closeModal = () => {
    setModalIsOpen(false);
    setFormData({
      title: "",
      startTime: "",
      endTime: "",
      recipients: "",
      description: "",
    });
  };

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Agregar evento
  const handleAddEvent = () => {
    if (formData.title && formData.startTime && formData.endTime) {
      const newEvent = {
        title: formData.title,
        start: new Date(`${format(selectedDate, "yyyy-MM-dd")}T${formData.startTime}`),
        end: new Date(`${format(selectedDate, "yyyy-MM-dd")}T${formData.endTime}`),
        description: formData.description,
        recipients: formData.recipients,
      };
      setEvents([...events, newEvent]);
      closeModal();
    } else {
      alert("Por favor completa todos los campos requeridos.");
    }
  };

  return (
    <div style={{ display: "flex" }}>
      {/* Calendario a la izquierda */}
      <div style={{ flex: 1, padding: "20px" }}>
        <h2 style={{ textAlign: "center" }}>Agenda</h2>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          selectable
          onSelectSlot={openModal}
          messages={{
            next: "Siguiente",
            previous: "Anterior",
            today: "Hoy",
            month: "Mes",
            week: "Semana",
            day: "Día",
          }}
        />
      </div>

      {/* Lista de reuniones */}
      <div style={{ flex: 1, padding: "20px" }}>
        <h2 style={{ textAlign: "center" }}>Reuniones del Día</h2>
        {events.length > 0 ? (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {events.map((event, index) => (
              <li
                key={index}
                style={{
                  backgroundColor: "#f0f0f0",
                  marginBottom: "10px",
                  padding: "10px",
                  borderRadius: "5px",
                }}
              >
                <strong>{event.title}</strong>
                <p>Hora: {format(event.start, "HH:mm")} - {format(event.end, "HH:mm")}</p>
                <p>Destinatarios: {event.recipients}</p>
                <p>Descripción: {event.description}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ textAlign: "center" }}>No hay reuniones programadas para este día.</p>
        )}
      </div>

      {/* Modal para agregar evento */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        className="ReactModal__Content"
        overlayClassName="overlay"
      >
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Agregar Reunión</h2>
        <div>
          <label>Título:</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Título de la reunión"
          />

          <label>Hora de Inicio:</label>
          <input
            type="time"
            name="startTime"
            value={formData.startTime}
            onChange={handleInputChange}
          />

          <label>Hora de Fin:</label>
          <input
            type="time"
            name="endTime"
            value={formData.endTime}
            onChange={handleInputChange}
          />

          <label>Destinatarios (correos separados por comas):</label>
          <input
            type="text"
            name="recipients"
            value={formData.recipients}
            onChange={handleInputChange}
            placeholder="correo1@ejemplo.com, correo2@ejemplo.com"
          />

          <label>Descripción (máximo 200 palabras):</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows="4"
            maxLength="200"
          />

          <div style={{ marginTop: "20px", textAlign: "right" }}>
            <button onClick={handleAddEvent} className="add-button">
              Agregar Evento
            </button>
            <button onClick={closeModal} className="cancel-button">
              Cancelar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Agenda;
