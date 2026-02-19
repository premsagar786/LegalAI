import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const { user } = useAuth();

    useEffect(() => {
        // Initialize socket connection
        const socketInstance = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
            autoConnect: true,
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5
        });

        // Connection event handlers
        socketInstance.on('connect', () => {
            console.log('✅ Socket.IO connected:', socketInstance.id);
            setIsConnected(true);

            // Join user's room if authenticated
            if (user?._id) {
                socketInstance.emit('join', user._id);
            }
        });

        socketInstance.on('disconnect', () => {
            console.log('❌ Socket.IO disconnected');
            setIsConnected(false);
        });

        socketInstance.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            setIsConnected(false);
        });

        // Notification handler
        socketInstance.on('notification', (data) => {
            console.log('📬 New notification:', data);

            // Add to notifications list
            setNotifications(prev => [{
                id: Date.now(),
                ...data,
                timestamp: new Date()
            }, ...prev]);

            // Show toast notification
            toast.success(data.message, {
                duration: 4000,
                icon: getNotificationIcon(data.type)
            });
        });

        // Appointment update handler
        socketInstance.on('appointmentUpdate', (data) => {
            console.log('📅 Appointment update:', data);
            toast.info(`Appointment ${data.status}: ${data.message}`, {
                duration: 5000
            });
        });

        // Chat message handler
        socketInstance.on('chatMessage', (data) => {
            console.log('💬 New chat message:', data);
        });

        // Document analysis complete handler
        socketInstance.on('documentAnalysisComplete', (data) => {
            console.log('📄 Document analysis complete:', data);
            toast.success('Document analysis is ready!', {
                duration: 4000,
                icon: '📄'
            });
        });

        setSocket(socketInstance);

        // Cleanup on unmount
        return () => {
            socketInstance.disconnect();
        };
    }, [user]);

    // Helper function to get notification icon
    const getNotificationIcon = (type) => {
        const icons = {
            appointment: '📅',
            document: '📄',
            chat: '💬',
            system: '🔔',
            success: '✅',
            warning: '⚠️',
            error: '❌'
        };
        return icons[type] || '🔔';
    };

    // Emit events
    const emitEvent = (eventName, data) => {
        if (socket && isConnected) {
            socket.emit(eventName, data);
        } else {
            console.warn('Socket not connected. Cannot emit event:', eventName);
        }
    };

    // Join a room
    const joinRoom = (roomId) => {
        if (socket && isConnected) {
            socket.emit('joinRoom', roomId);
            console.log(`Joined room: ${roomId}`);
        }
    };

    // Leave a room
    const leaveRoom = (roomId) => {
        if (socket && isConnected) {
            socket.emit('leaveRoom', roomId);
            console.log(`Left room: ${roomId}`);
        }
    };

    // Send chat message
    const sendChatMessage = (roomId, message) => {
        if (socket && isConnected) {
            socket.emit('chatMessage', {
                roomId,
                message,
                userId: user?._id,
                userName: user?.name,
                timestamp: new Date()
            });
        }
    };

    // Clear notifications
    const clearNotifications = () => {
        setNotifications([]);
    };

    // Mark notification as read
    const markAsRead = (notificationId) => {
        setNotifications(prev =>
            prev.map(notif =>
                notif.id === notificationId
                    ? { ...notif, read: true }
                    : notif
            )
        );
    };

    const value = {
        socket,
        isConnected,
        notifications,
        emitEvent,
        joinRoom,
        leaveRoom,
        sendChatMessage,
        clearNotifications,
        markAsRead
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};
