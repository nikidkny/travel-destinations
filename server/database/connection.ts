import mongoose from 'mongoose';
import 'dotenv/config';

if (process.env.DATABASE_CONNECTION_STRING == null) {
  throw new Error('Connection string is not defined');
} else if (process.env.DATABASE_NAME == null) {
  throw new Error('Database name is not defined');
}

const connection = await mongoose.connect(process.env.DATABASE_CONNECTION_STRING, {
  dbName: process.env.DATABASE_NAME,
});

export { connection };
