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

// Middleware para JSON y CORS
app.use(express.json());
app.use(cors());

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Redirigir la raíz a login
app.get('/', (req, res) => {
    res.redirect('/login');
});

// Rutas públicas (Login y Registro)
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Middleware para proteger rutas privadas
app.use((req, res, next) => {
    const rutasPublicas = ['/login', '/register', '/api/auth/login', '/api/auth/register'];
    
    if (!rutasPublicas.includes(req.path) && !req.headers.authorization) {
        return res.redirect('/login'); // Redirige si no tiene token
    }
    next();
});

// Rutas de autenticación y registro de usuarios
app.use('/api/auth', authRoutes);

// 🔒 Rutas protegidas
app.use('/api/registro', registroRoutes);

// Iniciar el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
