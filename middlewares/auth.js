const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    // Obtener el token de los headers
    const token = req.header('x-auth-token');

    // Comprobar si no hay token
    if (!token) {
        return res.status(401).json({ msg: 'No hay token, autorización denegada' });
    }

    // Verificar el token
    try {
        const decoded = jwt.verify(token, 'yourjwtsecret');
        req.userId = decoded.userId; // Almacenar el ID del usuario en la solicitud
        next();
    } catch (error) {
        res.status(401).json({ msg: 'Token no válido' });
    }
};
