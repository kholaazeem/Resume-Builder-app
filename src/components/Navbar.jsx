import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-black border-bottom border-secondary mb-4">
      <div className="container">
        <Link className="navbar-brand fw-bold" style={{ letterSpacing: '2px' }} to="/">
          RESUME.BUILDER
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;