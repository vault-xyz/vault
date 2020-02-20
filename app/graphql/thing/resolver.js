const { createThing, __resolveType, log } = require('../../helpers');
const { AppError } = require('../../errors');

const resolver = {
    Query: {
        thing: async (parent, { id }, ctx, info) => {
            const thing = await db.find('', { id });

            log.info('thing', `Looking up "thing" with { id: "${id}" }`);

            if (!thing) {
                throw AppError(`No thing found with id = ${id}`);
            }

            log.info('thing', 'Found a thing', { attach: thing });

            const {
                description,
                disambiguatingDescription,
                name,
                alternateName,
                alternateNames,
                sameAs
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
        },
        async things(parent, args, ctx, info) {
            const things = await db.find('thing', {}).then(things => {
                return things.reduce((previousValue, currentValue) => {
                    return [
                        ...previousValue,
                        ...currentValue
                    ];
                }, []);
            });

            console.log("boom!", await db.find('thing'));

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
        deleteThing: (parent, { id }, ctx, info) => db.delete(id),
        createThing: (parent, { data }, ctx, info) => createThing({ type: 'Thing', data, ctx }),
        updateThing: (parent, { id, data }, ctx, info) => {}
    },
    Thing: {
        __resolveType
    }
};

module.exports = {
    resolver
};