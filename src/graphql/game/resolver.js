const { createThing } = require('../../helpers');

const resolver = {
    Query: {
        game(parent, { id: _id }, ctx, info) {
            return ctx.db.findOne('games', { _id });
        },
        games(parent, { limit, skip }, ctx, info) {
            return ctx.db.find('games', {}, { limit, skip });
        }
    },
    Mutation: {
        deleteGame: (parent, { id }, ctx, info) => ctx.db.delete(id),
        createGame: (parent, { data }, ctx, info) => createThing({ type: 'Movie', data, ctx }),
        updateGame: (parent, { id, data }, ctx, info) => {}
    },
    VideoGame: {
        gamePlatform: (parent, args, ctx, info) => parent.gamePlatform.map(id => ctx.db.findOne('consoles', { id }))
    }
};

module.exports = {
    resolver
};