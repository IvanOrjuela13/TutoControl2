const express = require('express');
const Registro = require('../models/registro');
const moment = require('moment-timezone');
const router = express.Router();

// Ruta para registrar entrada
router.post('/entrada', async (req, res) => {
    const { userId, deviceID, ubicacion } = req.body;

    try {
        // Establece la fecha y hora a 26 de octubre de 2024, 2:43 PM en Bogotá
        let fechaLocal = moment.tz("2024-10-26 14:43", "America/Bogota");

        // Resta 5 horas para ajustar la hora al formato UTC
        fechaLocal.subtract(5, 'hours');

        // Suma 6 minutos
        fechaLocal.add(6, 'minutes');

        const nuevoRegistro = new Registro({
            userId,
            deviceID,
            ubicacion,
            fecha: fechaLocal.toDate(), // Usa la fecha local ajustada
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
    const { userId, deviceID, ubicacion } = req.body;

    try {
        // Establece la fecha y hora a 26 de octubre de 2024, 2:43 PM en Bogotá
        let fechaLocal = moment.tz("2024-10-26 14:43", "America/Bogota");

        // Resta 5 horas para ajustar la hora al formato UTC
        fechaLocal.subtract(5, 'hours');

        // Suma 6 minutos
        fechaLocal.add(6, 'minutes');

        const nuevoRegistro = new Registro({
            userId,
            deviceID,
            ubicacion,
            fecha: fechaLocal.toDate(), // Usa la fecha local ajustada
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
