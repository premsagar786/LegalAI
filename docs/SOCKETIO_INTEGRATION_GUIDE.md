# Socket.IO Integration Guide

## 🎯 Overview

Socket.IO has been successfully integrated into the Legal Consultation Platform to enable real-time communication features including:

- ✅ Real-time notifications
- ✅ Live chat messaging
- ✅ Appointment updates
- ✅ Document analysis status updates
- ✅ Typing indicators
- ✅ User presence tracking
- ✅ Room-based communication

---

## 🏗️ Architecture

### Backend (Server)

**Location:** `server/src/`

1. **Socket.IO Server Setup** (`server/src/server.js`)
   - Initialized with HTTP server
   - CORS configured for frontend origin
   - Accessible via `app.set('io', io)`

2. **Socket Service** (`server/src/services/socketService.js`)
   - Centralized socket event handling
   - User and room management
   - Event handlers for all real-time features

### Frontend (Client)

**Location:** `client/src/`

1. **Socket Context** (`client/src/context/SocketContext.jsx`)
   - React context provider for socket connection
   - Connection state management
   - Notification handling
   - Event emission utilities

2. **Notifications Component** (`client/src/components/Notifications.jsx`)
   - Real-time notification display
   - Unread badge counter
   - Connection status indicator
   - Dropdown notification list

---

## 🚀 Features

### 1. Real-Time Notifications

**Backend:**
```javascript
// Send notification to a user
const socketService = req.app.get('socketService');
socketService.sendNotification(userId, {
    type: 'appointment',
    message: 'Your appointment has been confirmed!',
    appointmentId: '123'
});
```

**Frontend:**
```javascript
import { useSocket } from '../context/SocketContext';

function MyComponent() {
    const { notifications } = useSocket();
    
    // Notifications are automatically displayed via toast
    // and available in the notifications array
}
```

### 2. Chat Messaging

**Backend:**
```javascript
// Messages are automatically broadcast to room members
// via the socketService.handleChatMessage method
```

**Frontend:**
```javascript
import { useSocket } from '../context/SocketContext';

function ChatComponent() {
    const { sendChatMessage, joinRoom, socket } = useSocket();
    
    // Join a chat room
    useEffect(() => {
        joinRoom('room-123');
        
        // Listen for messages
        socket?.on('chatMessage', (message) => {
            console.log('New message:', message);
        });
    }, []);
    
    // Send a message
    const handleSend = (message) => {
        sendChatMessage('room-123', message);
    };
}
```

### 3. Appointment Updates

**Backend:**
```javascript
const socketService = req.app.get('socketService');

socketService.handleAppointmentUpdate({
    userId: '123',
    lawyerId: '456',
    appointmentId: 'apt-789',
    status: 'confirmed',
    message: 'Your appointment has been confirmed for tomorrow at 10 AM'
});
```

**Frontend:**
```javascript
// Automatically received via notification system
socket?.on('appointmentUpdate', (data) => {
    console.log('Appointment update:', data);
});
```

### 4. Document Analysis Updates

**Backend:**
```javascript
const socketService = req.app.get('socketService');

socketService.handleDocumentAnalysis({
    userId: '123',
    documentId: 'doc-456',
    status: 'completed',
    progress: 100,
    result: { /* analysis results */ }
});
```

**Frontend:**
```javascript
socket?.on('documentAnalysisUpdate', (data) => {
    console.log('Analysis update:', data);
    // Update UI with progress or results
});
```

### 5. Typing Indicators

**Frontend:**
```javascript
const { emitEvent } = useSocket();

// When user starts typing
emitEvent('typing', {
    roomId: 'room-123',
    userId: user._id,
    userName: user.name,
    isTyping: true
});

// Listen for typing events
socket?.on('userTyping', (data) => {
    console.log(`${data.userName} is typing...`);
});
```

---

## 📡 Socket Events

### Client → Server Events

| Event | Description | Data |
|-------|-------------|------|
| `join` | Join user's personal room | `userId` |
| `joinRoom` | Join a specific room | `roomId` |
| `leaveRoom` | Leave a room | `roomId` |
| `chatMessage` | Send chat message | `{ roomId, message, userId, userName }` |
| `typing` | Typing indicator | `{ roomId, userId, userName, isTyping }` |
| `appointmentUpdate` | Update appointment | `{ userId, lawyerId, appointmentId, status, message }` |
| `documentAnalysisStatus` | Document analysis update | `{ userId, documentId, status, progress, result }` |

### Server → Client Events

| Event | Description | Data |
|-------|-------------|------|
| `connected` | Connection successful | `{ message, userId }` |
| `notification` | New notification | `{ type, message, timestamp, ... }` |
| `chatMessage` | New chat message | `{ id, message, userId, userName, timestamp }` |
| `userTyping` | User typing status | `{ userId, userName, isTyping, timestamp }` |
| `appointmentUpdate` | Appointment status change | `{ appointmentId, status, message }` |
| `documentAnalysisUpdate` | Document analysis progress | `{ documentId, status, progress, result }` |
| `userJoined` | User joined room | `{ socketId, roomId, timestamp }` |
| `userLeft` | User left room | `{ socketId, roomId, timestamp }` |

