import { db } from '../../db';

export const resolver = {
    Query: {
        place(parent, { id }, ctx, info) {
            return db.findById('place', id);
        },
        places(parent, args, ctx, info) {
            return db.find('place');
        }
    },
    Mutation: {
        deletePlace: (parent, { id }, ctx, info) => { },
        createPlace: (parent, { data }, ctx, info) => { },
        updatePlace: (parent, { id, data }, ctx, info) => { }
    }
};