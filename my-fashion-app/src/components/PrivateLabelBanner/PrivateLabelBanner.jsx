import './PrivateLabelBanner.css';


import corporateTshirtImage from '../../images/corporate.png';

export default function PrivateLabelBanner() {
  return (
    <section className="private-label-container">
      <div className="pl-text-content">
        <span className="pl-eyebrow">YOUR BRAND, OUR EXPERTISE</span>
        <h1 className="pl-title">
          Elevate Your Brand with Custom Apparel
        </h1>
        <p className="pl-description">
          From corporate events to staff uniforms, we provide premium private labeling services. We handle everything from design to production, delivering high-quality, custom-branded apparel that represents your business perfectly.
        </p>
        <a href="/contact" className="pl-cta-button">
          Start Your Project &rarr;
        </a>
      </div>
      <div className="pl-image-content">
        <img src={corporateTshirtImage} alt="Professional wearing custom corporate t-shirt" />
      </div>
    </section>
  );
}