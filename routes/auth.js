const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Registro de usuario
router.post('/register', async (req, res) => {
    try {
        const { fullName, cedula, area, password, deviceID } = req.body;

        // Verificar si la cédula ya está registrada
        const existingUser = await User.findOne({ cedula });
        if (existingUser) {
            return res.status(400).json({ msg: 'La cédula ya está registrada' });
        }

        // Encriptar contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Crear nuevo usuario
        const newUser = new User({
            fullName,
            cedula,
            area,
            password: hashedPassword,
            deviceID: deviceID || null // Permitimos que no tenga deviceID
        });

        await newUser.save();

        res.json({ msg: 'Registro exitoso' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error en el servidor' });
    }
});

// Inicio de sesión
router.post('/login', async (req, res) => {
    try {
        const { cedula, password } = req.body;

        const user = await User.findOne({ cedula });
        if (!user) {
            return res.status(400).json({ msg: 'Usuario no encontrado' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Contraseña incorrecta' });
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ msg: 'Inicio de sesión exitoso', token });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error en el servidor' });
    }
});

module.exports = router;
