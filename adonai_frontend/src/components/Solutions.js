import React, { useState, useEffect } from "react";
import "../styles/Solutions.css";

function Solutions() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const solutions = [
    {
      id: 1,
      title: "Goods Elevators",
      description: "Park smarter, park safe. Our innovative automobile elevators maximize your parking space.",
      image: "🚗",
    },
    {
      id: 2,
      title: "Dumbwaiters",
      description: "Our versatile dumbwaiters are compact and convenient, they streamline your daily tasks.",
      image: "📦",
    },
    {
      id: 3,
      title: "Special Purpose Elevators",
      description: "Tailored solutions for unique needs. From hospitals to hotels, our special-purpose elevators offer customized vertical transportation solutions.",
      image: "🏢",
    },
    {
      id: 4,
      title: "Home Elevators",
      description: "Our elevators are designed to enhance your home's aesthetics and functionality by making it future-proof.",
      image: "🏠",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % solutions.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [solutions.length]); // Added dependency

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % solutions.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + solutions.length) % solutions.length);
  };

  return (
    <div className="solutions-section">
      <h2>Our Solutions</h2>
      
      <div className="solutions-carousel">
        <button className="carousel-btn prev-btn" onClick={prevSlide}>❮</button>
        
        <div className="solutions-container">
          <div
            className="solutions-wrapper"
            style={{
              transform: `translateX(-${currentSlide * 100}%)`,
              display: "flex",
              transition: "transform 0.6s ease-in-out",
            }}
          >
            {solutions.map((solution) => (
              <div
                key={solution.id}
                className="solution-card active"
              >
                <div className="solution-image">{solution.image}</div>
                <h3>{solution.title}</h3>
                <p>{solution.description}</p>
                <button className="read-more-btn">Read More</button>
              </div>
            ))}
          </div>
        </div>
        
        <button className="carousel-btn next-btn" onClick={nextSlide}>❯</button>
      </div>

      <div className="carousel-dots">
        {solutions.map((_, index) => (
          <span
            key={index}
            className={`dot ${index === currentSlide ? "active" : ""}`}
            onClick={() => setCurrentSlide(index)}
          ></span>
        ))}
      </div>
    </div>
  );
}

export default Solutions;