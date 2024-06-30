const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const errorMiddleware = require('./middleware/error');
const connectDatabase = require('./config/database');

// Load environment variables
dotenv.config({ path: 'Backend/config/config.env' });

// Handling Uncaught Exceptions
process.on('uncaughtException', (err) => {
    console.log(`Error: ${err.message}`);
    console.log('Shutting down the server due to Uncaught Exception');
    process.exit(1);
});

// Connect to the database
connectDatabase();

const app = express();

// Middleware to parse cookies
app.use(cookieParser());

// Middleware to parse JSON
app.use(express.json());

// Route imports
const products = require('./routes/productRoute');
const users = require('./routes/UserRoute');
const order=require("./routes/orderRoute");

// Use routes
app.use('/api/v1', products);
app.use('/api/v1', users);
app.use('/api/v1',order);

// Middleware for handling errors
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Handle Unhandled Promise Rejections
process.on('unhandledRejection', (err) => {
    console.log(`Error: ${err.message}`);
    console.log('Shutting down the server due to Unhandled Promise Rejection');

    server.close(() => {
        process.exit(1);
    });
});
