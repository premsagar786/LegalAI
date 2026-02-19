require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const SocketService = require('./services/socketService');

// Route imports
const authRoutes = require('./routes/authRoutes');
const lawyerRoutes = require('./routes/lawyerRoutes');
const documentRoutes = require('./routes/documentRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const chatRoutes = require('./routes/chatRoutes');

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        methods: ['GET', 'POST']
    }
});

// Make io accessible to routes
app.set('io', io);

// Middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/lawyers', lawyerRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);

// Root route
app.get('/', (req, res) => {
    res.json({
        message: '🏛️ Legal Consultation Platform API',
        version: '1.0.0',
        status: 'running',
        documentation: '/api',
        health: '/api/health',
        endpoints: {
            auth: '/api/auth',
            lawyers: '/api/lawyers',
            documents: '/api/documents',
            appointments: '/api/appointments',
            admin: '/api/admin',
            chat: '/api/chat'
        }
    });
});

// Health check
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Legal Consultation API is running',
        timestamp: new Date().toISOString()
    });
});

// API documentation route
app.get('/api', (req, res) => {
    res.json({
        message: 'Legal Consultation Platform API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            lawyers: '/api/lawyers',
            documents: '/api/documents',
            appointments: '/api/appointments',
            admin: '/api/admin'
        }
    });
});

// Error handler
app.use(errorHandler);

// Initialize Socket.IO Service
const socketService = new SocketService(io);
socketService.initialize();

// Make socket service accessible to routes
app.set('socketService', socketService);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`
  =============================================
  🏛️  Legal Consultation Platform API
  =============================================
  Environment: ${process.env.NODE_ENV || 'development'}
  Port: ${PORT}
  API: http://localhost:${PORT}/api
  Health: http://localhost:${PORT}/api/health
  =============================================
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.error(`Error: ${err.message}`);
    server.close(() => process.exit(1));
});

module.exports = { app, server, io };
