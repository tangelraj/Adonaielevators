import React from "react";
import TopBar from "./TopBar";
import Navbar from "./Navbar";
import "../App.css";
import architectImage from "../assets/image1.png";
import architectImages from "../assets/image2.webp";

function ArchitectsDesigners() {
  return (
    <div>
      <TopBar />
      <Navbar />
      <div className="page-intro">
        <h2>ADONAI Elevators: Your Partner In Growth</h2>
        <div className="page-intro-divider">
          <span className="title-bar title-bar-long" />
          <span className="title-bar title-bar-short" />
        </div>
      </div>
      <div className="page-section designers-page">
        <div className="page-heading">
          <h1>Architects & Designers</h1>
          <div className="title-divider" />
        </div>
        <div className="page-summary">
          <p>
            Join the ADONAI Elevators&rsquo; Network: Be recognized among India&rsquo;s most preferred Architects and Designers.
          </p>
        </div>

        <div className="designer-hero">
          <div className="designer-hero-image-wrapper">
            <div className="designer-hero-bg" />
            <div className="designer-hero-card">
              <img src={architectImage} alt="Architects planning design" />
            </div>
          </div>

          <div className="designer-hero-content">
            <h2>Elevating Your Vision</h2>
            <div className="subtitle-divider" />
            <ul>
              <li>
                <strong>Beyond the Blueprint:</strong> Elevate your architectural aspirations with ADONAI's innovative elevator solutions. Our cutting-edge technology and design expertise seamlessly integrate with your vision, transforming ordinary spaces into extraordinary experiences.
              </li>
              <li>
                <strong>A Symphony of Style and Substance:</strong> Partner with ADONAI ELEVATORS to create a harmonious blend of form and function. Our elevators are more than just transportation; they're a statement of elegance, efficiency, and unparalleled safety.
              </li>
              <li>
                <strong>Redefining Vertical Mobility:</strong> Join us in shaping the future of urban living. ADONAI ELEVATOR's state-of-the-art elevators offer unparalleled comfort, convenience, and accessibility, setting new standards for vertical transportation.
              </li>
            </ul>
          </div>
        </div>

        <div className="featured-hero">
          <div className="featured-hero-copy">
            <h2>The Future of Vertical Transportation</h2>
            <div className="subtitle-divider" />
            <ul>
              <li>
                Innovation, Reimagined: Experience the next generation of elevator technology. ADONAI ELEVATOR's commitment to innovation drives us to push the boundaries of design, engineering, and sustainability.
              </li>
              <li>
                Safety, Guaranteed: Your clients' safety is our top priority. ADONAI elevators are built to the highest safety standards, ensuring peace of mind for you and your occupants.
              </li>
              <li>
                A Legacy of Excellence: With a rich history of delivering exceptional products and services, ADONAI ELEVATOR is your trusted partner in elevating your projects.
              </li>
            </ul>
          </div>

          <div className="featured-hero-image">
            <div className="featured-hero-bg" />
            <div className="featured-hero-card">
              <img src={architectImages} alt="Elevator button panel" />
            </div>
          </div>
        </div>
      </div>
    </div>


    
  );
}

export default ArchitectsDesigners;
