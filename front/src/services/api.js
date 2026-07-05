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
// Pensioners
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

// ✅ Your backend route is:
export const searchPensioner = (keyword) =>
  API.get(`/pensioners/search/${encodeURIComponent(keyword)}`);

export const updatePensioner = (id, formData) =>
  API.put(`/pensioners/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const deletePensioner = (id) =>
  API.delete(`/pensioners/${id}`);

// ==============================
// Face Verification
// ==============================

// ✅ Your backend route is:
// POST /api/verification
export const verifyPensioner = (formData) =>
  API.post("/verification", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });



export const createRenewal = (data) =>
  API.post("/renewals", data);

export const getCurrentRenewal = () =>
  API.get("/renewals/current");


// ==============================
// Dashboard
// ==============================

export const getDashboardStats = () =>
  API.get("/dashboard/stats");

export default API;
