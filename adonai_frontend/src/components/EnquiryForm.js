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
  const [captchaAnswer, setCaptchaAnswer] = useState("");

  // Generate random CAPTCHA on component mount and after submission
  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const operators = ["+", "-", "*"];
    const operator = operators[Math.floor(Math.random() * operators.length)];

    let answer;
    if (operator === "+") answer = num1 + num2;
    else if (operator === "-") answer = num1 - num2;
    else answer = num1 * num2;

    setCaptchaQuestion(`${num1} ${operator} ${num2}`);
    setCaptchaAnswer(answer.toString());
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
    // Validate captcha
    if (formData.captcha !== captchaAnswer) {
      alert("CAPTCHA answer is incorrect");
      return;
    }
    // Prepare data to send (without captcha)
    const enquiryData = {
      name: formData.name,
      email: formData.email,
      mobile: formData.mobile,
      message: formData.message,
    };

    // Send to backend API (use relative URL so dev server proxy works)
    fetch("/api/enquiry/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(enquiryData),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          const errorMessage = data.message || data.error || JSON.stringify(data) || res.statusText;
          throw new Error(errorMessage);
        }
        return data;
      })
      .then((data) => {
        alert(data.message || "Form submitted! We will contact you soon.");
        // Reset form and generate new CAPTCHA
        setFormData({ name: "", email: "", mobile: "", message: "", captcha: "" });
        generateCaptcha();
      })
      .catch((error) => {
        console.error("Error submitting enquiry:", error);
        alert(`Error submitting form: ${error.message}. Make sure the backend is running on localhost:8000.`);
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