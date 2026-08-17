import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import AboutPage from "./components/AboutPage";
import ArchitectsDesigners from "./components/ArchitectsDesigners";
import ContactPage from "./components/ContactPage";
import FAQ from "./components/FAQ";
import Footer from "./components/Footer";
import ProductsPage from "./components/ProductsPage";
import ServicesPage from "./components/ServicesPage";
import WhatsAppButton from "./components/WhatsAppButton";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/products/*" element={<ProductsPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/designers" element={<ArchitectsDesigners />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/faqs" element={<FAQ />} />
      </Routes>
      <Footer />
      <WhatsAppButton />
    </Router>
  );
}

export default App;