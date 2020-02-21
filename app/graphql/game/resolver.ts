import { db } from '../../db';

export const resolver = {
    Query: {
        game(parent, { id }, ctx, info) {
            return db.findById('game', id);
        },
        games(parent, args, ctx, info) {
            return db.find('game');
        }
    },
    Mutation: {
        deleteGame: (parent, { id }, ctx, info) => { },
        createGame: (parent, { data }, ctx, info) => { },
        updateGame: (parent, { id, data }, ctx, info) => { }
    },
    VideoGame: {
        gamePlatform: (parent, args, ctx, info) => parent.gamePlatform.map(id => db.findById('consoles', id))
    }
};