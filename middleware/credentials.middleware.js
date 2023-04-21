const whitelist = require('../config/whitelist.js');

const credentials = (req, res, next) => {
    const origin = req.headers.origin;
    if (whitelist.includes(origin)) {
        res.header('Access-Control-Allow-Credentials', true);
    }
    next();
}

module.exports = credentials