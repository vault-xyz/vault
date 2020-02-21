import { AppError } from '../../errors';
import { db } from '../../db';

interface Person {
    id: string
}

export const resolver = {
    Query: {
        async person(parent, { id }, ctx, info) {
            const person = await db.findById<Person>('person', id);

            if (!person.id) {
                throw new AppError('Not found!');
            }

            return person;
        },
        people(parent, { limit, skip, random }, ctx, info) {
            // return db.find('person', {}, { limit, skip, random });
        }
    },
    Mutation: {
        deletePerson: (parent, { id }, ctx, info) => { },
        createPerson: (parent, { data }, ctx, info) => { },
        updatePerson: (parent, { id, data }, ctx, info) => {
            // const person = db.findOne('person', { id });

            // if (!person) {
            //     throw new Error(`Couldn't find person with id ${id}`);
            // }

            // const updatedPerson = db.update('person', id, {
            //     ...fromEntries(Object.entries(person).map(([key, value]) => {
            //         const dataValue = data[key];
            //         return [key, dataValue !== undefined ? dataValue : value];
            //     }))
            // });

            // return updatedPerson;
        },
    },
    Person: {
        name({ familyName, givenName }, args, ctx, info) {
            return `${givenName} ${familyName}`;
        },
        knows({ knows = [], parents = [], children = [] }, args, ctx, info) {
            // return [...knows, ...parents, ...children].map(id => {
            //     const person = db.findOne('person', { id });
            //     log.debug(`looking for ${id} in "person", found ${JSON.stringify(person, null, 2)}`);
            //     return person;
            // });
        },
        occupation: ({ occupations = [] }, args, ctx, info) => {
            // db.findOne('occupation', { id: occupations[0] })
        },
        occupations: ({ occupations = [] }, args, ctx, info) => {
            // occupations.map(id => db.findOne('occupation', { id }))
        },
        parent: ({ parents = [] }, args, ctx, info) => {
            // db.findOne('person', { id: parents[0] })
        },
        parents: ({ parents = [] }, args, ctx, info) => {
            // parents.map(id => db.findOne('person', { id }))
        },
        child: ({ children = [] }, args, ctx, info) => {
            // db.findOne('person', { id: children[0] })
        },
        children: ({ children = [] }, args, ctx, info) => {
            // children.map(id => db.findOne('person', { id }))
        },
        sibling: ({ siblings = [] }, args, ctx, info) => {
            // db.findOne('person', { id: siblings[0] })
        },
        siblings: ({ siblings = [] }, args, ctx, info) => {
            // siblings.map(id => db.findOne('person', { id }))
        },
        spouse: ({ spouses = [] }, args, ctx, info) => {
            // db.findOne('person', { id: spouses[0] })
        },
        spouses: ({ spouses = [] }, args, ctx, info) => {
            // spouses.map(id => db.findOne('person', { id }))
        },
        nationality: ({ nationality = [] }, args, ctx, info) => {
            // db.findOne('country', { id: nationality }
        }
    }
};