const mongoose = require('mongoose');

const registroSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    deviceID: { type: String, required: true },
    ubicacion: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
    },
    fecha: { type: Date, default: Date.now }, // Se sobrescribe con obtenerFechaLocal()
    tipo: { type: String, required: true }, // 'entrada' o 'salida'
    image: { type: String, required: true } // Almacena la imagen en formato Base64
});

module.exports = mongoose.model('Registro', registroSchema);
