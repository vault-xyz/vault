import { db } from '../../db';

export const resolver = {
    Query: {
        occupation(parent, { id }, ctx, info) {
            return db.find('occupation', id);
        },
        occupations(parent, args, ctx, info) {
            return db.find('occupation');
        }
    },
    Mutation: {
        deleteOccupation: (parent, { id }, ctx, info) => { },
        createOccupation: (parent, { data }, ctx, info) => { },
        updateOccupation: (parent, { id, data }, ctx, info) => {}
    }
};

module.exports = {
    resolver
};