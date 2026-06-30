
// src/services/api.js

import axios from "axios";

// Change this when deploying
const API = axios.create({
  baseURL: "http://localhost:10000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically attach JWT token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ==============================
// Authentication
// ==============================

export const login = (data) =>
  API.post("/auth/login", data);

// ==============================
// Pensioner
// ==============================

// Register Pensioner
export const registerPensioner = (formData) =>
  API.post("/pensioners/register", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

// Get All Pensioners
export const getPensioners = () =>
  API.get("/pensioners");

// Get One Pensioner
export const getPensioner = (id) =>
  API.get(`/pensioners/${id}`);

// Search Pensioner
export const searchPensioner = (search) =>
  API.get(`/pensioners/search?search=${search}`);

// Update Pensioner
export const updatePensioner = (id, data) =>
  API.put(`/pensioners/${id}`, data);

// Delete Pensioner
export const deletePensioner = (id) =>
  API.delete(`/pensioners/${id}`);

// ==============================
// Face Verification
// ==============================

export const verifyPensioner = (formData) =>
  API.post("/verify", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

// ==============================
// Dashboard
// ==============================

export const getDashboardStats = () =>
  API.get("/dashboard/stats");

// ==============================
// Export Axios Instance
// ==============================

export default API;

