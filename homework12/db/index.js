import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config({ quiet: true });

const client = new MongoClient(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000, // ждать подключения не больше 5 секунд
});

let db;

// Подключение к MongoDB (строка подключения и имя базы берутся из .env)
export async function connectDB() {
  await client.connect();
  db = client.db(process.env.DB_NAME);
  console.log(`Connected to MongoDB, database: ${process.env.DB_NAME}`);
  return db;
}

// Получить объект базы данных после подключения
export function getDB() {
  if (!db) {
    throw new Error('Database is not connected');
  }
  return db;
}
