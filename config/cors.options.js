const whitelist = require('../config/whitelist.js')

const corsOptions = {
    origin: whitelist,
    credentials: true,
    optionsSuccessStatus: 200
}

module.exports = corsOptions;