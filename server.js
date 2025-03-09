const express = require("express");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const registroRoutes = require("./routes/registro");
const path = require("path");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const fs = require("fs");

require("dotenv").config();

const app = express();

// Conectar a la base de datos
connectDB();

// Middleware para JSON
app.use(express.json({ limit: "10mb" })); // Aumentar el límite para imágenes

// Middleware para CORS
app.use(cors());

// 📂 Crear la carpeta 'uploads' si no existe
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Servir imágenes de la carpeta 'uploads'
app.use("/uploads", express.static(uploadDir));

// Middleware para servir archivos estáticos
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

// Nueva ruta para verificar el token desde el frontend
app.get("/api/auth/verify", verifyToken, (req, res) => {
    res.json({ message: "Token válido" });
});

// Redirigir la raíz a /login
app.get("/", (req, res) => {
    res.redirect("/login");
});

// Ruta para los archivos HTML
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

// Iniciar el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en el puerto ${PORT}`));
