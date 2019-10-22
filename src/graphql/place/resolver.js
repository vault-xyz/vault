const { createThing } = require('../../helpers');

const resolver = {
    Query: {
        place(parent, { id: _id }, ctx, info) {
            return ctx.db.findOne('places', { _id });
        },
        places(parent, { limit, skip }, ctx, info) {
            return ctx.db.find('places', {}, { limit, skip });
        }
    },
    Mutation: {
        deletePlace: (parent, { id }, ctx, info) => ctx.db.delete(id),
        createPlace: (parent, { data }, ctx, info) => createThing({ type: 'Place', data, ctx }),
        updatePlace: (parent, { id, data }, ctx, info) => {},
    }
};

module.exports = {
    resolver
};