import React, { useState, useEffect } from "react";
import "../styles/EnquiryForm.css";

function EnquiryForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    message: "",
    captcha: "",
  });

  const [captchaQuestion, setCaptchaQuestion] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const API_BASE_URL = process.env.REACT_APP_API_URL || "";

  // Fetch a CAPTCHA challenge from the backend. The answer is never sent to
  // the browser - only an opaque token the server uses to check it later.
  const generateCaptcha = () => {
    fetch("/api/captcha/")
      .then((res) => res.json())
      .then((data) => {
        setCaptchaQuestion(data.question || "");
        setCaptchaToken(data.token || "");
      })
      .catch((error) => {
        console.error("Error fetching CAPTCHA:", error);
      });
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // The CAPTCHA answer is verified server-side against captchaToken; we
    // just forward whatever the user typed and let the backend decide.
    const enquiryData = {
      name: formData.name,
      email: formData.email,
      mobile: formData.mobile,
      message: formData.message,
      captcha_token: captchaToken,
      captcha_answer: formData.captcha,
    };

    // Send to backend API. Keep relative URL in local dev; use env override for production.
    const enquiryUrl = `${API_BASE_URL}/api/enquiry/` || "/api/enquiry/";
    fetch(enquiryUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(enquiryData),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          const errorMessage =
            (data.captcha && data.captcha[0]) ||
            data.message ||
            data.error ||
            JSON.stringify(data) ||
            res.statusText;
          throw new Error(errorMessage);
        }
        return data;
      })
      .then((data) => {
        alert(data.message || "Form submitted! We will contact you soon.");
        // Reset form and fetch a fresh CAPTCHA (tokens are single-use)
        setFormData({ name: "", email: "", mobile: "", message: "", captcha: "" });
        generateCaptcha();
      })
      .catch((error) => {
        console.error("Error submitting enquiry:", error);
        alert(`Error submitting form: ${error.message}`);
        // The CAPTCHA token is single-use even on failure - fetch a new one
        setFormData((prev) => ({ ...prev, captcha: "" }));
        generateCaptcha();
      });
  };

  return (
    <div className="enquiry-section">
      <h2>For Quick Enquiry</h2>
      <form onSubmit={handleSubmit} className="enquiry-form">
        <div className="form-row">
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="tel"
            name="mobile"
            placeholder="Mobile No."
            value={formData.mobile}
            onChange={handleChange}
            required
          />
        </div>

        <textarea
          name="message"
          placeholder="Message"
          value={formData.message}
          onChange={handleChange}
          rows="4"
        ></textarea>

        <div className="captcha-section">
          <label>CAPTCHA</label>
          <div className="captcha-box">{captchaQuestion}</div>
          <input
            type="text"
            name="captcha"
            placeholder="Enter answer"
            value={formData.captcha}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="submit-btn">
          SUBMIT NOW
        </button>
        <p className="form-note">
          After clicking on submit team ADONAI ELEVATORS will connect with you.
        </p>
      </form>
    </div>
  );
}

export default EnquiryForm;