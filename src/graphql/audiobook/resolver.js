const { createThing } = require('../../helpers');

const resolver = {
    Query: {
        audiobook(parent, { id: _id }, ctx, info) {
            return ctx.db.findOne('audiobooks', { _id });
        },
        audiobooks(parent, { limit, skip }, ctx, info) {
            return ctx.db.find('audiobooks', {}, { limit, skip });
        }
    },
    Mutation: {
        deleteAudioBook: (parent, { id }, ctx, info) => ctx.db.delete(id),
        createAudioBook: (parent, { data }, ctx, info) => createThing({ type: 'AudioBook', data, ctx }),
        updateAudioBook: (parent, { id, data }, ctx, info) => {}
    },
    AudioBook: {}
};

module.exports = {
    resolver
};