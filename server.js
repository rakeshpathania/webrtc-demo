const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

// In-memory storage
const sessions = new Map();
const agents = new Map();

app.use(express.static('public'));
app.use(express.json());

// Agent creates session
app.post('/api/create-session', (req, res) => {
  const { customerName, customerPhone } = req.body;
  const sessionId = uuidv4();
  const sessionUrl = `${req.protocol}://${req.get('host')}/customer/${sessionId}`;
  
  sessions.set(sessionId, {
    customerName,
    customerPhone,
    createdAt: Date.now(),
    status: 'waiting'
  });

  // Auto-expire after 30 minutes
  setTimeout(() => sessions.delete(sessionId), 30 * 60 * 1000);

  console.log(`Session created: ${sessionId} for ${customerName}`);
  res.json({ sessionId, sessionUrl });
});

// Customer page
app.get('/customer/:sessionId', (req, res) => {
  const session = sessions.get(req.params.sessionId);
  if (!session) {
    return res.status(404).send('Session not found or expired');
  }
  res.sendFile(path.join(__dirname, 'public', 'customer.html'));
});

// WebRTC signaling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join-as-agent', (data) => {
    agents.set(socket.id, data);
    socket.join('agents');
    console.log('Agent joined:', socket.id);
  });

  socket.on('join-session', (sessionId) => {
    console.log(`Customer ${socket.id} trying to join session: ${sessionId}`);
    const session = sessions.get(sessionId);
    if (session) {
      socket.join(sessionId);
      session.status = 'connected';
      socket.to('agents').emit('customer-joined', { sessionId, session });
      console.log(`Customer ${socket.id} joined session: ${sessionId}`);
    } else {
      console.log(`Session ${sessionId} not found`);
    }
  });

  socket.on('webrtc-offer', (data) => {
    console.log('Relaying offer for session:', data.sessionId);
    socket.to('agents').emit('webrtc-offer', data);
  });

  socket.on('webrtc-answer', (data) => {
    console.log('Relaying answer for session:', data.sessionId);
    socket.to(data.sessionId).emit('webrtc-answer', data);
  });

  socket.on('webrtc-ice-candidate', (data) => {
    console.log('Relaying ICE candidate for session:', data.sessionId);
    socket.broadcast.emit('webrtc-ice-candidate', data);
  });

  socket.on('disconnect', () => {
    agents.delete(socket.id);
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});