import { PrismaClient } from '@prisma/client';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { userRouter } from './routes/userRouter.js';
import { listingRouter } from './routes/listingRouter.js';
dotenv.config();
export const prisma = new PrismaClient();
const app = express();
app.use(cors());
app.use(express.json());
app.use(async (req, res, next) => {
  // check if there's an auth token in the header
  try {
    // Check if the request has an "Authorization" header
    if (!req.headers.authorization) {
      return next();
    } // If not, continue to the next middleware

    const token = req.headers.authorization.split(' ')[1];
    // Use the userId from the decoded token to find the corresponding user in the database
    const { userId } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    // If no user is found with the given userId, continue to the next middleware
    if (!user) {
      return next();
    }
    // Remove the "password" property from the user object for security (assuming it's sensitive)
    delete user.password;
    // Attach the user object to the request object for later use in route handlers
    req.user = user;
    next();
  } catch (error) {
    res.send({ success: false, error: error.message });
  }
});

app.use('/users', userRouter);
app.use('/listings', listingRouter);

//404 Route not found
app.use((req, res, next) => {
  res.status(404).send({ success: false, error: 'Route does not exist' });
});

//Error Handling Middleware
app.use((error, req, res, next) => {
  res.send({ success: false, error: error.message });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
