import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import './NavigationLoader.css';

const NavigationLoader = () => {
  const location = useLocation();
  const [show, setShow] = useState(false);
  const [hiding, setHiding] = useState(false);
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }

    setShow(true);
    setHiding(false);

    const fadeTimer = setTimeout(() => setHiding(true), 400);
    const hideTimer = setTimeout(() => {
      setShow(false);
      setHiding(false);
    }, 700);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, [location.pathname]);

  if (!show) return null;

  return (
    <div className={`nav-loader-overlay ${hiding ? 'nav-loader-hide' : ''}`}>
      <div className="nav-spinner" />
    </div>
  );
};

export default NavigationLoader;
