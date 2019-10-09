const fromEntries = require('fromentries');

const createThing = ({
    type,
    data,
    ctx
}) => {
    const id = (new Date()).getTime();

    ctx.db.set(id, {
        id,
        ...data,
        '@type': type
    });

    return {
        ...data,
        id
    };
};

const updateThing = ({
    database,
    thing,
    id,
    data,
    ctx
}) => {
    ctx.db.update(database, id, {
        ...fromEntries(Object.entries(thing).map(([key, value]) => {
            const dataValue = data[key];
            return [key, dataValue !== undefined ? dataValue : value];
        }))
    });
};

const __resolveType = (obj, ctx, info) => {
    return obj['@type'];
};

const getAllPeople = field => (parent, args, ctx, info) => parent[field].map(id => ctx.db.findOne('people', { id }));

const log = console;
if (process.env.NODE_ENV !== 'development') {
  log.debug = () => {};
}

module.exports = {
    createThing,
    __resolveType,
    getAllPeople,
    updateThing,
    log
};