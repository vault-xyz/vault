const { createThing } = require('../../helpers');

const resolver = {
    Query: {
        country(parent, { id }, ctx, info) {
            return db.findOne('country', { id });
        },
        countries(parent, args, ctx, info) {
            return db.find('country', {});
        }
    },
    Mutation: {
        deleteCountry: (parent, { id }, ctx, info) => db.delete(id),
        createCountry: (parent, { data }, ctx, info) => createThing({ type: 'Country', data, ctx }),
        updateCountry: (parent, { id, data }, ctx, info) => {}
    }
};

module.exports = {
    resolver
};