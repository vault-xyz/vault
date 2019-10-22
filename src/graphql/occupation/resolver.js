const { createThing } = require('../../helpers');

const resolver = {
    Query: {
        occupation(parent, { id: _id }, ctx, info) {
            return ctx.db.findOne('occupations', { _id });
        },
        occupations(parent, { limit, skip }, ctx, info) {
            return ctx.db.find('occupations', {}, { limit, skip });
        }
    },
    Mutation: {
        deleteOccupation: (parent, { id }, ctx, info) => ctx.db.delete(id),
        createOccupation: (parent, { data }, ctx, info) => createThing({ type: 'Occupation', data, ctx }),
        updateOccupation: (parent, { id, data }, ctx, info) => {}
    }
};

module.exports = {
    resolver
};