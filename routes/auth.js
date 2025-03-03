const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const router = express.Router();

router.post('/reset-password', async (req, res) => {
    const { cedula, newPassword } = req.body;
    try {
        const user = await User.findOne({ cedula });
        if (!user) return res.status(404).json({ msg: 'Usuario no encontrado' });
        user.password = newPassword;
        await user.save();
        res.json({ msg: 'Contraseña actualizada exitosamente' });
    } catch (error) {
        console.error("Error al actualizar la contraseña:", error.message);
        res.status(500).json({ msg: 'Error en el servidor' });
    }
});

router.post('/register', async (req, res) => {
    const { fullName, cedula, area, password } = req.body;
    try {
        if (!fullName || !cedula || !area || !password) {
            return res.status(400).json({ msg: "Todos los campos son obligatorios" });
        }
        const existingUser = await User.findOne({ cedula });
        if (existingUser) return res.status(400).json({ msg: 'Esta cédula ya está registrada' });
        const newUser = new User({ fullName, cedula, area, password });
        await newUser.save();
        res.status(201).json({ msg: 'Usuario creado exitosamente' });
    } catch (error) {
        console.error("Error al registrar usuario:", error);
        res.status(500).json({ msg: 'Error en el servidor' });
    }
});

router.post('/login', async (req, res) => {
    const { cedula, password, deviceID } = req.body;
    try {
        let user = await User.findOne({ cedula });
        if (!user) return res.status(400).json({ msg: 'Usuario no encontrado' });
        const isMatch = await user.matchPassword(password);
        if (!isMatch) return res.status(400).json({ msg: 'Contraseña incorrecta' });
        if (user.deviceID && user.deviceID !== deviceID) {
            return res.status(403).json({ msg: 'Este dispositivo no está autorizado' });
        }
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

router.get('/user/:cedula', async (req, res) => {
    const { cedula } = req.params;
    try {
        const user = await User.findOne({ cedula });
        if (!user) return res.status(404).json({ msg: 'Usuario no encontrado' });
        res.json({ deviceID: user.deviceID });
    } catch (error) {
        console.error("Error en el servidor:", error.message);
        res.status(500).send('Error en el servidor');
    }
});

module.exports = router;
