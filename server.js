const express = require("express");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const registroRoutes = require("./routes/registro");
const path = require("path");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();

// Conectar a la base de datos
connectDB();

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

// Middleware para verificar autenticación con JWT
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(403).json({ message: "Acceso denegado" });
    }

    try {
        const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Token inválido" });
    }
};

// Nueva ruta para verificar el token
app.get("/api/auth/verify", verifyToken, (req, res) => {
    res.json({ message: "Token válido" });
});

// Rutas principales
app.get("/", (req, res) => res.redirect("/login"));
app.get("/login", (req, res) => res.sendFile(path.join(__dirname, "public", "login.html")));
app.get("/register", (req, res) => res.sendFile(path.join(__dirname, "public", "register.html")));
app.get("/dashboard.html", verifyToken, (req, res) => res.sendFile(path.join(__dirname, "public", "dashboard.html")));

// Rutas API
app.use("/api/auth", authRoutes);
app.use("/api/registro", registroRoutes);

// Iniciar el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
