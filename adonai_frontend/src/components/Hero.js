import React from "react";
import "../App.css";
import heroVideo from "../assets/vecteezy_modern-white-lobby-with-glass-doors-and-potted-plants_74477623.mov";

function Hero() {
  return (
    <div className="hero">
      {/* background video */}
      <video
        className="hero-video"
        src={heroVideo}
        autoPlay
        muted
        loop
        playsInline
      />
      <div className="hero-content">
        <h1>ADONAI ELEVATORS</h1>
        <p>Premium Elevator Solutions</p>
      </div>
    </div>
  );
}

export default Hero;