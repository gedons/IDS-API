require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const { createLogger, transports, format } = require('winston');
const connectDB = require('./src/config/db');
const bodyParser = require('body-parser');
const passport = require('passport');
const http = require('http');
const socketIo = require('socket.io');
const session = require('express-session');
const RedisStore = require('connect-redis').default;
const redisClient = require('./src/config/redis');


const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Logger setup
const logger = createLogger({
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'logs/app.log' })
  ]
});

// Passport middleware
app.use(passport.initialize());
require('./src/config/passport')(passport);

// Redis session store
app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET,  
  resave: false,
  saveUninitialized: false
}));

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/logs', require('./src/routes/logs'));
app.use('/api/signatures', require('./routes/signatures'));

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.message);
  res.status(500).send('Server Error');
});

// Socket io
const server = http.createServer(app);
const io = socketIo(server);

io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

app.set('io', io);

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
