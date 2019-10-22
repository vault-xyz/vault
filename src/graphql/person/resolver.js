const fromEntries = require('fromentries');
const { log, createThing } = require('../../helpers');
const AppError = require('../../errors/app-error');

const resolver = {
    Query: {
        person(parent, { id: _id }, ctx, info) {
            const person = ctx.db.findOne('people', { _id });

            if (!person._id) {
                throw new AppError('Not found!');
            }

            return person;
        },
        people(parent, { limit, skip, random }, ctx, info) {
            return ctx.db.find('people', {}, { limit, skip, random });
        }
    },
    Mutation: {
        deletePerson: (parent, { id }, ctx, info) => ctx.db.delete(id),
        createPerson: (parent, { data }, ctx, info) => createThing({ type: 'Person', data, ctx }),
        updatePerson: (parent, { id, data }, ctx, info) => {
            const person = ctx.db.findOne('people', { _id });

            if (!person) {
                throw new Error(`Couldn't find person with id ${id}`);
            }

            const updatedPerson = ctx.db.update('people', id, {
                ...fromEntries(Object.entries(person).map(([key, value]) => {
                    const dataValue = data[key];
                    return [key, dataValue !== undefined ? dataValue : value];
                }))
            });

            return updatedPerson;
        },
    },
    Person: {
        name({ familyName, givenName }, args, ctx, info) {
            return `${givenName} ${familyName}`;
        },
        knows({ knows = [], parents = [], children = [] }, args, ctx, info) {
            return [...knows, ...parents, ...children].map(id => {
                const person = ctx.db.findOne('people', { _id });
                log.debug(`looking for ${id} in "people", found ${JSON.stringify(person, null, 2)}`);
                return person;
            });
        },
        occupation: ({ occupations = [] }, args, ctx, info) => ctx.db.findOne('occupation', { id: occupations[0] }),
        occupations: ({ occupations = [] }, args, ctx, info) => occupations.map(id => ctx.db.findOne('occupation', { id })),
        parent: ({ parents = [] }, args, ctx, info) => ctx.db.findOne('people', { id: parents[0] }),
        parents: ({ parents = [] }, args, ctx, info) => parents.map(id => ctx.db.findOne('people', { id })),
        child: ({ children = [] }, args, ctx, info) => ctx.db.findOne('people', { id: children[0] }),
        children: ({ children = [] }, args, ctx, info) => children.map(id => ctx.db.findOne('people', { id })),
        sibling: ({ siblings = [] }, args, ctx, info) => ctx.db.findOne('people', { id: siblings[0] }),
        siblings: ({ siblings = [] }, args, ctx, info) => siblings.map(id => ctx.db.findOne('people', { id })),
        spouse: ({ spouses = [] }, args, ctx, info) => ctx.db.findOne('people', { id: spouses[0] }),
        spouses: ({ spouses = [] }, args, ctx, info) => spouses.map(id => ctx.db.findOne('people', { id })),
        nationality: ({ nationality = [] }, args, ctx, info) => ctx.db.findOne('countries', { id: nationality })
    }
};

module.exports = {
    resolver
};