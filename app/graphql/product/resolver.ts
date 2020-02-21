import { db } from '../../db';

export const resolver = {
    Query: {
        product(parent, { id }, ctx, info) {
            return db.findById('products', id);
        },
        products(parent, args, ctx, info) {
            return db.find('products');
        }
    },
    Mutation: {
        deleteProduct: (parent, { id }, ctx, info) => { },
        createProduct: (parent, { data }, ctx, info) => { },
        updateProduct: (parent, { id, data }, ctx, info) => { }
    }
};