---

## 🎨 UI Components

### Notifications Bell

Located in the Navbar (top-right corner for authenticated users):

- **Badge:** Shows unread notification count
- **Connection Indicator:** Green (connected) / Red (disconnected)
- **Dropdown:** Click to view all notifications
- **Auto-dismiss:** Notifications auto-show as toast messages

### Notification Types

- 📅 **Appointment** - Appointment updates
- 📄 **Document** - Document analysis complete
- 💬 **Chat** - New messages
- 🔔 **System** - System notifications
- ✅ **Success** - Success messages
- ⚠️ **Warning** - Warning messages
- ❌ **Error** - Error messages

---

## 🔧 Configuration

### Backend Environment Variables

```env
PORT=5000
CLIENT_URL=http://localhost:5173
```

### Frontend Environment Variables

```env
VITE_API_URL=http://localhost:5000
```

---

## 💡 Usage Examples

### Example 1: Send Notification When Document is Uploaded

```javascript
// In documentController.js
const uploadDocument = async (req, res) => {
    try {
        // ... upload logic ...
        
        const socketService = req.app.get('socketService');
        socketService.sendNotification(req.user._id, {
            type: 'document',
            message: 'Document uploaded successfully!',
            documentId: document._id
        });
        
        res.json({ success: true, document });
    } catch (error) {
        // ... error handling ...
    }
};
```

### Example 2: Real-Time Chat Room

```javascript
// ChatRoom.jsx
import { useSocket } from '../context/SocketContext';

function ChatRoom({ roomId }) {
    const { socket, joinRoom, leaveRoom, sendChatMessage } = useSocket();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    
    useEffect(() => {
        // Join room
        joinRoom(roomId);
        
        // Listen for messages
        socket?.on('chatMessage', (message) => {
            setMessages(prev => [...prev, message]);
        });
        
        // Cleanup
        return () => {
            leaveRoom(roomId);
        };
    }, [roomId]);
    
    const handleSend = () => {
        if (input.trim()) {
            sendChatMessage(roomId, input);
            setInput('');
        }
    };
    
    return (
        <div className="chat-room">
            <div className="messages">
                {messages.map(msg => (
                    <div key={msg.id}>{msg.userName}: {msg.message}</div>
                ))}
            </div>
            <input 
                value={input} 
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            />
            <button onClick={handleSend}>Send</button>
        </div>
    );
}
```

### Example 3: Appointment Confirmation

```javascript
// In appointmentController.js
const confirmAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            { status: 'confirmed' },
            { new: true }
        );
        
        const socketService = req.app.get('socketService');
        
        // Notify both user and lawyer
        socketService.handleAppointmentUpdate({
            userId: appointment.userId,
            lawyerId: appointment.lawyerId,
            appointmentId: appointment._id,
            status: 'confirmed',
            message: `Appointment confirmed for ${appointment.date}`
        });
        
        res.json({ success: true, appointment });
    } catch (error) {
        // ... error handling ...
    }
};
```

---

## 🧪 Testing

### Test Connection

1. Open browser console
2. Look for: `✅ Socket.IO connected: [socket-id]`
3. Check connection indicator in navbar (green = connected)

### Test Notifications

```javascript
// In browser console (when authenticated)
// The socket is available via the SocketContext
```

### Test from Backend

```javascript
// In any controller
const socketService = req.app.get('socketService');

// Send test notification
socketService.sendNotification('USER_ID_HERE', {
    type: 'system',
    message: 'Test notification!'
});
```

---

## 🐛 Troubleshooting

### Connection Issues

1. **Check CORS settings** in `server/src/server.js`
2. **Verify API URL** in frontend `.env` file
3. **Check server logs** for connection errors
4. **Inspect browser console** for socket errors

### Notifications Not Showing

1. **Ensure user is authenticated** (socket joins user room on auth)
2. **Check notification permissions** in browser
3. **Verify userId** matches between backend and frontend
4. **Check browser console** for errors

### Messages Not Received

1. **Verify room joining** - check console logs
2. **Check event names** - must match exactly
3. **Inspect socket listeners** - ensure they're set up correctly

---

## 🎯 Next Steps

### Recommended Enhancements

1. **Persistent Notifications**
   - Store notifications in database
   - Mark as read/unread
   - Notification history

2. **Enhanced Chat**
   - File sharing
   - Message reactions
   - Read receipts
   - Message editing/deletion

3. **Video/Audio Calls**
   - Integrate WebRTC
   - Screen sharing
   - Recording

4. **Presence System**
   - Online/offline status
   - Last seen timestamp
   - Active users list

5. **Push Notifications**
   - Service worker integration
   - Browser push notifications
   - Mobile notifications

---

## 📚 Resources

- [Socket.IO Documentation](https://socket.io/docs/v4/)
- [Socket.IO Client API](https://socket.io/docs/v4/client-api/)
- [React Context API](https://react.dev/reference/react/useContext)
- [WebSocket Protocol](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)

---

## ✅ Integration Complete!

Socket.IO is now fully integrated and ready to use. The notification bell in the navbar will show real-time updates, and you can extend the functionality by following the examples above.

**Happy coding! 🚀**
