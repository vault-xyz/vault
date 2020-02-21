const Txi = require('txi');
const Debug = require('debug');

const debug = Debug('vault:server');

const __resolveType = (obj, ctx, info) => {
    return obj['@type'];
};

const log = process.env.NODE_ENV === 'development' ? console : {
    info: debug,
    debug,
    log: debug,
    error: debug,
    warn: debug
};

const txi = new Txi();

module.exports = {
    __resolveType,
    log,
    txi
};