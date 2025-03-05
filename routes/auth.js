const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
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
        if (existingUser) {
            return res.status(400).json({ msg: 'Esta cédula ya está registrada' });
        }

        const existingDevice = await User.findOne({ deviceID });
        if (existingDevice) {
            return res.status(400).json({ msg: 'Ya hay un usuario registrado en este dispositivo' });
        }

        const newUser = new User({
            fullName,
            cedula,
            area,
            password,
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

        // Verificar la contraseña usando el método matchPassword
        const isMatch = await user.matchPassword(password);
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

// Nueva ruta para recuperar la actividad de cuenta
router.post('/recover-activity', async (req, res) => {
    const { cedula } = req.body;

    try {
        const user = await User.findOne({ cedula });

        if (!user) {
            return res.status(404).json({ msg: 'Usuario no encontrado' });
        }

        // Generar un código de seguridad basado en el Device ID
        const securityCode = generateSecurityCode(user.deviceID);

        // Guardar el código de seguridad en la base de datos temporalmente
        user.securityCode = securityCode;
        await user.save();

        // Enviar el código de seguridad al frontend
        res.json({ msg: 'Código de seguridad enviado', deviceID: user.deviceID });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error en el servidor' });
    }
});

// Ruta para verificar el código de seguridad
router.post('/verify-security-code', async (req, res) => {
    const { cedula, securityCode } = req.body;

    try {
        const user = await User.findOne({ cedula });

        if (!user) {
            return res.status(404).json({ msg: 'Usuario no encontrado' });
        }

        // Verificar si el código de seguridad coincide con el guardado en la base de datos
        if (user.securityCode !== securityCode) {
            return res.status(400).json({ msg: 'Código de seguridad incorrecto' });
        }

        // Generar un token JWT para la sesión del usuario
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Eliminar el código de seguridad después de la validación
        user.securityCode = null;
        await user.save();

        res.json({ msg: 'Código validado, sesión restaurada', token });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error en el servidor' });
    }
});

// Función para generar un código de seguridad único
function generateSecurityCode(deviceID) {
    return `${deviceID}-${Math.random().toString(36).substr(2, 6)}`;
}

module.exports = router;
