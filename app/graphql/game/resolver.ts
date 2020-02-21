const { createThing } = require('../../helpers');

const resolver = {
    Query: {
        game(parent, { id }, ctx, info) {
            return db.findOne('game', { id });
        },
        games(parent, args, ctx, info) {
            return db.find('game', {});
        }
    },
    Mutation: {
        deleteGame: (parent, { id }, ctx, info) => db.delete(id),
        createGame: (parent, { data }, ctx, info) => createThing({ type: 'Game', data, ctx }),
        updateGame: (parent, { id, data }, ctx, info) => {}
    },
    VideoGame: {
        gamePlatform: (parent, args, ctx, info) => parent.gamePlatform.map(id => db.findOne('consoles', { id }))
    }
};

module.exports = {
    resolver
};