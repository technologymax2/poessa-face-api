import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const isLoggedIn = !!token;

  const navLinkClass = ({ isActive }) =>
    `block px-4 py-2 rounded-md transition duration-300 font-medium ${
      isActive
        ? "bg-blue-600 text-white"
        : "text-gray-700 hover:bg-blue-100 hover:text-blue-700"
    }`;

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setIsOpen(false);
      navigate("/login");
    }
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-bold text-blue-700">
            POESSA Face Verification
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-2">
            <NavLink to="/" className={navLinkClass}>Home</NavLink>
            
            {isLoggedIn && (
              <>
                <NavLink to="/register" className={navLinkClass}>Register</NavLink>
                <NavLink to="/verify" className={navLinkClass}>Verify</NavLink>
                <NavLink to="/dashboard" className={navLinkClass}>Dashboard</NavLink>
                <NavLink to="/renewal" className={navLinkClass}>Renewal</NavLink>
                <NavLink to="/reports" className={navLinkClass}>Reports</NavLink>
                <NavLink to="/patient-video/demo-room" className={navLinkClass}>Video Call</NavLink>
              </>
            )}

            {isLoggedIn ? (
              <button onClick={handleLogout} className="ml-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition font-medium">
                Logout
              </button>
            ) : (
              <Link to="/login" className="ml-4 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-md transition font-medium">
                Login
              </Link>
            )}
          </div>

          {/* Mobile Toggle Button */}
          <button className="md:hidden p-2" onClick={() => setIsOpen(!isOpen)}>
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? <path d="M6 18L18 6M6 6l12 12" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-1">
            <NavLink to="/" className={navLinkClass} onClick={() => setIsOpen(false)}>Home</NavLink>
            {isLoggedIn && (
              <>
                <NavLink to="/register" className={navLinkClass} onClick={() => setIsOpen(false)}>Register</NavLink>
                <NavLink to="/verify" className={navLinkClass} onClick={() => setIsOpen(false)}>Verify</NavLink>
                <NavLink to="/dashboard" className={navLinkClass} onClick={() => setIsOpen(false)}>Dashboard</NavLink>
                <NavLink to="/renewal" className={navLinkClass} onClick={() => setIsOpen(false)}>Renewal</NavLink>
                <NavLink to="/reports" className={navLinkClass} onClick={() => setIsOpen(false)}>Reports</NavLink>
                <NavLink to="/patient-video/demo-room" className={navLinkClass} onClick={() => setIsOpen(false)}>Pentioner Call</NavLink>
                <NavLink to="/video-verification"className={navLinkClass}>Answor Call</NavLink>
              </>
            )}
            <div className="pt-2">
              {isLoggedIn ? (
                <button onClick={handleLogout} className="w-full bg-red-600 text-white py-2 rounded-md">Logout</button>
              ) : (
                <Link to="/login" className="block text-center w-full bg-blue-700 text-white py-2 rounded-md" onClick={() => setIsOpen(false)}>Login</Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
