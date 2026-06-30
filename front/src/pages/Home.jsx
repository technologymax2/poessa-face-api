
// src/pages/Home.jsx

import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

const Home = () => {
  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-100">

        {/* Hero Section */}
        <div className="bg-blue-700 text-white py-16">
          <div className="max-w-6xl mx-auto px-6 text-center">

            <h1 className="text-5xl font-bold mb-4">
              POESSA Pensioner Face Verification System
            </h1>

            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Register pensioners, verify their identity using facial recognition
              and liveness detection, and manage verification records securely.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">

              <Link
                to="/register"
                className="bg-white text-blue-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100"
              >
                Register Pensioner
              </Link>

              <Link
                to="/verify"
                className="bg-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-green-700"
              >
                Verify Identity
              </Link>

            </div>

          </div>
        </div>

        {/* Features */}
        <div className="max-w-6xl mx-auto px-6 py-12">

          <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">
            System Features
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-5xl mb-4 text-center">📝</div>

              <h3 className="text-xl font-bold text-center mb-3">
                Register Pensioners
              </h3>

              <p className="text-gray-600 text-center">
                Record pensioner information including personal details,
                Fayda Number, pension information, and registration photo.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-5xl mb-4 text-center">😊</div>

              <h3 className="text-xl font-bold text-center mb-3">
                Face Verification
              </h3>

              <p className="text-gray-600 text-center">
                Compare a live selfie with the registered image using
                facial recognition technology.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-5xl mb-4 text-center">🛡️</div>

              <h3 className="text-xl font-bold text-center mb-3">
                Liveness Detection
              </h3>

              <p className="text-gray-600 text-center">
                Prevent spoofing by checking that the user is physically
                present before marking them as verified.
              </p>
            </div>

          </div>

        </div>

        {/* Quick Actions */}
        <div className="max-w-6xl mx-auto px-6 pb-12">

          <h2 className="text-3xl font-bold text-center mb-8">
            Quick Actions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

            <Link
              to="/register"
              className="bg-blue-600 text-white rounded-xl p-6 text-center hover:bg-blue-700 transition"
            >
              <div className="text-4xl mb-3">📝</div>
              <h3 className="font-bold text-lg">
                Register
              </h3>
            </Link>

            <Link
              to="/verify"
              className="bg-green-600 text-white rounded-xl p-6 text-center hover:bg-green-700 transition"
            >
              <div className="text-4xl mb-3">📷</div>
              <h3 className="font-bold text-lg">
                Verify
              </h3>
            </Link>

            <Link
              to="/dashboard"
              className="bg-purple-600 text-white rounded-xl p-6 text-center hover:bg-purple-700 transition"
            >
              <div className="text-4xl mb-3">📊</div>
              <h3 className="font-bold text-lg">
                Dashboard
              </h3>
            </Link>

            <Link
              to="/login"
              className="bg-gray-700 text-white rounded-xl p-6 text-center hover:bg-gray-800 transition"
            >
              <div className="text-4xl mb-3">🔐</div>
              <h3 className="font-bold text-lg">
                Login
              </h3>
            </Link>

          </div>

        </div>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-6">
          <div className="max-w-6xl mx-auto px-6 text-center">

            <p className="text-lg font-semibold">
              POESSA Pensioner Face Verification System
            </p>

            <p className="text-gray-400 mt-2">
              © {new Date().getFullYear()} All Rights Reserved.
            </p>

          </div>
        </footer>

      </div>
    </>
  );
};

export default Home;

