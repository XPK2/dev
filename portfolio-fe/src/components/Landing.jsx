import React from 'react';
import bgImage from '../assets/bg.jpg';

const Landing = () => {
  return (
    <div className="landing-page fade-in" style={{ backgroundImage: `url(${bgImage})` }}>
      <div className="landing-overlay">
        <h1 className="landing-title" style={{ fontFamily: 'Playfair Display, serif', letterSpacing: '2px' }}>Lê Thu Hà</h1>
        <p className="landing-subtitle">Welcome</p>
      </div>
    </div>
  );
};

export default Landing;
