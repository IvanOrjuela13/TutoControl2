const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    // Leer el token del header
    const token = req.header('x-auth-token'); // Asegúrate de que este sea el nombre correcto del header

    // Verificar si no hay token
    if (!token) {
        return res.status(401).json({ msg: 'No hay token, permiso no válido' });
    }

    try {
        // Verificar el token
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Asegúrate de usar la misma clave secreta
        req.userId = decoded.userId; // Asigna el userId a la solicitud
        next(); // Continúa con el siguiente middleware
    } catch (error) {
        res.status(401).json({ msg: 'Token no válido' });
    }
};

module.exports = authMiddleware;
