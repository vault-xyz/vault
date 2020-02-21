import { db } from '../../db';

export const resolver = {
    Query: {
        country(parent, { id }, ctx, info) {
            return db.find('country', id);
        },
        countries(parent, args, ctx, info) {
            return db.find('country');
        }
    },
    Mutation: {
        deleteCountry: (parent, { id }, ctx, info) => { },
        createCountry: (parent, { data }, ctx, info) => { },
        updateCountry: (parent, { id, data }, ctx, info) => { }
    }
};