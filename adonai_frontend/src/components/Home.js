import React from "react";
import TopBar from "./TopBar";
import Navbar from "./Navbar";
import Hero from "./Hero";
import EnquiryForm from "./EnquiryForm";
import Solutions from "./Solutions";


function Home() {
  return (
    <div>
      <TopBar />
      <Navbar />
      <Hero />
      <EnquiryForm />
      <Solutions />
      
    </div>
  );
}

export default Home;