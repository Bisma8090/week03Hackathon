require('dotenv').config({ path: '../.env' }); // <-- parent folder me .env
const connectDB = require('./config/db');

(async () => {
  try {
    await connectDB();
    console.log('✅ DB connection test successful');
    process.exit(0);
  } catch (err) {
    console.error('❌ DB connection test failed');
    console.error(err); 
    process.exit(1);
  }
})();