const express = require('express');
const router = express.Router();
const Registro = require('../models/registro'); // Modelo de la base de datos

// Ruta para buscar registros por fecha y tipo
router.get('/buscar', async (req, res) => {
    const { date, type } = req.query;

    try {
        const startDate = new Date(date);
        const endDate = new Date(date);
        endDate.setDate(endDate.getDate() + 1);

        const registros = await Registro.find({
            tipo: type,
            fecha: { $gte: startDate, $lt: endDate },
        });

        res.json({ registros });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al buscar registros.' });
    }
});

module.exports = router;
