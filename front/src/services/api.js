// src/services/api.js

import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
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

export const registerPensioner = (formData) =>
  API.post("/pensioners/register", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const getPensioners = () =>
  API.get("/pensioners");

export const getPensioner = (id) =>
  API.get(`/pensioners/${id}`);

export const searchPensioner = (search) =>
  API.get(`/pensioners/search?search=${search}`);

export const updatePensioner = (id, data) =>
  API.put(`/pensioners/${id}`, data);

export const deletePensioner = (id) =>
  API.delete(`/pensioners/${id}`);

// ==============================
// Face Verification
// ==============================

export const verifyPensioner = (formData) =>
  API.post("/verification/verify", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

// ==============================
// Dashboard
// ==============================

export const getDashboardStats = () =>
  API.get("/dashboard/stats");

export default API;