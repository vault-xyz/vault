const fs = require('fs');
const path = require('path');
const { GraphQLServer, Options } = require('graphql-yoga');
const { transpileSchema } = require('graphql-s2s').graphqls2s;
const { formatError } = require('apollo-errors');
const GraphQLJSON = require('graphql-type-json');
const GraphQLLong = require('graphql-type-long');
const { GraphQLDate } = require('graphql-iso-date');
const Database = require('somewhere');
const { createError } = require('apollo-errors');
const typeDefs = fs.readFileSync(path.join(__dirname, './types.graphql'), 'utf8');
const genMockData = require('./gen-mock-data');

const AppError = createError('AppError', {
  message: 'Internal application error'
});

const createThing = ({
  type,
  data,
  ctx
}) => {
  const id = (new Date()).getTime();

  ctx.db.set(id, {
    id,
    ...data,
    '@type': type
  });

  return {
    ...data,
    id
  };
};

const __resolveType = (obj, ctx, info) => obj['@type'];

const getAllPeople = field => (parent, args, ctx, info) => parent[field].map(id => ctx.db.findOne('people', { id }));

const resolvers = {
  Query: {
    hello: (_, args) => `Hello ${args.name || 'World'}!`,
    thing: (parent, { id }, ctx, info) => [],
    things(parent, args, ctx, info) {
      const collections = Object.keys(ctx.db.database);
      const results = collections
        .map(collection => ctx.db.find(collection, {}))
        .reduce((previousValue, currentValue) => {
          return [
            ...previousValue,
            ...currentValue
          ];
        }, []);

      return results;
    },
    person(parent, { id }, ctx, info) {
      const person = ctx.db.findOne('people', { id });

      if (!person.id) {
        throw new AppError('Not found!');
      }

      return person;
    },
    people(parent, args, ctx, info) {
      return ctx.db.find('people', {});
    },
    movie(parent, { id }, ctx, info) {
      return ctx.db.findOne('movies', { id });
    },
    movies(parent, { director, directors, actor, actors }, ctx, info) {
      const movies = ctx.db.find('movies', {});

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
    },
    show(parent, { id }, ctx, info) {
      return ctx.db.findOne('shows', { id });
    },
    shows(parent, args, ctx, info) {
      return ctx.db.find('shows', {});
    },
    game(parent, { id }, ctx, info) {
      return ctx.db.findOne('games', { id });
    },
    games(parent, args, ctx, info) {
      return ctx.db.find('games', {});
    },
  },
  Mutation: {
    deleteThing: (parent, { id }, ctx, info) => ctx.db.delete(id),
    createPerson: (parent, { data }, ctx, info) => createThing({ type: 'Person', data, ctx }),
    createMovie: (parent, { data }, ctx, info) => createThing({ type: 'Movie', data, ctx }),
  },
  Thing: {
    __resolveType
  },
  Movie: {
    actors: getAllPeople('actors'),
    directors(parent, args, ctx, info) {
      const { directors = [] } = parent;
      return directors.map(id => ctx.db.findOne('people', { id }));
    }
  },
  Person: {
    knows(parent, args, ctx, info) {
      const { knows = [] } = parent;
      return knows.map(id => ctx.db.findOne('people', { id }));
    }
  },
  Show: {
    actors: getAllPeople('actors'),
    directors: getAllPeople('directors'),
    episodes: (parent, args, ctx, info) => parent.episodes.map(id => ctx.db.findOne('episodes', { id })),
    seasons: (parent, args, ctx, info) => parent.seasons.map(id => ctx.db.findOne('seasons', { id }))
  },
  Season: {
    episodes: (parent, args, ctx, info) => parent.episodes.map(id => ctx.db.findOne('episodes', { id })),
  },
  Episode: {
    partOfSeason: (parent, args, ctx, info) => ctx.db.findOne('seasons', { id: parent.partOfSeason })
  },
  VideoGame: {
    gamePlatform: (parent, args, ctx, info) => parent.gamePlatform.map(id => ctx.db.findOne('consoles', { id }))
  },
  Agent: {
    __resolveType
  },
  Address: {
    __resolveType
  },
  Date: GraphQLDate,
  JSON: GraphQLJSON,
  Long: GraphQLLong
};

const db = new Database('./db.json');
if (process.env.NODE_ENV !== 'production') {
  console.debug('Generating mock data...');
  console.debug('Clearing db...');
  genMockData(db);
  console.debug('Mock data added to the db!');
}

const options = {
  ...Options,
  formatError
};

const server = new GraphQLServer({
  typeDefs: [transpileSchema(typeDefs)],
  resolvers,
  context: async () => {
    return {
      db
    };
  }
})
server.start(options, () => console.log(`Server is running at http://localhost:4000`))
