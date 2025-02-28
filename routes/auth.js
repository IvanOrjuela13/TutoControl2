const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();

// Ruta para restablecer la contraseña
router.post('/reset-password', async (req, res) => {
    const { cedula, newPassword } = req.body;

    try {
        // Buscar al usuario por cédula
        const user = await User.findOne({ cedula });

        if (!user) {
            return res.status(404).json({ msg: 'Usuario no encontrado' });
        }

        // Validar que la nueva contraseña sea válida
        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ msg: 'La contraseña debe tener al menos 6 caracteres' });
        }

        // Encriptar la nueva contraseña
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        // Guardar el usuario con la nueva contraseña encriptada
        await user.save();

        // Enviar respuesta de éxito
        res.json({ msg: 'Contraseña actualizada exitosamente' });

    } catch (error) {
        console.error("Error al actualizar la contraseña:", error.message);
        res.status(500).json({ msg: 'Error en el servidor' });
    }
});

// Ruta para el registro de usuarios
router.post('/register', async (req, res) => {
    const { fullName, cedula, area, password, deviceID } = req.body;

    try {
        if (!fullName || !cedula || !area || !password || !deviceID) {
            return res.status(400).json({ msg: "Todos los campos son obligatorios" });
        }

        const existingUser = await User.findOne({ cedula });
        if (existingUser) {
            return res.status(400).json({ msg: 'Esta cédula ya está registrada' });
        }

        const existingDevice = await User.findOne({ deviceID });
        if (existingDevice) {
            return res.status(400).json({ msg: 'Ya hay un usuario registrado en este dispositivo' });
        }

        // Encriptar la contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullName,
            cedula,
            area,
            password: hashedPassword,
            deviceID
        });

        await newUser.save();
        res.status(201).json({ msg: 'Usuario creado exitosamente' });

    } catch (error) {
        console.error("Error al registrar usuario:", error);
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

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Contraseña incorrecta' });
        }

        if (user.deviceID !== deviceID) {
            return res.status(403).json({ msg: 'Este dispositivo no está autorizado' });
        }

        const payload = { userId: user._id };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token, msg: 'Inicio de sesión exitoso' });

    } catch (error) {
        console.error("Error en el servidor:", error.message);
        res.status(500).send('Error en el servidor');
    }
});

// Ruta para obtener el deviceID del usuario
router.get('/user/:cedula', async (req, res) => {
    const { cedula } = req.params;

    try {
        const user = await User.findOne({ cedula });
        if (!user) {
            return res.status(404).json({ msg: 'Usuario no encontrado' });
        }

        res.json({ deviceID: user.deviceID });

    } catch (error) {
        console.error("Error en el servidor:", error.message);
        res.status(500).send('Error en el servidor');
    }
});

module.exports = router;
