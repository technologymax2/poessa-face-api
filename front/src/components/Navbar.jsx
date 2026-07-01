import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  // ተጠቃሚው መግባቱን እና አለመግባቱን ከ localStorage ቼክ እናደርጋለን
  const token = localStorage.getItem("token");
  const isLoggedIn = !!token;

  const navLinkClass = ({ isActive }) =>
    `block px-4 py-2 rounded-md transition duration-300 font-medium ${
      isActive
        ? "bg-blue-600 text-white"
        : "text-gray-700 hover:bg-blue-100 hover:text-blue-700"
    }`;

  // ከሲስተሙ የመውጫ (Logout) ተግባር
  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (!confirmLogout) return;

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsOpen(false);
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-blue-700">
            POESSA Face Verification
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-2">
            <NavLink to="/" className={navLinkClass}>
              Home
            </NavLink>

            {/* ተጠቃሚው ከገባ ብቻ እነዚህ ሊንኮች እንዲታዩ እናደርጋለን */}
            {isLoggedIn && (
              <>
                <NavLink to="/register" className={navLinkClass}>
                  Register
                </NavLink>
                <NavLink to="/verify" className={navLinkClass}>
                  Verify
                </NavLink>
                <NavLink to="/dashboard" className={navLinkClass}>
                  Dashboard
                </NavLink>
              </>
            )}

            {/* ሁኔታን መሠረት ያደረገ የአዝራር አቀራረብ (Conditional Action Button) */}
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="ml-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition font-medium"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                className="ml-4 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-md transition font-medium"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Toggle Button */}
          <button
            className="md:hidden text-gray-700 focus:outline-none p-2 rounded-md hover:bg-gray-100"
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
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 pt-2 border-t border-gray-100 space-y-1">
            <NavLink to="/" className={navLinkClass} onClick={() => setIsOpen(false)}>
              Home
            </NavLink>

            {isLoggedIn && (
              <>
                <NavLink to="/register" className={navLinkClass} onClick={() => setIsOpen(false)}>
                  Register
                </NavLink>
                <NavLink to="/verify" className={navLinkClass} onClick={() => setIsOpen(false)}>
                  Verify
                </NavLink>
                <NavLink to="/dashboard" className={navLinkClass} onClick={() => setIsOpen(false)}>
                  Dashboard
                </NavLink>
              </>
            )}

            <div className="pt-4 px-4">
              {isLoggedIn ? (
                <button
                  onClick={handleLogout}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-md transition font-medium"
                >
                  Logout
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="block text-center w-full bg-blue-700 hover:bg-blue-800 text-white py-2 rounded-md transition font-medium"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;