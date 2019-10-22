const { createThing, getAllPeople } = require('../../helpers');

const resolver = {
    Query: {
        movie(parent, { id: _id }, ctx, info) {
            return ctx.db.findOne('movies', { _id });
        },
        movies(parent, { director, directors, actor, actors, limit, skip }, ctx, info) {
            const movies = ctx.db.find('movies', {}, { limit, skip });

            const hasAll = field => itemsToCheck => {
                // Ensure the movie has all the ids in the field
                return movies.filter(movie => itemsToCheck.every(item => movie[field].includes(item)));
            };

            if (director || directors || actor || actors) {
                return [
                    ...director ? hasAll('directors')([director]) : [],
                    ...directors ? hasAll('directors')(directors) : [],
                    ...actor ? hasAll('actors')([actor]) : [],
                    ...actors ? hasAll('actors')(actors) : [],
                ]
            }

            return movies;
        }
    },
    Mutation: {
        deleteMovie: (parent, { id }, ctx, info) => ctx.db.delete(id),
        createMovie: (parent, { data }, ctx, info) => createThing({ type: 'Movie', data, ctx }),
        updateMovie: (parent, { id, data }, ctx, info) => {}
    },
    Movie: {
        actors: getAllPeople('actors'),
        directors({ directors = [] }, args, ctx, info) {
            return directors.map(id => ctx.db.findOne('people', { id }));
        }
    }
};

module.exports = {
    resolver
};