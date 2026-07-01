import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom"; // Link እዚህ ጋር ተጨምሯል

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Verify from "./pages/Verify";
import Dashboard from "./pages/Dashboard";

// Components
import PrivateRoute from "./components/PrivateRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/register" element={<Register />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>

        {/* 404 Page */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
              <div className="text-center bg-white p-8 rounded-xl shadow-md max-w-md w-full">
                <h1 className="text-6xl font-bold text-red-600">404</h1>
                <p className="text-2xl mt-4 font-semibold text-gray-800">Page Not Found</p>
                <p className="text-gray-500 mt-2">The page you are looking for doesn't exist or has been moved.</p>
                
                {/* እዚህ ጋር የነበረው <a> ታግ ወደ <Link> ተቀይሯል 
                  ይህም ገጹ ያለ ምንም መቆራረጥ (No Page Reload) በፍጥነት እንዲቀየር ያደርጋል
                */}
                <Link
                  to="/"
                  className="inline-block mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                >
                  Go Home
                </Link>
              </div>
            </div>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;