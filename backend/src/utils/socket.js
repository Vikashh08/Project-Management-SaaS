const socketIo = require('socket.io');

let io;
const onlineUsers = new Map();

const initializeSocket = (server) => {
  io = socketIo(server, {
    cors: {
      origin: '*', // For production, restrict to frontend URL
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}`);

    // User joins with their ID
    socket.on('setup', (userId) => {
      socket.join(userId);
      onlineUsers.set(userId, socket.id);
      socket.emit('connected');
      io.emit('online_users', Array.from(onlineUsers.keys()));
    });

    // Join a project room
    socket.on('join_project', (projectId) => {
      socket.join(`project_${projectId}`);
      console.log(`User joined project room: project_${projectId}`);
    });

    // Join a task room
    socket.on('join_task', (taskId) => {
      socket.join(`task_${taskId}`);
      console.log(`User joined task room: task_${taskId}`);
    });

    // Typing indicator
    socket.on('typing', ({ room, userName }) => {
      socket.in(room).emit('typing', userName);
    });

    socket.on('stop_typing', (room) => {
      socket.in(room).emit('stop_typing');
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          break;
        }
      }
      io.emit('online_users', Array.from(onlineUsers.keys()));
    });
  });

  return io;
};

const getIo = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

module.exports = { initializeSocket, getIo };
