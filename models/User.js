const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    cedula: { type: String, required: true, unique: true },  // Usamos cedula como campo único
    area: { type: String, required: true },
    password: { type: String, required: true },
    deviceID: { type: String, required: true, unique: true }  // El Device ID será único
});

// Método para comparar contraseñas
UserSchema.methods.matchPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// Middleware para encriptar la contraseña antes de guardar
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

module.exports = mongoose.model('User', UserSchema);
