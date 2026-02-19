import { useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { Bell, X, Check, Clock, FileText, Calendar, MessageSquare } from 'lucide-react';
import './Notifications.css';

const Notifications = () => {
    const { notifications, clearNotifications, markAsRead, isConnected } = useSocket();
    const [isOpen, setIsOpen] = useState(false);

    const unreadCount = notifications.filter(n => !n.read).length;

    const getIcon = (type) => {
        const icons = {
            appointment: <Calendar size={18} />,
            document: <FileText size={18} />,
            chat: <MessageSquare size={18} />,
            system: <Bell size={18} />
        };
        return icons[type] || <Bell size={18} />;
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;

        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    };

    return (
        <div className="notifications-container">
            <button
                className="notification-bell"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Notifications"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount}</span>
                )}
                <span className={`connection-indicator ${isConnected ? 'connected' : 'disconnected'}`} />
            </button>

            {isOpen && (
                <div className="notifications-dropdown">
                    <div className="notifications-header">
                        <h3>Notifications</h3>
                        {notifications.length > 0 && (
                            <button
                                className="clear-all-btn"
                                onClick={clearNotifications}
                            >
                                Clear all
                            </button>
                        )}
                    </div>

                    <div className="notifications-list">
                        {notifications.length === 0 ? (
                            <div className="no-notifications">
                                <Bell size={40} />
                                <p>No notifications yet</p>
                                <span className="connection-status">
                                    {isConnected ? '✅ Connected' : '❌ Disconnected'}
                                </span>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                                    onClick={() => markAsRead(notification.id)}
                                >
                                    <div className="notification-icon">
                                        {getIcon(notification.type)}
                                    </div>
                                    <div className="notification-content">
                                        <p className="notification-message">
                                            {notification.message}
                                        </p>
                                        <span className="notification-time">
                                            <Clock size={12} />
                                            {formatTime(notification.timestamp)}
                                        </span>
                                    </div>
                                    {!notification.read && (
                                        <div className="unread-dot" />
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Notifications;
