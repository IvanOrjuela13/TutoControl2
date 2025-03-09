const express = require('express');
const Registro = require('../models/registro');
const moment = require('moment-timezone');
const router = express.Router();

// Ruta para registrar entrada
router.post('/entrada', async (req, res) => {
    // Incluimos "cedula" en la desestructuración
    const { userId, deviceID, cedula, ubicacion } = req.body;

    try {
        // Establece la fecha y hora actual en la zona horaria de Bogotá y ajusta la conversión a UTC
        let fechaLocal = moment.tz("America/Bogota").subtract(5, 'hours');

        const nuevoRegistro = new Registro({
            userId,
            deviceID,
            cedula, // Guardamos la cédula
            ubicacion,
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
router.post('/salida', async (req, res) => {
    // Incluimos "cedula" en la desestructuración
    const { userId, deviceID, cedula, ubicacion } = req.body;

    try {
        // Establece la fecha y hora actual en la zona horaria de Bogotá y ajusta la conversión a UTC
        let fechaLocal = moment.tz("America/Bogota").subtract(5, 'hours');

        const nuevoRegistro = new Registro({
            userId,
            deviceID,
            cedula, // Guardamos la cédula
            ubicacion,
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
