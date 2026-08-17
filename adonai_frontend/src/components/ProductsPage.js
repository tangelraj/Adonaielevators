import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import TopBar from "./TopBar";
import Navbar from "./Navbar";
import freightLift from "../assets/freightlift.jpg";
import homeLift from "../assets/homelift.jpg";
import passengerLift from "../assets/passengerlift.jpg";
import goodsLift from "../assets/goodslift.jpg";
import dumbwaiter from "../assets/dumbwaiters.webp";
import stairCase from "../assets/staircase.webp";
import wheelchairLift from "../assets/wheelchair.jpg";

const products = [
  {
    id: "freight-elevators",
    title: "Freight Elevators",
    image: freightLift,
    description:
      "Heavy-duty elevators designed for transporting goods, machinery, and pallets safely within warehouses, factories, and logistics facilities.",
  },
  {
    id: "home-elevators",
    title: "Home Elevators",
    image: homeLift,
    description:
      "Luxury residential elevators that add comfort, accessibility, and modern convenience to private homes and villas.",
  },
  {
    id: "passenger-elevators",
    title: "Passenger Elevators",
    image: passengerLift,
    description:
      "High-performance elevators for commercial buildings, hotels, offices, and apartment towers that prioritize safety and smooth travel.",
  },
  {
    id: "automobile-elevators",
    title: "Goods Elevators",
    image: goodsLift,
    description:
      "Car lifts and parking elevators that maximize space and simplify vehicle storage in residential and commercial parking solutions.",
  },
  {
    id: "dumb-waiters",
    title: "Dumb Waiters",
    image: dumbwaiter,
    description:
      "Compact service elevators for transporting food, documents, and small cargo between floors in restaurants, hotels, and offices.",
  },
  {
    id: "staircase-elevators",
    title: "Staircase Elevators",
    image: stairCase,
    description:
      "Space-efficient elevator options designed to move people and goods across narrow shafts or stairwell-adjacent layouts.",
  },
  {
    id: "wheelchair-elevators",
    title: "Wheelchair Elevators",
    image: wheelchairLift,
    description:
      "Accessible lifts built for wheelchair users, ensuring safe and comfortable mobility for health care, public, and private spaces.",
  },
];

function ProductsPage() {
  const location = useLocation();

  useEffect(() => {
    const hash = location.hash.replace("#", "");
    const productId = hash || location.pathname.split("/").pop();

    if (productId && productId !== "products") {
      const element = document.getElementById(productId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [location]);

  return (
    <div>
      <TopBar />
      <Navbar />

      <section className="products-hero">
        <div className="products-hero-content">
          <h1>Elevator Products for Every Need</h1>
          <div className="hero-divider" />
          <p>
            Explore our full range of elevator systems. Each product is built
            with trusted safety standards, reliable operation, and intelligent
            design.
          </p>
        </div>
      </section>

      <section className="products-section page-section">
        <div className="products-grid">
          {products.map((product) => (
            <article key={product.id} className="product-card" id={product.id}>
              <img
                className="product-image"
                src={product.image}
                alt={product.title}
              />
              <div className="product-content">
                <h3>{product.title}</h3>
                <p>{product.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default ProductsPage;
