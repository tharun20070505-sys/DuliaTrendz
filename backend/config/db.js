import { connectTurso, closeTurso } from './turso.js';

export const connectDB = async () => {
  return await connectTurso();
};

export const closeDB = async () => {
  return await closeTurso();
};

export default { connectDB, closeDB };
