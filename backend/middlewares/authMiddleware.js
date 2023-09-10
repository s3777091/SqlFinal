const jwt = require('jsonwebtoken');

const checkAuthorization = (role) => {
    return (req, res, next) => {
        try {
            const token = req.header('Authorization').replace('Bearer ', '');
            const decoded = jwt.verify(token, 'your_jwt_secret');
            if (decoded.role !== role) {
                return res.status(403).json({ message: 'Permission denied' });
            }
            req.userId = decoded.userId;
            next();
        } catch (error) {
            res.status(401).json({ message: 'Invalid token', error });
        }
    };
};

module.exports = { checkAuthorization };