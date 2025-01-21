const express = require('express');
const router = express.Router();
const Registro = require('../models/registro');

// Guardar registro con foto
router.post('/', async (req, res) => {
    const { tipo, foto } = req.body;

    if (!tipo || !foto) {
        return res.status(400).json({ error: 'Tipo y foto son obligatorios' });
    }

    try {
        const registro = new Registro({
            usuario: req.user.username, // Usuario autenticado
            tipo,
            fecha: new Date(),
            ubicacion: { lat: req.body.lat, lng: req.body.lng },
            foto,
        });

        await registro.save();
        res.json({ message: 'Registro guardado con éxito' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al guardar el registro' });
    }
});
