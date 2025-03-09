const express = require("express");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const registroRoutes = require("./routes/registro");
const path = require("path");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const fs = require("fs");
require("dotenv").config();

const app = express();

// Conectar a la base de datos
connectDB();

// Middleware para JSON y CORS
app.use(express.json());
app.use(cors());

// Servir archivos estáticos
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

// Rutas de archivos HTML
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

// 🔥 NUEVA RUTA PARA SUBIR IMÁGENES A ImgBB 🔥
app.post("/api/upload-image", async (req, res) => {
    const API_KEY = "110255831c5acb46b500c0bd197338c2";
    const IMAGE_PATH = "./imagenes/registro.jpg"; // Asegúrate de que el archivo existe

    try {
        const imageData = fs.readFileSync(IMAGE_PATH, { encoding: "base64" });

        const response = await axios.post("https://api.imgbb.com/1/upload", null, {
            params: {
                key: API_KEY,
                image: imageData,
            },
        });

        if (response.data && response.data.data && response.data.data.url) {
            console.log("✅ Imagen subida con éxito:", response.data.data.url);
            res.json({ imageUrl: response.data.data.url });
        } else {
            console.log("❌ Error subiendo la imagen:", response.data);
            res.status(500).json({ error: "Error al subir la imagen" });
        }
    } catch (error) {
        console.error("❌ Error:", error);
        res.status(500).json({ error: "Error en el servidor" });
    }
});

// Iniciar el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en el puerto ${PORT}`));
