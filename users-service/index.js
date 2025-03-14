const { ApolloServer, gql } = require('apollo-server');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const typeDefs = gql`
  type User {
    id: Int!
    name: String!
    email: String!
  }

  type Query {
    users: [User!]!
    user(id: Int!): User
  }

  type Mutation {
    createUser(name: String!, email: String!): User!
    updateUser(id: Int!, name: String, email: String): User!
    deleteUser(id: Int!): User!
  }
`;

const resolvers = {
    Query: {
      users: () => prisma.user.findMany(),
      user: (_, args) => prisma.user.findUnique({ where: { id: args.id } }),
    },
    Mutation: {
      createUser: (_, args) => {
        return prisma.user.create({
          data: { name: args.name, email: args.email },
        });
      },
      updateUser: (_, args) => {
        return prisma.user.update({
          where: { id: args.id },
          data: { name: args.name, email: args.email },
        });
      },
      deleteUser: (_, args) => {
        return prisma.user.delete({ where: { id: args.id } });
      },
    },
  };

const server = new ApolloServer({ typeDefs, resolvers });
server.listen({ port: 4001 }).then(({ url }) => {
  console.log(`Users service running at ${url}`);
});

