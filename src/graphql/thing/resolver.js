const { createThing, __resolveType } = require('../../helpers');

const resolver = {
    Query: {
        thing: (parent, { id }, ctx, info) => {
            const collections = Object.keys(ctx.db.database);
            const things = collections
                .map(collection => ctx.db.find(collection, {}))
                .reduce((previousValue, currentValue) => {
                    return [
                        ...previousValue,
                        ...currentValue
                    ];
                }, []);

            const thing = things.find(thing => thing._id === id);
            if (thing) {
                const {
                    id,
                    description,
                    disambiguatingDescription,
                    name,
                    alternateName,
                    alternateNames,
                    sameAs,
                    ...rest
                } = thing;

                return {
                    id,
                    description,
                    disambiguatingDescription,
                    name,
                    alternateName,
                    alternateNames,
                    sameAs,
                    node: thing
                };
            }
        },
        things(parent, { limit, skip }, ctx, info) {
            const collections = Object.keys(ctx.db.database);
            const things = collections
                .map(collection => ctx.db.find(collection, {}, { limit, skip }))
                .reduce((previousValue, currentValue) => {
                    return [
                        ...previousValue,
                        ...currentValue
                    ];
                }, []);

            return things.map(thing => {
                if (thing) {
                    const {
                        id,
                        description,
                        disambiguatingDescription,
                        name,
                        alternateName,
                        alternateNames,
                        sameAs,
                        ...rest
                    } = thing;

                    return {
                        id,
                        description,
                        disambiguatingDescription,
                        name,
                        alternateName,
                        alternateNames,
                        sameAs,
                        node: thing
                    };
                }
            });
        }
    },
    Mutation: {
        deleteThing: (parent, { id }, ctx, info) => ctx.db.delete(id),
        createThing: (parent, { data }, ctx, info) => createThing({ type: 'Person', data, ctx }),
        updateThing: (parent, { id, data }, ctx, info) => {}
    },
    Thing: {
        __resolveType
    }
};

module.exports = {
    resolver
};