import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import http from 'http';
import { Server } from 'socket.io';
import typeDefs from './schema/type-defs.js';
import resolvers from './schema/resolvers.js';
import './connectDb.js';
import dotenv from 'dotenv';
import socket from './socket.js';
import { dirname } from "path";
import { fileURLToPath } from "url";
import path from "path";
dotenv.config();

const startServer = async () => {
    const app = express();

    const server = new ApolloServer({
        typeDefs,
        resolvers,
        context: ({ req }) => {
            const headers = req.headers;
            return {
                headers,
            };
        }
    });

    await server.start();

    server.applyMiddleware({ app });

    const httpServer = http.createServer(app);
    const io = new Server(httpServer, {
        reconnection: true,
        reconnectionAttempts: Infinity,
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
        },
    });

    socket(io);

    const __dirname = dirname(fileURLToPath(import.meta.url));
    app.use(express.static(path.join(__dirname, "build")));
    app.get("/*", (req, res) => {
      res.sendFile(path.join(__dirname, "build", "index.html"));
    });
    
    httpServer.listen(4000, () => {
        console.log(`Server running at http://localhost:4000${server.graphqlPath}`);
    });
};

startServer();
