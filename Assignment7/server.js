// server.js -- CampusEats GraphQL API
const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');
const fs = require('fs');
const path = require('path');
const pool = require('./db');

// Read schema directly from schema.graphql
const typeDefs = fs.readFileSync(path.join(__dirname, 'schema.graphql'), 'utf-8');

// Resolvers map GraphQL operations to database queries
const resolvers = {
  Query: {
    // Fetches all dishes from the database
    dishes: async () => {
      const [rows] = await pool.query('SELECT * FROM dishes');
      return rows;
    },
    // Fetches a single dish by its ID
    dish: async (_parent, { id }) => {
      const [rows] = await pool.query('SELECT * FROM dishes WHERE id = ?', [id]);
      return rows[0] || null;
    },
  },

  Mutation: {
    // Inserts a new dish and returns the newly created record
    addDish: async (_parent, { input }) => {
      const { name, price, available = true } = input;

      // 1. Run the INSERT query
      const [result] = await pool.query(
        'INSERT INTO dishes (name, price, available) VALUES (?, ?, ?)',
        [name, price, available]
      );

      // 2. Fetch and return the newly created row using the inserted ID
      const [rows] = await pool.query('SELECT * FROM dishes WHERE id = ?', [result.insertId]);
      return rows[0];
    },
  },
};

// Start Apollo Server
async function start() {
  const server = new ApolloServer({ typeDefs, resolvers });
  const { url } = await startStandaloneServer(server, { listen: { port: 4000 } });
  console.log(`CampusEats API ready at ${url}`);
}

start();