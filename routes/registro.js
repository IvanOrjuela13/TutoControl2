const express = require('express');
const Registro = require('../models/registro');
const moment = require('moment-timezone');
const router = express.Router();

// Ruta para registrar entrada
router.post('/entrada', async (req, res) => {
    const { userId, deviceID, ubicacion } = req.body;

    try {
        // Obtén la fecha y hora con la zona horaria de Bogotá
        let fechaLocal = moment().tz("America/Bogota");

        // Resta dos días
        fechaLocal.subtract(2, 'days');

        // Establece la hora a las 10 PM del día ajustado
        fechaLocal.set({ hour: 22, minute: 0, second: 0, millisecond: 0 }); // Ajustar a las 22:00

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
        // Obtén la fecha y hora con la zona horaria de Bogotá
        let fechaLocal = moment().tz("America/Bogota");

        // Resta dos días
        fechaLocal.subtract(2, 'days');

        // Establece la hora a las 10 PM del día ajustado
        fechaLocal.set({ hour: 22, minute: 0, second: 0, millisecond: 0 }); // Ajustar a las 22:00

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
