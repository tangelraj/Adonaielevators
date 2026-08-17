import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "../App.css";
import logo from "../logo.png";

function Navbar() {
  const [showMenu, setShowMenu] = useState(false);
  const navbarRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (navbarRef.current && !navbarRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <div className="navbar" ref={navbarRef}>
        <img src={logo} alt="Adonai Elevators logo" height="50" width="50" />
        <div className="logo">ADONAI ELEVATORS</div>
        <ul>
          <li><Link to="/">HOME</Link></li>
          <li><Link to="/about">ABOUT US</Link></li>
          <li className="mega-menu-parent">
            <button
              type="button"
              className="menu-toggle"
              onClick={() => setShowMenu((prev) => !prev)}
            >
              PRODUCTS
            </button>

            {showMenu && (
              <div className="mega-menu">
                <div>
                  <h3>Our Products</h3>
                  <Link to="/products/freight-elevators">Freight Elevators</Link>
                  <Link to="/products/home-elevators">Home Elevators</Link>
                  <Link to="/products/passenger-elevators">Passengers Elevators</Link>
                  <Link to="/products/automobile-elevators">Goods Elevators</Link>
                  <Link to="/products/dumb-waiters">Dumb Waiters</Link>
                  <Link to="/products/stretcher-elevators">Stairecase Elevators</Link>
                  <Link to="/products/aura-elevator">Wheel chair Elevators</Link>
                </div>

                <div>
                  <h3>About</h3>
                  <Link to="/about">About us</Link>
                  <Link to="/faqs">FAQs</Link>
                  <Link to="/blogs">Blogs</Link>
                  <Link to="/vision-mission">Vision & Mission</Link>
                  <Link to="/testimonials">Testimonials</Link>
                  <Link to="/events">Events & Exhibitions</Link>
                  <Link to="/designers">Architects and Designers</Link>
                </div>
              </div>
            )}
          </li>
          <li><Link to="/services">SERVICES</Link></li>
          <li><Link to="/designers">ARCHITECTS & DESIGNERS</Link></li>
          <li><Link to="/contact">CONTACT US</Link></li>
        </ul>
      </div>
      <div className="navbar-flash">
        <div className="navbar-flash-content">
          We offer free consultation at any time. Chat with us on WhatsApp at 7760502630. &nbsp; • &nbsp; We offer free consultation at any time. Chat with us on WhatsApp at 7760502630.
        </div>
      </div>
    </>
  );
}

export default Navbar;