import React, { useState, useEffect } from 'react';
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  useQuery,
  useSubscription,
  gql,
  split,
  HttpLink,
} from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';

// HTTP link for queries and mutations (pointing to posts-service)
const httpLink = new HttpLink({
  uri: 'http://localhost:4002/',
});

// WebSocket link for subscriptions using graphql-ws
const wsLink = new GraphQLWsLink(
  createClient({
    url: 'ws://localhost:4002/graphql',
  })
);

// Use split to route subscriptions to the wsLink and other operations to httpLink
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink
);

// Initialize Apollo Client
const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});

// GraphQL query to fetch all posts
const GET_POSTS = gql`
  query GetPosts {
    posts {
      id
      title
      content
    }
  }
`;

// GraphQL subscription to listen for new posts
const POST_CREATED_SUBSCRIPTION = gql`
  subscription OnPostCreated {
    postCreated {
      id
      title
      content
    }
  }
`;

function PostsTable() {
  const { data, loading, error } = useQuery(GET_POSTS);
  const { data: subscriptionData } = useSubscription(POST_CREATED_SUBSCRIPTION);
  const [posts, setPosts] = useState([]);

  // Update posts when the query loads
  useEffect(() => {
    if (data && data.posts) {
      setPosts(data.posts);
    }
  }, [data]);

  // Append new post when received via subscription
  useEffect(() => {
    if (subscriptionData) {
      setPosts((prev) => [...prev, subscriptionData.postCreated]);
    }
  }, [subscriptionData]);

  if (loading) return <p>Loading posts...</p>;
  if (error) return <p>Error loading posts: {error.message}</p>;

  return (
    <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%' }}>
      <thead>
        <tr>
          <th>ID</th>
          <th>Title</th>
          <th>Content</th>
        </tr>
      </thead>
      <tbody>
        {posts.map((post) => (
          <tr key={post.id}>
            <td>{post.id}</td>
            <td>{post.title}</td>
            <td>{post.content}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function App() {
  return (
    <ApolloProvider client={client}>
      <div style={{ margin: '20px' }}>
        <h1>Live Posts Table</h1>
        <PostsTable />
      </div>
    </ApolloProvider>
  );
}

export default App;
