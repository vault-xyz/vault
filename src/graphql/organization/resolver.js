const { createThing } = require('../../helpers');

const resolver = {
    Query: {
        organization(parent, { id: _id }, ctx, info) {
            return ctx.db.findOne('organizations', { _id });
        },
        organizations(parent, { limit, skip }, ctx, info) {
            return ctx.db.find('organizations', {}, { limit, skip });
        }
    },
    Mutation: {
        deleteOrganization: (parent, { id }, ctx, info) => ctx.db.delete(id),
        createOrganization: (parent, { data }, ctx, info) => createThing({ type: 'Organization', data, ctx }),
        updateOrganization: (parent, { id, data }, ctx, info) => { }
    }
};

module.exports = {
    resolver
};