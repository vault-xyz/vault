import { GraphQLJSONObject } from 'graphql-type-json';
import GraphQLLong from 'graphql-type-long';
import { GraphQLDateTime } from 'graphql-iso-date';
import { __resolveType } from '../../helpers';

export const resolver = {
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