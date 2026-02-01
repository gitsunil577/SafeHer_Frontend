import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h4>SafeHer</h4>
            <p>Empowering women with instant emergency assistance and real-time support.</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/volunteer/register">Become a Volunteer</Link></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Support</h4>
            <ul>
              <li><Link to="/help">Help Center</Link></li>
              <li><Link to="/safety-tips">Safety Tips</Link></li>
              <li><Link to="/faq">FAQ</Link></li>
              <li><Link to="/privacy">Privacy Policy</Link></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Emergency</h4>
            <ul>
              <li>Emergency: 911</li>
              <li>Women Helpline: 1091</li>
              <li>Police: 100</li>
              <li>Ambulance: 102</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 SafeHer. All rights reserved. | Women Safety & Emergency Assistance Platform</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
