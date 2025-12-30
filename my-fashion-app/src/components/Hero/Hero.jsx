import "./Hero.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import Slider from "react-slick";
import hero1 from "../../images/hero1.png";
import hero2 from "../../images/hero2.png";
import hero3 from "../../images/hero3.png";

export default function Hero() {
  const settings = {
    dots: true,
    infinite: true,
    speed: 1000,
    autoplay: true,
    autoplaySpeed: 4000,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    fade: true,
    pauseOnHover: false,
  };

  const slides = [
    {
      image: hero1,
      title: "Prepare to change for the better.",
      subtitle: "Active Wear Collection",
      button: "Shop Now",
    },
    {
      image: hero2,
      title: "Special X'MAS Deals",
      subtitle: "Up to 50% Cashback",
      button: "Shop Now",
    },
    {
      image: hero3,
      title: "Where Culture Meets Fashion",
      subtitle: "Inspired by Sri Lanka",
      button: "Shop Now",
    },
  ];

  return (
    <section className="hero">
      <Slider {...settings} className="hero-slider">
        {slides.map((slide, i) => (

          <div key={i} className="hero-slide">
            <img src={slide.image} alt={`Slide ${i}`} className="hero-image" />
            <div className="hero-overlay"></div>
            <div className="hero-content">
              <h1>{slide.title}</h1>
              <h2>{slide.subtitle}</h2>
              <button className="hero-btn">{slide.button}</button>
            </div>
          </div>
        ))}
      </Slider>
    </section>
  );
}