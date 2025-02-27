const express = require('express');
const User = require('../models/User'); 
const jwt = require('jsonwebtoken'); 
const router = express.Router();

// Ruta para el registro de usuarios
router.post('/register', async (req, res) => {
    const { username, password, deviceID } = req.body; 

    try {
        // Verifica si ya existe un usuario con el mismo deviceID
        const existingUser = await User.findOne({ deviceID });
        if (existingUser) {
            return res.status(400).json({ msg: 'Ya hay un usuario registrado en este dispositivo' });
        }

        let user = new User({
            username,
            password,
            deviceID 
        });

        await user.save();
        res.status(201).json({ msg: 'Usuario creado exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al crear el usuario' });
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

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Contraseña incorrecta' });
        }

        // Verifica si el deviceID coincide
        if (user.deviceID !== deviceID) {
            return res.status(403).json({ msg: 'Este dispositivo no está autorizado' });
        }

        const payload = { userId: user._id };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Enviar el token y mensaje al cliente
        res.json({ token, msg: 'Inicio de sesión exitoso' });
    } catch (error) {
        console.error(error.message);
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
        console.error(error.message);
        res.status(500).send('Error en el servidor');
    }
});

app.post('/api/verificar-dispositivo', async (req, res) => {
    const { deviceID } = req.body;
    const usuario = await User.findOne({ deviceID });

    res.json({ autorizado: !!usuario });
});

module.exports = router;
