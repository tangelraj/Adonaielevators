import React from "react";
import { Link } from "react-router-dom";
import "../App.css";

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-card">
          <div className="footer-contact">
            <div className="footer-contact-line">
              <span className="footer-icon">🏠</span>
              <p>
                No:125, 7th main, 1st cross,
                Opp.SRS building,K.G. Halli,
                Abbigerre, Banglore, Karnataka-560015
              </p>
            </div>
            <div className="footer-contact-line">
              <span className="footer-icon">📞</span>
              <p>+91-7760502630</p>
            </div>
            <div className="footer-contact-line">
              <span className="footer-icon">✉️</span>
              <p>adonaielevators@gmail.com</p>
            </div>
            <div className="footer-social">
              <a href="https://www.facebook.com/adonaielevators" className="social-button facebook" target="_blank" rel="noopener noreferrer">
                f
              </a>
              <a href="https://www.instagram.com/adonaielevators/" className="social-button instagram" target="_blank" rel="noopener noreferrer">
                i
              </a>
              <a href="https://wa.me/917760502630" className="social-button whatsapp" target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp">
                W
              </a>
              <a href="https://www.linkedin.com/in/adonai-elevators-917667266/" className="social-button linkedin" target="_blank" rel="noopener noreferrer">
                in
              </a>
            </div>
          </div>

          <div className="footer-experience">
            <h3>Our Experience Centers</h3>
            <div className="footer-section-divider" />
            <a href="mailto:adonaielevators@gmail.com?subject=Request%20an%20Appointment" className="footer-appointment">
              Request an Appointment
            </a>
          </div>
        </div>

        <div className="footer-links-grid">
          <div className="footer-links-column">
            <h3>Our Products</h3>
            <a href="/products/freight">Freight Elevators</a>
            <a href="/products/home">Home Elevators</a>
            <a href="/products/passenger">Passenger Elevators</a>
            <a href="/products/automobile">Automobile Elevators</a>
            <a href="/products/dumbwaiter">Dumbwaiter</a>
            <a href="/products/special-purpose">Special Purpose Elevators</a>
          </div>

          <div className="footer-links-column">
            <h3>Company</h3>
            <a href="/about">About us</a>
            
            
            
            
            <a href="/designers">Architects and Designers</a>
          </div>

          <div className="footer-links-column">
            <h3>Quick Links</h3>
            <Link to="/faqs">FAQs</Link>
            <a href="/blogs">Blogs</a>
            <a href="/images-gallery">Images Gallery</a>
            <a href="/video-gallery">Video Gallery</a>
            <a href="/peb-structure">PEB Structure</a>
            <a href="/experience-center">Experience Center</a>
          </div>
        </div>
      </div>

      <div className="footer-bottom-bar">
        <span>Copyright © 2025 ADONAI ELEVATORS. All rights reserved.</span>
        
      </div>
    </footer>
  );
}

export default Footer;
