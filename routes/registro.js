const express = require('express');
const Registro = require('../models/registro');
const moment = require('moment-timezone');
const router = express.Router();

// Ruta para registrar entrada
router.post('/entrada', async (req, res) => {
    const { userId, deviceID, ubicacion, image } = req.body;

    try {
        // Verificar si el campo `image` está presente
        if (!image) {
            return res.status(400).json({ msg: 'La imagen es obligatoria' });
        }

        // Establece la fecha y hora actual en la zona horaria de Bogotá
        let fechaLocal = moment.tz("America/Bogota").subtract(5, 'hours');

        const nuevoRegistro = new Registro({
            userId,
            deviceID,
            ubicacion,
            fecha: fechaLocal.toDate(),
            tipo: 'entrada',
            image // Guardar la imagen en Base64
        });

        await nuevoRegistro.save();
        res.status(201).json({ msg: 'Entrada registrada exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al registrar la entrada' });
    }
});

// Ruta para registrar salida
router.post('/salida', async (req, res) => {
    const { userId, deviceID, ubicacion, image } = req.body;

    try {
        // Verificar si el campo `image` está presente
        if (!image) {
            return res.status(400).json({ msg: 'La imagen es obligatoria' });
        }

        // Establece la fecha y hora actual en la zona horaria de Bogotá
        let fechaLocal = moment.tz("America/Bogota").subtract(5, 'hours');

        const nuevoRegistro = new Registro({
            userId,
            deviceID,
            ubicacion,
            fecha: fechaLocal.toDate(),
            tipo: 'salida',
            image // Guardar la imagen en Base64
        });

        await nuevoRegistro.save();
        res.status(201).json({ msg: 'Salida registrada exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al registrar la salida' });
    }
});

module.exports = router;
