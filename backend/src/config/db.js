const mongoose = require('mongoose');

let cached = global.mongoose || { conn: null, promise: null };

async function connectDB() {
    if (cached.conn) return cached.conn;

    if (!cached.promise) {
        const opts = {
            // CRITICAL: Is se buffering band ho jayegi
            bufferCommands: false, 
            serverSelectionTimeoutMS: 5000, // 5 sec se zyada wait nahi karega
        };

        console.log('=> Connecting to MongoDB Atlas...');
        cached.promise = mongoose.connect(process.env.MONGO_URI, opts).then((mongoose) => {
            console.log('✅ MongoDB Connected');
            return mongoose;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        console.error('❌ Connection Error:', e.message);
        throw e;
    }
    return cached.conn;
}

module.exports = connectDB;