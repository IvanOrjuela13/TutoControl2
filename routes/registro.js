const express = require('express');
const Registro = require('../models/registro');
const moment = require('moment-timezone');
const { createCanvas } = require('canvas'); // Necesitas instalar 'canvas' con npm
const router = express.Router();

// Ruta para registrar entrada
router.post('/entrada', async (req, res) => {
    const { userId, deviceID, ubicacion } = req.body;

    try {
        // Establece la fecha y hora actual en la zona horaria de Bogotá
        let fechaLocal = moment.tz("America/Bogota").subtract(5, 'hours');
        const fechaFormato = fechaLocal.format('YYYY-MM-DD HH:mm:ss'); // Formato de la fecha para mostrar

        // Generar la imagen con la fecha, hora y ubicación
        const canvas = createCanvas(500, 300); // Ajusta el tamaño de la imagen
        const ctx = canvas.getContext('2d');
        
        // Fondo blanco y texto en negro
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, 500, 300);
        ctx.fillStyle = 'black';
        ctx.font = '20px Arial';
        ctx.fillText(`Registro de Entrada`, 50, 50);
        ctx.fillText(`Fecha: ${fechaFormato}`, 50, 100);
        ctx.fillText(`Ubicación: Lat ${ubicacion.lat}, Lng ${ubicacion.lng}`, 50, 150);
        ctx.fillText(`Tipo: Entrada`, 50, 200);

        // Aquí no estamos guardando la imagen, solo generando los datos
        const imagenGenerada = true; // Indicamos que la imagen se generó correctamente

        // Crear un nuevo registro en la base de datos
        const nuevoRegistro = new Registro({
            userId,
            deviceID,
            ubicacion,
            fecha: fechaLocal.toDate(), // Usa la fecha ajustada en Bogotá
            tipo: 'entrada',
            imagenStatus: imagenGenerada ? 'exito' : 'fallo', // Si la imagen se generó correctamente
        });

        await nuevoRegistro.save();
        res.status(201).json({ msg: 'Entrada registrada exitosamente', imagenStatus: imagenGenerada ? 'exito' : 'fallo' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al registrar la entrada', imagenStatus: 'fallo' });
    }
});

// Ruta para registrar salida
router.post('/salida', async (req, res) => {
    const { userId, deviceID, ubicacion } = req.body;

    try {
        // Establece la fecha y hora actual en la zona horaria de Bogotá
        let fechaLocal = moment.tz("America/Bogota").subtract(5, 'hours');
        const fechaFormato = fechaLocal.format('YYYY-MM-DD HH:mm:ss'); // Formato de la fecha para mostrar

        // Generar la imagen con la fecha, hora y ubicación
        const canvas = createCanvas(500, 300); // Ajusta el tamaño de la imagen
        const ctx = canvas.getContext('2d');
        
        // Fondo blanco y texto en negro
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, 500, 300);
        ctx.fillStyle = 'black';
        ctx.font = '20px Arial';
        ctx.fillText(`Registro de Salida`, 50, 50);
        ctx.fillText(`Fecha: ${fechaFormato}`, 50, 100);
        ctx.fillText(`Ubicación: Lat ${ubicacion.lat}, Lng ${ubicacion.lng}`, 50, 150);
        ctx.fillText(`Tipo: Salida`, 50, 200);

        // Aquí no estamos guardando la imagen, solo generando los datos
        const imagenGenerada = true; // Indicamos que la imagen se generó correctamente

        // Crear un nuevo registro en la base de datos
        const nuevoRegistro = new Registro({
            userId,
            deviceID,
            ubicacion,
            fecha: fechaLocal.toDate(), // Usa la fecha ajustada en Bogotá
            tipo: 'salida',
            imagenStatus: imagenGenerada ? 'exito' : 'fallo', // Si la imagen se generó correctamente
        });

        await nuevoRegistro.save();
        res.status(201).json({ msg: 'Salida registrada exitosamente', imagenStatus: imagenGenerada ? 'exito' : 'fallo' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al registrar la salida', imagenStatus: 'fallo' });
    }
});

module.exports = router;
