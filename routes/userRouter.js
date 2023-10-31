import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../server.js';

export const userRouter = express.Router();

userRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.send({
        success: false,
        error: 'You must provide an email and password when logging in.',
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (!user) {
      return res.send({
        success: false,
        error: 'Email and/or password is invalid.',
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.send({
        success: false,
        error: 'Email and/or password is invalid.',
      });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
    res.send({
      success: true,
      token,
    });
  } catch (error) {
    return res.send({
      success: false,
      error: error.message,
    });
  }
});

userRouter.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name) {
      return res.send({
        success: false,
        error: 'Please enter your name.',
      });
    }
    if (!email) {
      return res.send({
        success: false,
        error: 'Please enter your email.',
      });
    }
    if (!password) {
      return res.send({
        success: false,
        error: 'Please enter your password.',
      });
    }
    if (!role) {
      return res.send({
        success: false,
        error: 'Please select a role.',
      });
    }
    const checkUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (checkUser) {
      return res.send({
        success: false,
        error: 'Email already exists, please login',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
    res.send({
      success: true,
      token,
    });
  } catch (error) {
    return res.send({
      success: false,
      error: error.message,
    });
  }
});
userRouter.get('/token', async (req, res) => {
  try {
    if (!req.user) {
      return res.send({
        success: false,
        error: 'Please login',
      });
    }
    const user = { name: req.user.name, role: req.user.role };
    res.send({
      success: true,
      user,
    });
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});
