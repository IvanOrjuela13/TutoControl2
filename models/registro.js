const express = require('express');
const router = express.Router();
const Registro = require('../models/registro');

// Guardar registro de entrada/salida
router.post('/', async (req, res) => {
    const { tipo, lat, lng } = req.body;

    if (!tipo || !lat || !lng) {
        return res.status(400).json({ error: 'Faltan datos requeridos (tipo, lat, lng).' });
    }

    try {
        const registro = new Registro({
            userId: req.user._id, // ID del usuario autenticado
            deviceID: req.user.deviceID, // ID del dispositivo registrado
            ubicacion: { lat, lng },
            fecha: new Date(), // Fecha actual en el servidor
            tipo, // 'entrada' o 'salida'
        });

        await registro.save();
        res.json({ message: `${tipo.charAt(0).toUpperCase() + tipo.slice(1)} registrada con éxito.` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al guardar el registro.' });
    }
});

// Buscar registros por tipo y fecha
router.get('/buscar', async (req, res) => {
    const { date, type } = req.query;

    if (!date || !type) {
        return res.status(400).json({ error: 'Fecha y tipo son requeridos.' });
    }

    try {
        const startOfDay = new Date(date);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const registros = await Registro.find({
            userId: req.user._id, // Filtrar por usuario autenticado
            tipo: type, // 'entrada' o 'salida'
            fecha: { $gte: startOfDay, $lte: endOfDay },
        });

        res.json({ registros });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al buscar los registros.' });
    }
});

module.exports = router;
