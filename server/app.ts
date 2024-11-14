import express from 'express';
import cors, { CorsOptions } from 'cors';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import './database/connection';
import userRouter from './routers/userRouter';
import destinationRouter from './routers/destinationRouter';
import storageRouter from './routers/storageRouter';
import authRouter from './routers/authRouter';
import { errorHandler } from './utils/utils';

const app = express();

const CORS_OPTIONS: CorsOptions = {
  origin: 'http://localhost:3000',
  credentials: true, // Enable credentials (cookies) support
};
app.use(cors(CORS_OPTIONS));
app.options('*', cors(CORS_OPTIONS)); // Pre-flight requests handling
app.use(cookieParser());
app.use(express.json());

const VERSIONED_API_PATH = '/api/v1';

app.use(VERSIONED_API_PATH + '/auth', authRouter);
app.use(VERSIONED_API_PATH + '/user', userRouter);
app.use(VERSIONED_API_PATH + '/storage', storageRouter);
app.use(VERSIONED_API_PATH + '/destination', destinationRouter);

app.use(errorHandler);

const PORT = process.env.PORT ?? 8080;

const server = app.listen(PORT, () => {
  const address = server.address();
  const port = typeof address === 'string' ? address : address.port;
  console.log('\nExpress is running on:\n');
  console.log(`\x1b[36mhttp://localhost:${port}\x1b[0m\n`);
});
