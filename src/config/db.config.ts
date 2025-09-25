import mongoose from 'mongoose';
import process from 'process';
import { logger } from './log';

const DB = process?.env?.DBLINK?.replace('env', process.env.NODE_ENV as string);

export const connectDB = () => {
  mongoose
    .connect(DB as string)
    .then(() =>
      logger('fgCyan', `successfully connected to ${process.env.NODE_ENV}`)
    )
    .catch((err) => {
      console.log('err', err);
    });
};
