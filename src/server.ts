import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import { config } from './config/config';
import Logging from './library/Logging';
import authorRoutes, { route } from './routes/Author';
import bookRoutes from './routes/Book';

const router = express();
// connect to mongodb
mongoose
    .connect(config.mongo.url)
    .then(() => {
        Logging.info('Connected to mongoDB.');
        StartServer();
    })
    .catch((error) => {
        Logging.error('Unable to connect');
        Logging.error(error);
    });

const StartServer = () => {
    router.use((req, res, next) => {
        // Log the request
        Logging.info(`Incomming -> Method: [${req.method}] - Url: [${req.url}] - IP: [${req.socket.remoteAddress}] `);

        res.on('finish', () => {
            Logging.info(`Incomming -> Method: [${req.method}] - Url: [${req.url}] - IP: [${req.socket.remoteAddress}]`);
        });

        next();
    });

    router.use(express.urlencoded({ extended: true }));
    router.use(express.json());

    /** rules of our API */
    router.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

        if (req.method == 'OPTIONS') {
            res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
            return res.status(200).json({});
        }
        next();
    });

    /** Routes */
    router.use('/authors', authorRoutes);
    router.use('/books', bookRoutes);
    /** Healthcheck */

    router.get('/ping', (req, res, next) => res.status(200).json({ message: 'pong' }));

    /** Error handling */
    router.use((req, res, next) => {
        const error = new Error('not found');
        Logging.error(error);

        return res.status(404).json({ message: error.message });
    });

    http.createServer(router).listen(config.server.port, () => Logging.info(`Server is running on port ${config.server.port}`));
};
