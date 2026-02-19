const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/legalconsult', {
            serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
            socketTimeoutMS: 45000,
        });
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        return true;
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        console.warn('⚠️  Server will continue without database connection');
        console.warn('⚠️  Only Geoapify API features will be available');
        console.warn('⚠️  To fix: Whitelist your IP in MongoDB Atlas or use local MongoDB');
        return false;
    }
};

module.exports = connectDB;
