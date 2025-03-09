const express = require("express");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const registroRoutes = require("./routes/registro");
const uploadRoutes = require("./routes/uploadRoutes"); // Nueva ruta para subir imágenes
const path = require("path");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();

// Conectar a la base de datos
connectDB();

// Middleware para JSON
app.use(express.json());

// Middleware para CORS
app.use(cors());

// Middleware para servir archivos estáticos
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // Servir imágenes guardadas

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

// Nueva ruta para verificar el token desde el frontend
app.get("/api/auth/verify", verifyToken, (req, res) => {
    res.json({ message: "Token válido" });
});

// Redirigir la raíz a /login
app.get("/", (req, res) => {
    res.redirect("/login");
});

// Rutas para archivos HTML
app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "login.html"));
});
app.get("/register", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "register.html"));
});
app.get("/dashboard.html", verifyToken, (req, res) => {
    res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

// Rutas de autenticación y registros
app.use("/api/auth", authRoutes);
app.use("/api/registro", registroRoutes);
app.use("/api/upload", uploadRoutes); // Nueva ruta para manejar subida de imágenes

// Iniciar el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en el puerto ${PORT}`));
