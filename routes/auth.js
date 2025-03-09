const express = require('express');
const User = require('../models/User');
const Registro = require('../models/Registro'); // Importamos el modelo de registros
const jwt = require('jsonwebtoken');
const router = express.Router();

// Ruta para restablecer la contraseña
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

// Ruta para el registro de usuarios
router.post('/register', async (req, res) => {
    const { fullName, cedula, area, password, deviceID } = req.body;

    try {
        if (!fullName || !cedula || !area || !password || !deviceID) {
            return res.status(400).json({ msg: "Todos los campos son obligatorios" });
        }

        const existingUser = await User.findOne({ cedula });
        if (existingUser) return res.status(400).json({ msg: 'Esta cédula ya está registrada' });

        const existingDevice = await User.findOne({ deviceID });
        if (existingDevice) return res.status(400).json({ msg: 'Ya hay un usuario registrado en este dispositivo' });

        const newUser = new User({ fullName, cedula, area, password, deviceID });
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
        if (!user) return res.status(400).json({ msg: 'Usuario no encontrado' });

        const isMatch = await user.matchPassword(password);
        if (!isMatch) return res.status(400).json({ msg: 'Contraseña incorrecta' });

        if (user.deviceID !== deviceID) return res.status(403).json({ msg: 'Este dispositivo no está autorizado' });

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
        if (!user) return res.status(404).json({ msg: 'Usuario no encontrado' });

        res.json({ deviceID: user.deviceID });

    } catch (error) {
        console.error("Error en el servidor:", error.message);
        res.status(500).send('Error en el servidor');
    }
});

// 🚀 **Ruta para guardar un registro de entrada o salida con imagen**
router.post('/api/registro', async (req, res) => {
    const { userId, deviceID, cedula, ubicacion, imagen } = req.body;

    try {
        if (!userId || !deviceID || !cedula || !ubicacion || !imagen) {
            return res.status(400).json({ msg: "Todos los campos son obligatorios" });
        }

        const nuevoRegistro = new Registro({
            userId,
            deviceID,
            cedula,
            ubicacion,
            fecha: new Date(),
            imagen
        });

        await nuevoRegistro.save();
        res.status(201).json({ msg: "Registro guardado exitosamente" });

    } catch (error) {
        console.error("Error al guardar registro:", error);
        res.status(500).json({ msg: "Error en el servidor" });
    }
});

// 📜 **Ruta para obtener el historial de registros con filtro por fecha o cédula**
router.get('/api/registro/historial', async (req, res) => {
    try {
        const { fecha, cedula } = req.query;
        let filtro = {};

        if (fecha) {
            const start = new Date(`${fecha}T00:00:00.000Z`);
            const end = new Date(`${fecha}T23:59:59.999Z`);
            filtro.fecha = { $gte: start, $lte: end };
        }

        if (cedula) {
            filtro.cedula = cedula;
        }

        const registros = await Registro.find(filtro).sort({ fecha: -1 });
        res.json(registros);

    } catch (error) {
        console.error("Error al obtener el historial:", error);
        res.status(500).json({ msg: "Error en el servidor" });
    }
});

module.exports = router;
