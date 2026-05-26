import mongoose from 'mongoose';
import { env } from './env.js';

const globalForMongoose = globalThis;
globalForMongoose.__remsMongoose = globalForMongoose.__remsMongoose || { conn: null, promise: null };

export const connectDB = async () => {
  if (globalForMongoose.__remsMongoose.conn) return globalForMongoose.__remsMongoose.conn;

  mongoose.set('strictQuery', true);
  if (!globalForMongoose.__remsMongoose.promise) {
    globalForMongoose.__remsMongoose.promise = mongoose.connect(env.mongoUri).then((connection) => connection);
  }

  const connection = await globalForMongoose.__remsMongoose.promise;
  globalForMongoose.__remsMongoose.conn = connection;
  console.log(`MongoDB connected: ${connection.connection.host}`);
  return connection;
};
