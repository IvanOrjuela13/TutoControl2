const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// Crear carpeta 'uploads' si no existe
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Configuración de almacenamiento de Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `registro_${Date.now()}${path.extname(file.originalname)}`);
    },
});

const upload = multer({ storage });

// Ruta para subir imágenes
router.post("/", upload.single("photo"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No se recibió ninguna imagen" });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ message: "Imagen guardada con éxito", url: imageUrl });
});

module.exports = router;
