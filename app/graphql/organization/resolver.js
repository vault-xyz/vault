const { createThing } = require('../../helpers');

const resolver = {
    Query: {
        organization(parent, { id }, ctx, info) {
            return db.findOne('organization', { id });
        },
        organizations(parent, args, ctx, info) {
            return db.find('organization', {});
        }
    },
    Mutation: {
        deleteOrganization: (parent, { id }, ctx, info) => db.delete(id),
        createOrganization: (parent, { data }, ctx, info) => createThing({ type: 'Organization', data, ctx }),
        updateOrganization: (parent, { id, data }, ctx, info) => { }
    }
};

module.exports = {
    resolver
};