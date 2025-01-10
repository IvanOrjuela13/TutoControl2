const express = require('express');
const multer = require('multer');
const Registro = require('../models/registro');
const moment = require('moment-timezone');
const router = express.Router();

// Configuración de Multer para almacenar los archivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Carpeta donde se guardarán los archivos
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + file.originalname); // Nombre del archivo con su extensión
    }
});

// Filtrar los tipos de archivos permitidos (por ejemplo, imágenes)
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true); // Aceptar el archivo si es una imagen
    } else {
        cb(new Error('Solo se permiten imágenes'), false); // Rechazar el archivo si no es una imagen
    }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

// Ruta para registrar entrada
router.post('/entrada', upload.single('archivo'), async (req, res) => {
    const { userId, deviceID, ubicacion } = req.body;

    try {
        // Establece la fecha y hora actual en la zona horaria de Bogotá y ajusta la conversión a UTC
        let fechaLocal = moment.tz("America/Bogota").subtract(5, 'hours');

        const nuevoRegistro = new Registro({
            userId,
            deviceID,
            ubicacion,
            archivo: req.file ? req.file.path : null, // Guarda el path del archivo si existe
            fecha: fechaLocal.toDate(), // Usa la fecha ajustada en Bogotá
            tipo: 'entrada'
        });

        await nuevoRegistro.save();
        res.status(201).json({ msg: 'Entrada registrada exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al registrar la entrada' });
    }
});

// Ruta para registrar salida
router.post('/salida', upload.single('archivo'), async (req, res) => {
    const { userId, deviceID, ubicacion } = req.body;

    try {
        // Establece la fecha y hora actual en la zona horaria de Bogotá y ajusta la conversión a UTC
        let fechaLocal = moment.tz("America/Bogota").subtract(5, 'hours');

        const nuevoRegistro = new Registro({
            userId,
            deviceID,
            ubicacion,
            archivo: req.file ? req.file.path : null, // Guarda el path del archivo si existe
            fecha: fechaLocal.toDate(), // Usa la fecha ajustada en Bogotá
            tipo: 'salida'
        });

        await nuevoRegistro.save();
        res.status(201).json({ msg: 'Salida registrada exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al registrar la salida' });
    }
});

module.exports = router;
