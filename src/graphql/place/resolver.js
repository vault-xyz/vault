const { createThing } = require('../../helpers');

const resolver = {
    Query: {
        place(parent, { id }, ctx, info) {
            return ctx.db.findOne('places', { id });
        },
        places(parent, args, ctx, info) {
            return ctx.db.find('places', {});
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