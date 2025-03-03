const express = require('express');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const registroRoutes = require('./routes/registro');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Conectar a la base de datos
connectDB();

// Middleware para JSON
app.use(express.json());

// Middleware para CORS
app.use(cors());

// Middleware para servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Redirigir la raíz a /register
app.get('/', (req, res) => {
    res.redirect('/register');
});

// Ruta para el archivo register.html
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// Ruta para el archivo login.html
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/registro', registroRoutes); // Usar la nueva ruta para registro

// Iniciar el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
