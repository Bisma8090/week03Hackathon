// src/server.js
require('dotenv').config(); //
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        console.log("⏳ Connecting to Database...");
        await connectDB();
        console.log("✅ Database Ready");

        app.listen(PORT, () => {
            console.log(`🚀 Server running at: http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('❌ Startup Error:', error.message);
        process.exit(1);
    }
};

startServer();