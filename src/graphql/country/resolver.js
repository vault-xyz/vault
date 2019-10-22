const { createThing } = require('../../helpers');

const resolver = {
    Query: {
        country(parent, { id: _id }, ctx, info) {
            return ctx.db.findOne('countries', { _id });
        },
        countries(parent, { limit, skip }, ctx, info) {
            return ctx.db.find('countries', {}, { limit, skip });
        }
    },
    Mutation: {
        deleteCountry: (parent, { id }, ctx, info) => ctx.db.delete(id),
        createCountry: (parent, { data }, ctx, info) => createThing({ type: 'Country', data, ctx }),
        updateCountry: (parent, { id, data }, ctx, info) => {}
    }
};

module.exports = {
    resolver
};