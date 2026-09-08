import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "";

let cached: any = (global as any).mongoose;
if (!cached) cached = (global as any).mongoose = { conn: null, promise: null };

export async function connectDB() {
  if (!MONGODB_URI) {
    console.log("MONGODB_URI not set yet, skipping connection");
    return null;
  }
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}