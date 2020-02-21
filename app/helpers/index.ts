const Txi = require('txi');
const Debug = require('debug');

const debug = Debug('vault:server');

export const __resolveType = (obj, ctx, info) => {
    return obj['@type'];
};

export const log = process.env.NODE_ENV === 'development' ? console : {
    info: debug,
    debug,
    log: debug,
    error: debug,
    warn: debug
};

export const txi = new Txi();