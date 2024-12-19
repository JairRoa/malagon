import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import es from "date-fns/locale/es";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./Agenda.css";

Modal.setAppElement("#root");

const locales = {
  es: es,
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

  // Cargar eventos desde el Local Storage
  useEffect(() => {
    const storedEvents = JSON.parse(localStorage.getItem("events")) || [];
    const updatedEvents = storedEvents.map((event) => {
      const now = new Date();
      const eventEnd = new Date(event.end);
      if (eventEnd < now && !event.description.includes("Finalizado")) {
        event.description = event.description
          ? `${event.description} - Finalizado`
          : "Finalizado";
      }
      return event;
    });
    setEvents(updatedEvents);
  }, []);

  // Guardar eventos en el Local Storage
  useEffect(() => {
    localStorage.setItem("events", JSON.stringify(events));
  }, [events]);

  const openModal = (slotInfo) => {
    setSelectedDate(slotInfo.start);
    setModalIsOpen(true);
  };

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddEvent = () => {
    if (formData.title && formData.startTime && formData.endTime) {
      const newEvent = {
        title: formData.title,
        start: new Date(
          `${format(selectedDate, "yyyy-MM-dd")}T${formData.startTime}`
        ),
        end: new Date(
          `${format(selectedDate, "yyyy-MM-dd")}T${formData.endTime}`
        ),
        description: formData.description || "",
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
      {/* Calendario */}
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
            agenda: "Agenda",
            date: "Fecha",
            time: "Hora",
            event: "Evento",
            noEventsInRange: "No hay eventos en este rango.",
            showMore: (total) => `+ Ver más (${total})`,
          }}
        />
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Agregar Reunión"
        style={{
          overlay: { backgroundColor: "rgba(0, 0, 0, 0.75)" },
          content: {
            backgroundColor: "#fff",
            maxWidth: "500px",
            margin: "auto",
            borderRadius: "10px",
          },
        }}
      >
        <h2 style={{ textAlign: "center" }}>Agregar Reunión</h2>
        <div>
          <label>Título:</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
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
          />

          <label>Descripción (máximo 200 palabras):</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            maxLength="200"
          ></textarea>

          <div style={{ marginTop: "20px", textAlign: "center" }}>
            <button
              onClick={handleAddEvent}
              style={{
                padding: "10px 15px",
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                marginRight: "10px",
              }}
            >
              Agregar Evento
            </button>
            <button
              onClick={closeModal}
              style={{
                padding: "10px 15px",
                backgroundColor: "#dc3545",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Agenda;
