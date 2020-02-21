const { createThing } = require('../../helpers');

const resolver = {
    Query: {
        place(parent, { id }, ctx, info) {
            return db.findOne('place', { id });
        },
        places(parent, args, ctx, info) {
            return db.find('place', {});
        }
    },
    Mutation: {
        deletePlace: (parent, { id }, ctx, info) => db.delete(id),
        createPlace: (parent, { data }, ctx, info) => createThing({ type: 'Place', data, ctx }),
        updatePlace: (parent, { id, data }, ctx, info) => {},
    }
};

module.exports = {
    resolver
};