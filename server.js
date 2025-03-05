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

// Middleware para JSON
app.use(express.json());

// Middleware para CORS
app.use(cors());

// Middleware para servir archivos estáticos (por ejemplo, login.html, dashboard.html)
app.use(express.static(path.join(__dirname, "public")));

// Middleware para verificar autenticación con JWT
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(403).json({ message: "Acceso denegado. No se proporcionó token." });
    }

    try {
        // Eliminar el prefijo "Bearer " si está presente
        const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
        req.user = decoded;  // Agregar los datos decodificados del token a la solicitud
        next();  // Continuar al siguiente middleware o ruta
    } catch (err) {
        return res.status(401).json({ message: "Token inválido o expirado." });
    }
};

// Ruta para verificar el token desde el frontend
app.get("/api/auth/verify", verifyToken, (req, res) => {
    res.json({ message: "Token válido" });
});

// Redirigir la raíz a /login
app.get("/", (req, res) => {
    res.redirect("/login");
});

// Ruta para servir login.html
app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "login.html"));
});

// Ruta para servir register.html
app.get("/register", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "register.html"));
});

// Ruta protegida para dashboard.html (solo accesible con token válido)
app.get("/dashboard.html", verifyToken, (req, res) => {
    res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

// Usar rutas de autenticación y registros
app.use("/api/auth", authRoutes);
app.use("/api/registro", registroRoutes);

// Iniciar el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
