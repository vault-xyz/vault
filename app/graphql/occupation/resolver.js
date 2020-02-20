const { createThing } = require('../../helpers');

const resolver = {
    Query: {
        occupation(parent, { id }, ctx, info) {
            return db.findOne('occupation', { id });
        },
        occupations(parent, args, ctx, info) {
            return db.find('occupation', {});
        }
    },
    Mutation: {
        deleteOccupation: (parent, { id }, ctx, info) => db.delete(id),
        createOccupation: (parent, { data }, ctx, info) => createThing({ type: 'Occupation', data, ctx }),
        updateOccupation: (parent, { id, data }, ctx, info) => {}
    }
};

module.exports = {
    resolver
};