import { app } from '../backend/src/app.js';
import { connectDB } from '../backend/src/config/db.js';
import { assertRequiredEnv } from '../backend/src/config/env.js';

let dbReady;

const ensureDbConnection = async () => {
  if (!dbReady) dbReady = connectDB();
  await dbReady;
};

export default async function handler(req, res) {
  try {
    assertRequiredEnv();
    await ensureDbConnection();
    return app(req, res);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
