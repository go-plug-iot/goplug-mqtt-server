import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { createServer, request } from "http";
import express from "express";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/lib/use/ws";
import bodyParser from "body-parser";
import cors from "cors";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

import resolvers from "./resolvers.js";
import typeDefs from "./schema.js";
import { initializeFirebaseAdmin } from "./configs/firebase.js";

const JWT_SECRET = "secret";

// Create the schema, which will be used separately by ApolloServer and
// the WebSocket server.
const schema = makeExecutableSchema({ typeDefs, resolvers });

const main = async () => {
  //const MONGO_URI = process.env.MONGO_URI;
  //console.log(process.env.PORT);
  //FIXME: Make it env
  try {
    await mongoose.connect(
      "mongodb+srv://shanish357:23CfuRCDBd0zWNP9@cluster0.ttjkyfh.mongodb.net/test"
    );
    console.log("Connected to MongoDB");
  } catch (err) {
    console.log(err);
  }
};

main();
initializeFirebaseAdmin();
// Create an Express app and HTTP server; we will attach both the WebSocket
// server and the ApolloServer to this HTTP server.
const app = express();
const httpServer = createServer(app);

// Create our WebSocket server using the HTTP server we just set up.
const wsServer = new WebSocketServer({
  server: httpServer,
  path: "/graphql",
});
// Save the returned server's info so we can shutdown this server later
const serverCleanup = useServer({ schema }, wsServer);

// Set up ApolloServer.
const server = new ApolloServer({
  schema,
  plugins: [
    // Proper shutdown for the HTTP server.
    ApolloServerPluginDrainHttpServer({ httpServer }),

    // Proper shutdown for the WebSocket server.
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose();
          },
        };
      },
    },
  ],
});

await server.start();
app.use(
  "/graphql",
  cors(),
  bodyParser.json(),
  expressMiddleware(server, {
    context: async ({ req, res }) => {
      // Get the user token from the headers.
      if (!req.headers.authorization) return { userId: null };
      const requestToken = req.headers.authorization;
      //console.log(requestToken);
      // Try to retrieve a user with the token
      const decodedDetails = jwt.verify(
        requestToken,
        JWT_SECRET
      ) as unknown as {
        data: { id: string };
      };

      console.log(decodedDetails);
      // Add the user to the context
      return { userId: decodedDetails.data.id };
    },
  })
);

const PORT = 4000;
// Now that our HTTP server is fully set up, we can listen to it.
httpServer.listen(PORT, () => {
  console.log(`Server is now running on http://localhost:${PORT}/graphql`);
});
