import React, { useState } from "react";
import "../styles/About.css";
import aboutImage from "../assets/lift1.jpg"; // Replace with your actual image path

function About() {
  const [showMore, setShowMore] = useState(false);

  return (
    <div className="about-section">
      <div className="about-container">
        <div className="about-image">
          <img src={aboutImage} alt="ADONAI Elevator" />
        </div>
        
        <div className="about-content">
          <h2>About ADONAI ELEVATORS</h2>
          <p className="about-intro">
            Adonai Elevators is a trusted and fast-growing elevator company committed to delivering safe, reliable, and high-performance vertical transportation solutions. With a strong focus on quality, innovation, and customer satisfaction, we provide complete elevator solutions for residential, commercial, and industrial buildings.
          </p>
          
          <p className="about-description">
            Adonai Elevators Private Limited has been at the forefront of elevator technology, providing innovative solutions for homes, businesses, and industries worldwide. With more than 20 years of experience, we have worked with leading international companies and have built a strong reputation for technical excellence, dependable service, and customer-focused delivery.
          </p>

          {showMore && (
            <div className="about-more">
              <p>
                Our team of experts delivers installation, modernization, maintenance, and emergency support services with precision and care. We work closely with clients to design systems tailored to their building requirements and operational goals.
              </p>
              <p>
                We follow all international safety standards and use advanced products and processes to ensure every journey is smooth, efficient, and dependable. We have already installed more than 1,000 lifts and continue to grow as a company through quality, trust, and long-term partnerships.
              </p>
              <p>
                We provide complete elevator services, including installation, servicing, fault diagnosis, and problem resolution for all types of lifts. Partner with Adonai Elevators for solutions that enhance mobility, comfort, safety, and long-term value.
              </p>
            </div>
          )}
          
          <button className="read-more-btn" onClick={() => setShowMore((prev) => !prev)}>
            {showMore ? "Show Less" : "Read More"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default About;