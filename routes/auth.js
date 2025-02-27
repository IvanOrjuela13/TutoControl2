const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const router = express.Router();
const bcrypt = require('bcryptjs');

// Ruta para restablecer la contraseña
router.post('/reset-password', async (req, res) => {
    const { username, newPassword } = req.body;

    try {
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(404).json({ msg: 'Usuario no encontrado' });
        }

        // Hashear la nueva contraseña antes de guardarla
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ msg: 'Contraseña actualizada exitosamente' });

    } catch (error) {
        console.error("Error al actualizar la contraseña:", error.message);
        res.status(500).json({ msg: 'Error en el servidor' });
    }
});

// Ruta para el registro de usuarios
router.post('/register', async (req, res) => {
    const { fullName, cedula, area, username, password, deviceID } = req.body;

    try {
        if (!fullName || !cedula || !area || !username || !password || !deviceID) {
            return res.status(400).json({ msg: "Todos los campos son obligatorios" });
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ msg: 'El nombre de usuario ya está en uso' });
        }

        const existingCedula = await User.findOne({ cedula });
        if (existingCedula) {
            return res.status(400).json({ msg: 'Esta cédula ya está registrada' });
        }

        const existingDevice = await User.findOne({ deviceID });
        if (existingDevice) {
            return res.status(400).json({ msg: 'Ya hay un usuario registrado en este dispositivo' });
        }

        // Hashear la contraseña antes de guardarla
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullName,
            cedula,
            area,
            username,
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
    const { username, password, deviceID } = req.body;

    try {
        let user = await User.findOne({ username });

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
router.get('/user/:username', async (req, res) => {
    const { username } = req.params;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ msg: 'Usuario no encontrado' });
        }

        res.json({ deviceID: user.deviceID });

    } catch (error) {
        console.error("Error en el servidor:", error.message);
        res.status(500).send('Error en el servidor');
    }
});

// Ruta para obtener la información del usuario autenticado (para la foto)
router.get('/user-info', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1]; // Obtener token del header
        if (!token) {
            return res.status(401).json({ msg: 'No autorizado' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select("fullName cedula username deviceID");

        if (!user) {
            return res.status(404).json({ msg: 'Usuario no encontrado' });
        }

        res.json(user);
    } catch (error) {
        console.error("Error al obtener la información del usuario:", error);
        res.status(500).json({ msg: 'Error en el servidor' });
    }
});

module.exports = router;
