const Log = require('../models/Log');

module.exports = (req, res, next) => {
    res.on('finish', async () => {
        try {
            await Log.create({
                method: req.method,
                path: req.originalUrl,
                status: res.statusCode,
                message: `${req.method} ${req.originalUrl}`,
                timestamp: new Date()
            });
        } catch (err) {
            console.error('Log save failed:', err.message);
        }
    });

    next();
};
