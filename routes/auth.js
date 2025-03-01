const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();

// Ruta para restablecer la contraseña
router.post('/reset-password', async (req, res) => {
    const { cedula, newPassword } = req.body;

    try {
        const user = await User.findOne({ cedula });

        if (!user) {
            return res.status(404).json({ msg: 'Usuario no encontrado' });
        }

        // Encriptar la nueva contraseña antes de guardarla
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ msg: 'Contraseña actualizada exitosamente' });

    } catch (error) {
        console.error("Error al actualizar la contraseña:", error.message);
        res.status(500).json({ msg: 'Error en el servidor' });
    }
});

// Ruta para el inicio de sesión
router.post('/login', async (req, res) => {
    const { cedula, password, deviceID } = req.body;

    try {
        let user = await User.findOne({ cedula });

        if (!user) {
            return res.status(400).json({ msg: 'Usuario no encontrado' });
        }

        // Verificar la contraseña
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Contraseña incorrecta' });
        }

        // Validar si el dispositivo es el registrado
        if (user.deviceID && user.deviceID !== deviceID) {
            return res.status(403).json({ msg: 'Este dispositivo no está autorizado' });
        }

        // Si no tiene un `deviceID`, se le asigna uno
        if (!user.deviceID) {
            user.deviceID = deviceID;
            await user.save();
        }

        const payload = { userId: user._id };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token, msg: 'Inicio de sesión exitoso' });

    } catch (error) {
        console.error("Error en el servidor:", error.message);
        res.status(500).send('Error en el servidor');
    }
});

module.exports = router;
