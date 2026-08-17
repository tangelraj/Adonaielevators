import React from "react";
import TopBar from "./TopBar";
import Navbar from "./Navbar";
import EnquiryForm from "./EnquiryForm";
import "../App.css";

function ContactPage() {
  return (
    <div>
      <TopBar />
      <Navbar />

      <section className="contact-hero">
        <div className="contact-hero-content">
          <h1>Contact Us</h1>
          <div className="hero-divider" />
          <p>
            Reach out to ADONAI Elevators for enquiries, support, and project
            partnerships. Our team is ready to help you with the next step in
            vertical mobility.
          </p>
        </div>
      </section>

      <section className="contact-page">
        <div className="contact-grid">
          <div className="contact-details">
            <div className="contact-card">
              <h2>Get in Touch</h2>
              <div className="contact-item">
                <span>📧</span>
                <div>
                  <strong>Email</strong>
                  <p>adonaielevators@gmail.com</p>
                </div>
              </div>
              <div className="contact-item">
                <span>📞</span>
                <div>
                  <strong>Phone</strong>
                  <p>+91-7760502630</p>
                </div>
              </div>
              <div className="contact-item">
                <span>📍</span>
                <div>
                  <strong>Address</strong>
                  <p>
                    No:125, 7th main, 1st cross,
                    Opp.SRS building,K.G. Halli,
                    Abbigerre, Banglore, Karnataka-560015
                  </p>
                </div>
              </div>
            </div>

            
          </div>

          <div className="contact-form-wrapper">
            <EnquiryForm />
          </div>
        </div>
      </section>
    </div>
  );
}

export default ContactPage;
