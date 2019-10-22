const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const { Options } = require('graphql-yoga');
const { transpileSchema } = require('graphql-s2s').graphqls2s;
const { formatError, isInstance: isApolloErrorInstance } = require('apollo-errors');
const { JsonBox } = require('jsonbox-node');
const glue = require('schemaglue');
const mapObject = require('map-obj');
const deepmerge = require('deepmerge');
const parseRequest = require('parse-request');
const genMockData = require('./gen-mock-data');
const { log } = require('./helpers');

const box = new JsonBox('http://localhost:3000');
const BOX_ID = 'box_b496ea2a9b5504182686';
const db = {
  async create(collection, data) {
    return box.create(data, BOX_ID, collection);
  },
  async update(collection, _id, data) {
    const oldResult = await db.findOne(collection, { _id }, options);
    const newResult = deepmerge(oldResult, data);
    return box.update(newResult, BOX_ID, _id);
  },
  async findOne(collection, query = {}, options = {}) {
    return db.find(collection, query, options).then(results => results[0]);
  },
  async find(collection, query = {}, options = {}) {
    const raw = mapObject(query, (key, value) => {
      if (key === '_id') {
        return [key, value];
      }
      return [`data.${key}`, value];
    });

    const results = await box.read(BOX_ID, collection, { raw, ...options });

    return results.map(result => ({
      id: result._id,
      ...result
    }));
  }
}

if (process.env.GEN_DATA) {
  (async () => {
    await genMockData(db).catch(error => {
      if (isApolloErrorInstance(error)) {
        error = formatError(error);
      }
      log.error('Failed generating mock data', { attach: error });
    });
  })();
}

const options = {
  ...Options,
  formatError
};

const { schema, resolver } = glue('src/graphql');

const server = new ApolloServer({
  typeDefs: [transpileSchema(schema)],
  resolvers: resolver,
  context: async () => {
    return {
      db
    };
  }
});

const app = express();

app.use((req, _, next) => {
  if (req.url === '/') {
    return next();
  }
  const attach = parseRequest({ req });
  log.debug('request', { attach });

  next();
});

server.applyMiddleware({
  app,
  path: '/graphql'
});

app.listen({ port: 4000 }, () => {
  log.info(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
});