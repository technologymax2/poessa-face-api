
// src/components/Navbar.jsx

import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinkClass = ({ isActive }) =>
    `block px-4 py-2 rounded-md transition duration-300 ${
      isActive
        ? "bg-blue-600 text-white"
        : "text-gray-700 hover:bg-blue-100 hover:text-blue-700"
    }`;

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to="/"
            className="text-2xl font-bold text-blue-700"
          >
            POESSA Face Verification
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-3">
            <NavLink to="/" className={navLinkClass}>
              Home
            </NavLink>

            <NavLink to="/register" className={navLinkClass}>
              Register
            </NavLink>

            <NavLink to="/verify" className={navLinkClass}>
              Verify
            </NavLink>

            <NavLink to="/dashboard" className={navLinkClass}>
              Dashboard
            </NavLink>
          </div>

          {/* Mobile Button */}
          <button
            className="md:hidden text-gray-700 focus:outline-none"
            onClick={() => setIsOpen(!isOpen)}
          >
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4">
            <NavLink
              to="/"
              className={navLinkClass}
              onClick={() => setIsOpen(false)}
            >
              Home
            </NavLink>

            <NavLink
              to="/register"
              className={navLinkClass}
              onClick={() => setIsOpen(false)}
            >
              Register
            </NavLink>

            <NavLink
              to="/verify"
              className={navLinkClass}
              onClick={() => setIsOpen(false)}
            >
              Verify
            </NavLink>

            <NavLink
              to="/dashboard"
              className={navLinkClass}
              onClick={() => setIsOpen(false)}
            >
              Dashboard
            </NavLink>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

