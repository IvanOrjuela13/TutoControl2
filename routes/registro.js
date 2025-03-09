const express = require("express");
const fs = require("fs");
const path = require("path");
const Registro = require("../models/registro");
const moment = require("moment-timezone");

const router = express.Router();

// 📂 Asegurar que la carpeta 'uploads' exista
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// 🟢 Ruta para registrar entrada con imagen
router.post("/entrada", async (req, res) => {
    const { userId, deviceID, cedula, ubicacion, image } = req.body;

    try {
        if (!userId) return res.status(400).json({ msg: "El userId es obligatorio" });
        if (!image) return res.status(400).json({ msg: "No se recibió la imagen" });

        // 🖼 Verificar formato base64 PNG
        if (!image.startsWith("data:image/png;base64,")) {
            return res.status(400).json({ msg: "Formato de imagen no válido (solo PNG permitido)" });
        }

        // 📸 Guardar la imagen en /uploads con nombre único
        const imagePath = path.join(uploadDir, `${userId}_${Date.now()}.png`);
        const base64Data = image.replace(/^data:image\/png;base64,/, ""); // Elimina el prefijo
        fs.writeFileSync(imagePath, base64Data, "base64");

        // 🕒 Guardar la fecha en Bogotá
        let fechaLocal = moment.tz("America/Bogota").subtract(5, "hours");

        // 📜 Guardar el registro en MongoDB
        const nuevoRegistro = new Registro({
            userId,
            deviceID,
            cedula,
            ubicacion,
            fecha: fechaLocal.toDate(),
            tipo: "entrada",
            imagen: `/uploads/${path.basename(imagePath)}`, // Ruta accesible de la imagen
        });

        await nuevoRegistro.save();
        res.status(201).json({ msg: "Entrada registrada exitosamente", imagen: nuevoRegistro.imagen });
    } catch (error) {
        console.error("Error al registrar entrada:", error);
        res.status(500).json({ msg: "Error al registrar la entrada" });
    }
});

// 🟠 Ruta para registrar salida (sin imagen)
router.post("/salida", async (req, res) => {
    const { userId, deviceID, cedula, ubicacion } = req.body;

    try {
        if (!userId) return res.status(400).json({ msg: "El userId es obligatorio" });

        // 🕒 Guardar la fecha en Bogotá
        let fechaLocal = moment.tz("America/Bogota").subtract(5, "hours");

        // 📜 Guardar el registro en MongoDB
        const nuevoRegistro = new Registro({
            userId,
            deviceID,
            cedula,
            ubicacion,
            fecha: fechaLocal.toDate(),
            tipo: "salida",
        });

        await nuevoRegistro.save();
        res.status(201).json({ msg: "Salida registrada exitosamente" });
    } catch (error) {
        console.error("Error al registrar salida:", error);
        res.status(500).json({ msg: "Error al registrar la salida" });
    }
});

module.exports = router;
