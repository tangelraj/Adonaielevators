import React from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

function TopBar() {
  const navigate = useNavigate();

  return (
    <div className="topbar">
      <div className="topbar-contact">
        <div>📧 adonaielevators@gmail.com</div>
        <div>📞 +91-7760502630</div>
      </div>
      <button className="enquiry-btn" onClick={() => navigate("/contact")}>SUBMIT YOUR ENQUIRY</button>
    </div>
  );
}

export default TopBar;
