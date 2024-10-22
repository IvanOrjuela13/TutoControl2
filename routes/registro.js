const express = require('express');
const Registro = require('../models/registro');
const moment = require('moment-timezone');
const router = express.Router();

// Ruta para registrar entrada
router.post('/entrada', async (req, res) => {
    const { userId, deviceID, ubicacion } = req.body;

    try {
        // Obtén la fecha y hora con la zona horaria correcta
        let fechaLocal = moment().tz("America/Bogota");

        // Resta un día, suma 5 horas, añade 2 horas y 1 minuto para ajustar correctamente
        fechaLocal = fechaLocal
            .subtract(1, 'days')
            .add(5, 'hours')
            .add(2, 'hours')
            .add(1, 'minute') // Ajuste para corregir los 32 minutos extra
            .toDate();

        const nuevoRegistro = new Registro({
            userId,
            deviceID,
            ubicacion,
            fecha: fechaLocal, // Usa la fecha local ajustada
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
        // Obtén la fecha y hora con la zona horaria correcta
        let fechaLocal = moment().tz("America/Bogota");

        // Resta un día, suma 5 horas, añade 2 horas y 1 minuto para ajustar correctamente
        fechaLocal = fechaLocal
            .subtract(1, 'days')
            .add(5, 'hours')
            .add(2, 'hours')
            .add(1, 'minute') // Ajuste para corregir los 32 minutos extra
            .toDate();

        const nuevoRegistro = new Registro({
            userId,
            deviceID,
            ubicacion,
            fecha: fechaLocal, // Usa la fecha local ajustada
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
