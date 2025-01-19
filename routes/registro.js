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

// Ruta para consultar registros (entrada/salida) por tipo y fecha
router.get('/consultar', async (req, res) => {
    const { tipo, fecha } = req.query;

    try {
        // Si no se envía tipo o fecha, se devuelve un mensaje de error
        if (!tipo || !fecha) {
            return res.status(400).json({ msg: 'Tipo y fecha son necesarios para la consulta.' });
        }

        // Buscar registros por tipo (entrada/salida) y fecha
        const registros = await Registro.find({
            tipo,
            fecha: { $regex: `^${fecha}` } // Filtro por fecha específica (inicio de la fecha)
        }).populate('userId', 'nombre'); // Opcional: mostrar nombre del usuario

        // Si no se encuentran registros
        if (registros.length === 0) {
            return res.json({ success: false, message: 'No se encontraron registros.' });
        }

        // Responder con los registros encontrados
        res.json({ success: true, registros });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error al consultar los registros.' });
    }
});

module.exports = router;
