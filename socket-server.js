const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer();

const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://drexel-bnb.vercel.app",
  "https://*.vercel.app",
];

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("joinRoom", (conversationId) => {
    socket.join(conversationId);
    console.log(`Socket ${socket.id} joined room ${conversationId}`);
  });

  socket.on("sendMessage", (messageData) => {
    if (!messageData || !messageData.conversation_id) return;
    socket.to(messageData.conversation_id).emit("receiveMessage", messageData);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Socket.IO server listening on port ${PORT}`);
});

module.exports = { io, server };
