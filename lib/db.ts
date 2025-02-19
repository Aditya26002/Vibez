import mongoose from "mongoose";

// Retrieve MongoDB URI from environment variables.
const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  // Error for missing MongoDB URI.
  throw new Error("Please define mongodb uri in env file");
}

// Cache for reusing the mongoose connection during development.
let cached = global.mongoose;

if (!cached) {
  // Initialize cache.
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  // Return connection if already established.
  if (cached.conn) {
    return cached.conn;
  }

  // Create connection promise if not present.
  if (!cached.promise) {
    const opts = {
      bufferCommands: true, // Buffer commands until connected.
      maxPoolSize: 10, // Limit concurrent connections.
    };

    // Connect and cache the promise.
    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then(() => mongoose.connection);
  }

  try {
    // Await connection and cache it.
    cached.conn = await cached.promise;
  } catch (error) {
    // Reset promise cache on error.
    cached.promise = null;
    throw error;
  }

  // Return the active connection.
  return cached.conn;
}
