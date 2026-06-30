const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

/* ==============================
   Middlewares
============================== */

app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true
}));

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({
    extended: true,
    limit: "20mb"
}));

/* ==============================
   Static Folder
============================== */

app.use(
    "/uploads",
    express.static(path.join(__dirname, "uploads"))
);

/* ==============================
   Routes
============================== */

const authRoutes = require("./routes/authRoutes");
const pensionerRoutes = require("./routes/pensionerRoutes");
const verificationRoutes = require("./routes/verificationRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/pensioners", pensionerRoutes);
app.use("/api/verification", verificationRoutes);
app.use("/api/dashboard", dashboardRoutes);

/* ==============================
   Health Check
============================== */

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        application: "POESSA Face Verification API",
        version: "1.0.0",
        status: "Running"
    });
});

/* ==============================
   404
============================== */

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});

/* ==============================
   Global Error Handler
============================== */

app.use((err, req, res, next) => {

    console.error(err.stack);

    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal Server Error"
    });

});

module.exports = app;