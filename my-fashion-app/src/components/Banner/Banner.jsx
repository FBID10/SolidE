import './ThreeBannerRow.css';
import { Link } from 'react-router-dom';

import bannerImg1 from '../../images/menbanner.png';
import bannerImg2 from '../../images/womenbanner.png';
import bannerImg3 from '../../images/accessories.png';

const bannerData = [
  {
    image: bannerImg1,
    title: 'Men\'s Collection',
    subtitle: 'Shop Now',
    link: '/collections/men'
  },
  {
    image: bannerImg2,
    title: 'Women\'s Style',
    subtitle: 'Shop Now',
    link: '/collections/women'
  },
  {
    image: bannerImg3,
    title: 'Accessories',
    subtitle: 'Shop Now',
    link: '/collections/accessories'
  }
];

export default function ThreeBannerRow() {
  return (
    <section className="banner-row-container">
      {bannerData.map((banner, index) => (
        <Link key={index} to={banner.link} className="banner-item" onClick={() => {
          try { window.scrollTo({ top: 0, left: 0, behavior: 'auto' }); } catch (e) { window.scrollTo(0,0); }
        }}>
          <img src={banner.image} alt={banner.title} className="banner-bg-image" />
          <div className="banner-overlay"></div>
          <div className="banner-content">
            <h2 className="banner-title">{banner.title}</h2>
            <p className="banner-subtitle">{banner.subtitle} &rarr;</p>
          </div>
        </Link>
      ))}
    </section>
  );
}