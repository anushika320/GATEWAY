// src/components/Footer.js
import React from 'react';
import '../styles/Footer.css';

function Footer() {
  return (
    <footer className="app-footer">
      &copy; {new Date().getFullYear()}{' '}
      <span>University of Vavuniya</span> – Security Gate Pass Management System.
    </footer>
  );
}

export default Footer;