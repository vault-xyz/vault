import { db } from '../../db';

export const resolver = {
    Query: {
        organization(parent, { id }, ctx, info) {
            return db.findById('organization', id);
        },
        organizations(parent, args, ctx, info) {
            return db.find('organization');
        }
    },
    Mutation: {
        deleteOrganization: (parent, { id }, ctx, info) => { },
        createOrganization: (parent, { data }, ctx, info) => { },
        updateOrganization: (parent, { id, data }, ctx, info) => { }
    }
};