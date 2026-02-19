/**
 * Socket.IO Service
 * Handles all real-time communication events
 */

class SocketService {
    constructor(io) {
        this.io = io;
        this.users = new Map(); // userId -> socketId mapping
        this.rooms = new Map(); // roomId -> Set of socketIds
    }

    /**
     * Initialize socket event handlers
     */
    initialize() {
        this.io.on('connection', (socket) => {
            console.log(`✅ User connected: ${socket.id}`);

            // Handle user joining their personal room
            socket.on('join', (userId) => {
                this.handleUserJoin(socket, userId);
            });

            // Handle joining a specific room (chat, appointment, etc.)
            socket.on('joinRoom', (roomId) => {
                this.handleRoomJoin(socket, roomId);
            });

            // Handle leaving a room
            socket.on('leaveRoom', (roomId) => {
                this.handleRoomLeave(socket, roomId);
            });

            // Handle chat messages
            socket.on('chatMessage', (data) => {
                this.handleChatMessage(socket, data);
            });

            // Handle typing indicator
            socket.on('typing', (data) => {
                this.handleTyping(socket, data);
            });

            // Handle appointment updates
            socket.on('appointmentUpdate', (data) => {
                this.handleAppointmentUpdate(data);
            });

            // Handle document analysis status
            socket.on('documentAnalysisStatus', (data) => {
                this.handleDocumentAnalysis(data);
            });

            // Handle disconnection
            socket.on('disconnect', () => {
                this.handleDisconnect(socket);
            });
        });
    }

    /**
     * Handle user joining their personal room
     */
    handleUserJoin(socket, userId) {
        socket.join(userId);
        this.users.set(userId, socket.id);
        console.log(`👤 User ${userId} joined their room`);

        // Notify user of successful connection
        socket.emit('connected', {
            message: 'Successfully connected to real-time updates',
            userId
        });
    }

    /**
     * Handle joining a specific room
     */
    handleRoomJoin(socket, roomId) {
        socket.join(roomId);

        // Track room membership
        if (!this.rooms.has(roomId)) {
            this.rooms.set(roomId, new Set());
        }
        this.rooms.get(roomId).add(socket.id);

        console.log(`🚪 Socket ${socket.id} joined room: ${roomId}`);

        // Notify others in the room
        socket.to(roomId).emit('userJoined', {
            socketId: socket.id,
            roomId,
            timestamp: new Date()
        });
    }

    /**
     * Handle leaving a room
     */
    handleRoomLeave(socket, roomId) {
        socket.leave(roomId);

        // Update room tracking
        if (this.rooms.has(roomId)) {
            this.rooms.get(roomId).delete(socket.id);
            if (this.rooms.get(roomId).size === 0) {
                this.rooms.delete(roomId);
            }
        }

        console.log(`🚪 Socket ${socket.id} left room: ${roomId}`);

        // Notify others in the room
        socket.to(roomId).emit('userLeft', {
            socketId: socket.id,
            roomId,
            timestamp: new Date()
        });
    }

    /**
     * Handle chat messages
     */
    handleChatMessage(socket, data) {
        const { roomId, message, userId, userName } = data;

        const messageData = {
            id: Date.now(),
            message,
            userId,
            userName,
            timestamp: new Date(),
            socketId: socket.id
        };

        // Broadcast to room
        this.io.to(roomId).emit('chatMessage', messageData);
        console.log(`💬 Message sent to room ${roomId} by ${userName}`);
    }

    /**
     * Handle typing indicator
     */
    handleTyping(socket, data) {
        const { roomId, userId, userName, isTyping } = data;

        socket.to(roomId).emit('userTyping', {
            userId,
            userName,
            isTyping,
            timestamp: new Date()
        });
    }

    /**
     * Handle appointment updates
     */
    handleAppointmentUpdate(data) {
        const { userId, lawyerId, appointmentId, status, message } = data;

        // Notify both user and lawyer
        this.sendNotification(userId, {
            type: 'appointment',
            message,
            appointmentId,
            status
        });

        if (lawyerId) {
            this.sendNotification(lawyerId, {
                type: 'appointment',
                message,
                appointmentId,
                status
            });
        }

        console.log(`📅 Appointment update sent: ${appointmentId} - ${status}`);
    }

    /**
     * Handle document analysis updates
     */
    handleDocumentAnalysis(data) {
        const { userId, documentId, status, progress, result } = data;

        this.io.to(userId).emit('documentAnalysisUpdate', {
            documentId,
            status,
            progress,
            result,
            timestamp: new Date()
        });

        // Send completion notification
        if (status === 'completed') {
            this.sendNotification(userId, {
                type: 'document',
                message: 'Your document analysis is complete!',
                documentId
            });
        }

        console.log(`📄 Document analysis update: ${documentId} - ${status}`);
    }

    /**
     * Handle user disconnect
     */
    handleDisconnect(socket) {
        // Remove from users map
        for (const [userId, socketId] of this.users.entries()) {
            if (socketId === socket.id) {
                this.users.delete(userId);
                console.log(`👤 User ${userId} disconnected`);
                break;
            }
        }

        // Remove from all rooms
        for (const [roomId, sockets] of this.rooms.entries()) {
            if (sockets.has(socket.id)) {
                sockets.delete(socket.id);
                socket.to(roomId).emit('userLeft', {
                    socketId: socket.id,
                    roomId,
                    timestamp: new Date()
                });
            }
        }

        console.log(`❌ Socket disconnected: ${socket.id}`);
    }

    /**
     * Send notification to a specific user
     */
    sendNotification(userId, notification) {
        this.io.to(userId).emit('notification', {
            ...notification,
            timestamp: new Date()
        });
    }

    /**
     * Broadcast to all connected users
     */
    broadcast(event, data) {
        this.io.emit(event, data);
    }

    /**
     * Send to specific room
     */
    sendToRoom(roomId, event, data) {
        this.io.to(roomId).emit(event, data);
    }

    /**
     * Get online users count
     */
    getOnlineUsersCount() {
        return this.users.size;
    }

    /**
     * Check if user is online
     */
    isUserOnline(userId) {
        return this.users.has(userId);
    }

    /**
     * Get room members count
     */
    getRoomMembersCount(roomId) {
        return this.rooms.get(roomId)?.size || 0;
    }
}

module.exports = SocketService;
