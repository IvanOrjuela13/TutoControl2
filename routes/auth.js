const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Login
router.post('/login', async (req, res) => {
    const { cedula, password } = req.body;

    try {
        const user = await User.findOne({ cedula });
        if (!user) return res.status(400).json({ msg: 'Usuario no encontrado' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Contraseña incorrecta' });

        // Si el usuario no tiene un Device ID, generarlo y guardarlo en la BD
        if (!user.deviceID) {
            user.deviceID = 'device-' + Date.now();
            await user.save();
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token, deviceID: user.deviceID, msg: 'Inicio de sesión exitoso' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Error en el servidor' });
    }
});

module.exports = router;
