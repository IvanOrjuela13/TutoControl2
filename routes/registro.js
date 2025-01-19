const express = require('express');
const Registro = require('../models/registro');
const moment = require('moment-timezone');
const router = express.Router();

// Ruta para registrar entrada
router.post('/entrada', async (req, res) => {
    const { userId, deviceID, ubicacion } = req.body;

    try {
        // Establece la fecha y hora actual en la zona horaria de Bogotá y ajusta la conversión a UTC
        let fechaLocal = moment.tz("America/Bogota").subtract(5, 'hours');

        const nuevoRegistro = new Registro({
            userId,
            deviceID,
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
    const { userId, deviceID, ubicacion } = req.body;

    try {
        // Establece la fecha y hora actual en la zona horaria de Bogotá y ajusta la conversión a UTC
        let fechaLocal = moment.tz("America/Bogota").subtract(5, 'hours');

        const nuevoRegistro = new Registro({
            userId,
            deviceID,
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

// Ruta para buscar registros por tipo (entrada/salida) y fecha
router.get('/buscar', async (req, res) => {
    const { tipo, fecha } = req.query;

    // Validar que ambos parámetros existan
    if (!tipo || !fecha) {
        return res.status(400).json({ msg: 'Se requieren los parámetros tipo (entrada/salida) y fecha' });
    }

    try {
        // Parsear la fecha
        const fechaInicio = moment(fecha, 'YYYY-MM-DD').startOf('day').toDate();
        const fechaFin = moment(fecha, 'YYYY-MM-DD').endOf('day').toDate();

        const registros = await Registro.find({
            tipo: tipo,
            fecha: { $gte: fechaInicio, $lt: fechaFin }
        });

        if (registros.length === 0) {
            return res.status(404).json({ msg: 'No se encontraron registros' });
        }

        res.json(registros);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al buscar registros' });
    }
});

module.exports = router;
