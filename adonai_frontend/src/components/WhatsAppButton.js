import React from "react";

function WhatsAppButton() {
  return (
    <a
      className="whatsapp-floating"
      href="https://wa.me/917760502630?text=Hello%20Adonai%20Elevators%2C%20I%20would%20like%20to%20enquire%20about%20your%20services"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
    >
      <span className="whatsapp-icon">W</span>
    </a>
  );
}

export default WhatsAppButton;
