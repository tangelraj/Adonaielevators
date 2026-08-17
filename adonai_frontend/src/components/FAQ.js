import React, { useState } from "react";

const faqs = [
  {
    question: "How can I enhance my building’s aesthetic appeal and functionality?",
    answer:
      "Adonai Elevators offers a perfect blend of form and function. Our customizable designs and innovative features can elevate your building’s aesthetics and improve its overall efficiency.",
  },
  {
    question: "What types of elevators does Adonai Elevators offer?",
    answer:
      "We offer a wide range of elevator solutions, including passenger elevators, freight elevators, automobile elevators, dumbwaiters, and special-purpose elevators.",
  },
  {
    question: "What sets Adonai Elevators apart from the competition?",
    answer:
      "Adonai Elevators is committed to delivering cutting-edge elevator solutions that prioritize safety, reliability, and energy efficiency. Our focus on innovation, coupled with our dedication to customer satisfaction, sets us apart.",
  },
  {
    question: "How can I ensure the safety and security of my building’s occupants?",
    answer:
      "Adonai Elevators are designed and manufactured to the highest safety standards. Our rigorous testing procedures and advanced safety features guarantee a secure and reliable experience for all users.",
  },
  {
    question: "Do you provide maintenance and emergency support?",
    answer:
      "Yes, we offer comprehensive maintenance contracts and 24/7 emergency support to ensure your elevators operate safely and reliably.",
  },
  {
    question: "Can you modernize or upgrade old elevators?",
    answer:
      "Absolutely. We provide modernization solutions to upgrade old elevators for improved safety, performance, and aesthetics.",
  },
  {
    question: "How do I request a service or get a quote?",
    answer:
      "You can contact us via our website, phone, or email. Our support team will respond promptly to your service requests or quotation inquiries.",
  },
];

function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleBack = () => {
    window.history.back();
  };

  return (
    <div className="faq-section" style={{ maxWidth: 800, margin: "40px auto", padding: 20 }}>
      <div className="faq-topbar">
        <button type="button" className="faq-back-btn" onClick={handleBack}>
          ← Back
        </button>
      </div>
      <h2 style={{ textAlign: "center", marginBottom: 32 }}>Frequently Asked Questions</h2>
      {faqs.map((faq, idx) => (
        <div key={idx} style={{ marginBottom: 18, borderBottom: "1px solid #e0e0e0" }}>
          <button
            onClick={() => toggleFAQ(idx)}
            style={{
              width: "100%",
              textAlign: "left",
              background: "none",
              border: "none",
              fontSize: 18,
              fontWeight: 600,
              padding: "16px 0",
              cursor: "pointer",
              color: "#0d5ea6",
              outline: "none",
            }}
          >
            {faq.question}
          </button>
          {openIndex === idx && (
            <div style={{ padding: "0 0 16px 0", color: "#444", fontSize: 16 }}>
              {faq.answer}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default FAQ;
