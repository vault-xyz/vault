const { GraphQLJSONObject } = require('graphql-type-json');
const GraphQLLong = require('graphql-type-long');
const { GraphQLDateTime } = require('graphql-iso-date');
const { __resolveType } = require('../../helpers');

const resolver = {
    Query: {
        hello: (_, args) => `Hello ${args.name || 'World'}!`,
    },
    Mutation: {
    },
    OrgOrPerson: {
        __resolveType
    },
    Address: {
        __resolveType
    },
    Date: GraphQLDateTime,
    JSON: GraphQLJSONObject,
    Long: GraphQLLong
};

module.exports = {
    resolver
};