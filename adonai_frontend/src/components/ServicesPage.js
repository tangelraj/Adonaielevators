import React from "react";
import TopBar from "./TopBar";
import Navbar from "./Navbar";

function ServicesPage() {
  return (
    <div>
      <TopBar />
      <Navbar />

      <section className="services-hero">
        <div className="services-hero-content">
          <h1>Elevator Services You Can Trust</h1>
          <div className="hero-divider" />
          <p>
            ADONAI Elevators delivers professional elevator services for new
            installations, preventive maintenance, fast repairs, and long-term
            modernization support.
          </p>
        </div>
      </section>

      <section className="services-page page-section">
        <div className="service-block">
          <h2>What We Offer</h2>
          <p>
            From complete elevator installation to regular upkeep and urgent
            repair work, our expert team keeps buildings moving safely and
            reliably. We support commercial, residential, and industrial
            elevator systems with tailored service plans.
          </p>
          <ul className="service-quick-list">
            <li>Custom elevator installation for new and existing buildings</li>
            <li>Scheduled inspections and preventive maintenance plans</li>
            <li>Fast troubleshooting and on-site repairs 24/7</li>
            <li>System modernization for efficiency, comfort, and safety</li>
          </ul>
        </div>

        <div className="service-grid">
          <div className="service-card" id="installation">
            <h3>Installation Services</h3>
            <p>
              We design and install elevators that match your building layout,
              traffic needs, and safety requirements. Our installers manage
              every step from planning to final commissioning.
            </p>
            <p>
              This includes site assessment, equipment selection, electrical
              integration, and final testing to make sure your elevator is ready
              for safe, reliable use.
            </p>
          </div>

          <div className="service-card" id="maintenance">
            <h3>Maintenance and Inspection</h3>
            <p>
              Regular maintenance prevents downtime and extends equipment life.
              Our preventive care includes safety checks, lubrication, cleaning,
              and system tuning to ensure smooth daily operation.
            </p>
            <p>
              We also offer inspection reporting, service logs, and proactive
              recommendations to keep your elevator compliant and operating at
              peak performance.
            </p>
          </div>

          <div className="service-card" id="repair">
            <h3>Repair and Emergency Response</h3>
            <p>
              When issues occur, our skilled technicians respond quickly to
              diagnose and repair faults. We restore service fast while keeping
              safety and reliability top of mind.
            </p>
            <p>
              Our emergency response covers door issues, control failures,
              motor problems, electrical faults, and any system malfunction that
              affects elevator availability.
            </p>
          </div>

          <div className="service-card" id="modernization">
            <h3>Modernization and Upgrades</h3>
            <p>
              Upgrade older elevators with modern controls, improved safety
              systems, energy-saving features, and enhanced passenger comfort.
              We help future-proof your vertical transport assets.
            </p>
            <p>
              Modernization can include new cabin interiors, digital displays,
              efficient drive systems, and safety upgrades to meet the latest
              standards.
            </p>
          </div>
        </div>

        <div className="service-block service-detail" id="why-maintenance">
          <h2>Why Maintenance Matters</h2>
          <p>
            Scheduled maintenance reduces the risk of unexpected failures,
            improves system efficiency, and keeps your elevator compliant with
            safety regulations. It is the best way to protect your investment
            and provide a smooth experience for users.
          </p>
          <p>
            A strong maintenance program also extends the working life of your
            elevator, lowers long-term repair costs, and supports steady
            performance for tenants, guests, and staff.
          </p>
        </div>
      </section>
    </div>
  );
}

export default ServicesPage;
