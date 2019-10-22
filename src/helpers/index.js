const { addListener, mainStory } = require('storyboard');
const wsServerListener = require('storyboard-listener-ws-server').default;
const fromEntries = require('fromentries');
const Txi = require('txi');

// Sets storyboard preset
require('storyboard-preset-console');

const isAuthorized = (login, password) => {
    return login === 'admin' && password === 'admin';
}

addListener(wsServerListener, {
    authenticate: ({ login, password }) => isAuthorized(login, password),
});

const createThing = ({
    type,
    data,
    ctx
}) => {
    return ctx.db.create({
        ...data,
        '@type': type
    });
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

const log = mainStory;
// if (process.env.NODE_ENV !== 'development') {
//   log.debug = () => {};
// }

const txi = new Txi();

module.exports = {
    createThing,
    __resolveType,
    getAllPeople,
    updateThing,
    log,
    txi
};