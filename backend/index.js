// Importing required modules
import express from 'express';
import authRouter from './routes/auth-route.js'; 
import cookieparser from 'cookie-parser' 
import userRouter from './routes/user-router.js';
import postRouter from './routes/post-router.js';
import chatRoute  from './routes/chat-route.js';
import cors from 'cors';
// Creating an instance of Express
const app = express();
app.use(express.json());
app.use(cookieparser());
app.use(cors({origin:'http://localhost:5173', credentials:true}));
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter); 
app.use("/api/post", postRouter); 
app.use('/api/chats', chatRoute)

// Define a basic route


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Define the port to listen on
const PORT = 80;

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
