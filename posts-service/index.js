// Existing requires...
const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const { createServer } = require('http');
const { WebSocketServer } = require('ws');
const { useServer } = require('graphql-ws/lib/use/ws');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const { PrismaClient } = require('@prisma/client');
const { PubSub } = require('graphql-subscriptions');
const gql = require('graphql-tag');
const amqp = require('amqplib'); // New: require amqplib for RabbitMQ

const prisma = new PrismaClient();
const pubsub = new PubSub();
const POST_CREATED = "POST_CREATED";

// GraphQL Schema and resolvers ...
const typeDefs = gql`
  type Post {
    id: Int!
    title: String!
    content: String!
  }

  type Query {
    posts: [Post!]!
    post(id: Int!): Post
  }

  type Mutation {
    createPost(title: String!, content: String!): Post!
    updatePost(id: Int!, title: String, content: String): Post
    deletePost(id: Int!): Post
  }
  
  type Subscription {
    postCreated: Post!
  }
`;

const resolvers = {
  Query: {
    posts: () => prisma.post.findMany(),
    post: (_, { id }) => prisma.post.findUnique({ where: { id } }),
  },
  Mutation: {
    createPost: async (_, args) => {
      const post = await prisma.post.create({ data: args });
      pubsub.publish(POST_CREATED, { postCreated: post });
      return post;
    },
    updatePost: async (_, { id, ...data }) => {
      return prisma.post.update({ where: { id }, data });
    },
    deletePost: (_, { id }) => prisma.post.delete({ where: { id } }),
  },
  Subscription: {
    postCreated: {
      subscribe: () => pubsub.asyncIterableIterator([POST_CREATED]),
    },
  },
};

const schema = makeExecutableSchema({ typeDefs, resolvers });

// --- New: RabbitMQ Consumer Function ---
async function consumeMessages() {
  try {
    const connection = await amqp.connect('amqp://localhost:5672');
    const channel = await connection.createChannel();
    const queueName = 'post.created';
    
    await channel.assertQueue(queueName, { durable: true });
    console.log(`[*] Waiting for messages in queue: ${queueName}`);
    
    channel.consume(queueName, async (msg) => {
      if (msg !== null) {
        const postData = JSON.parse(msg.content.toString());
        console.log('[x] Received message:', postData);
        try {
          // Create a new post using Prisma
          const newPost = await prisma.post.create({ data: postData });
          console.log('[+] Created Post in DB:', newPost);
          // Optionally, publish to subscriptions for real-time updates
          pubsub.publish(POST_CREATED, { postCreated: newPost });
        } catch (err) {
          console.error('Error creating post:', err);
        }
        channel.ack(msg);
      }
    }, { noAck: false });
  } catch (error) {
    console.error('Error in RabbitMQ consumer:', error);
  }
}

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  
  // Create Apollo Server instance
  const server = new ApolloServer({ schema });
  await server.start();
  server.applyMiddleware({ app, path: '/' });
  
  // Setup WebSocket server for subscriptions
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql',
  });
  useServer({ schema }, wsServer);
  
  // Start the RabbitMQ consumer to listen for messages
  consumeMessages();

  const PORT = 4002;
  httpServer.listen(PORT, () => {
    console.log(`Posts service running at http://localhost:${PORT}${server.graphqlPath}`);
    console.log(`Subscriptions ready at ws://localhost:${PORT}${server.graphqlPath}`);
  });
}

startServer().catch(error => console.error(error));
