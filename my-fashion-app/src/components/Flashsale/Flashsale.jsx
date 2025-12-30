import { useState, useEffect } from 'react';
import "./Flashsale.css";

const confettiConfig = Array.from({ length: 100 }).map(() => ({
  hue: Math.random() * 360, 
  xEnd: (Math.random() - 0.5) * 500, 
  yEnd: (Math.random() - 0.5) * 600, 
  duration: 2 + Math.random() * 2, 
}));

export default function Flashsale() {
  const [isCelebrating, setIsCelebrating] = useState(false);

  const calculateTimeLeft = () => {
    const difference = +new Date().setHours(24, 0, 0, 0) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearTimeout(timer);
  });

  return (
    <div
      className="banner"
      onMouseEnter={() => setIsCelebrating(true)}
      onMouseLeave={() => setIsCelebrating(false)}
    >
      <div className={`confetti-container ${isCelebrating ? 'active' : ''}`}>
        {confettiConfig.map((confetti, index) => (
          <div
            key={index}
            className="confetti-piece"
            style={{
              '--hue': confetti.hue,
              '--x-end': `${confetti.xEnd}px`,
              '--y-end': `${confetti.yEnd}px`,
              '--duration': `${confetti.duration}s`,
            }}
          />
        ))}
      </div>

      <div className="sale-badge">
        <span className="sale-badge-percent">50%</span>
        <span className="sale-badge-text">OFF</span>
      </div>

      <div className="banner-content">
        <h2 className="banner-subtitle">Hurry Up</h2>
        <h1 className="banner-title">Santa’s Mega Savings</h1>
        <div className="banner-countdown">
          <div className="countdown-box">
            <span className="countdown-number">{String(timeLeft.hours).padStart(2, '0')}</span>
            <span className="countdown-label">Hours</span>
          </div>
          <div className="countdown-box">
            <span className="countdown-number">{String(timeLeft.minutes).padStart(2, '0')}</span>
            <span className="countdown-label">Mins</span>
          </div>
          <div className="countdown-box">
            <span className="countdown-number">{String(timeLeft.seconds).padStart(2, '0')}</span>
            <span className="countdown-label">Secs</span>
          </div>
        </div>
        <a href="/shop/flash-sale" className="banner-btn">
          Shop Now
        </a>
      </div>
    </div>
  );
}