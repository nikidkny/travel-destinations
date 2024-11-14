import express, { Request, Response } from 'express';
import { authenticator } from '../utils/auth';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import { User } from '../database';
import bcrypt from 'bcrypt';

const router = express.Router();

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;
  const user = await User.findOne({ username: username });

  if (!user) {
    res.status(404);
    res.json({ message: 'user not found' });
    return;
  }

  if (user && (await bcrypt.compare(password, user.password))) {
    const payLoad = {
      username: user.username,
      id: user._id,
    };

    const accessToken = jwt.sign(payLoad, process.env.JWT_ACCESS_SECRET, {
      expiresIn: `${process.env.JWT_ACCESS_LIFESPAN}m`,
    });
    const refreshToken = jwt.sign(payLoad, process.env.JWT_REFRESH_SECRET, {
      expiresIn: `${process.env.JWT_REFRESH_LIFESPAN}d`,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/api/v1/auth/refresh',
      maxAge: Number(process.env.JWT_REFRESH_LIFESPAN) * 24 * 60 * 60 * 1000,
    });
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: true,
      maxAge: Number(process.env.JWT_ACCESS_LIFESPAN) * 60 * 1000,
      sameSite: 'lax',
    });

    res.json({ message: 'successfully logged in', username: username, isLoggedIn: true });
  } else {
    res.status(404);
    res.json({ message: 'incorrect password' });
  }
});

router.post('/signup', async (req, res) => {
  const { username, name, password } = req.body;
  const existingUser = await User.findOne({ username: username });

  if (existingUser) {
    res.status(409).json({ message: 'username already in use' });
    return;
  } else {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ ...req.body, password: hashedPassword });
    await user.save();

    res.status(200).json({
      message: 'successfully signed up. You may log in now.',
      username: username,
      isLoggedIn: false, // not logged in yet, just signed up
    });
  }
});

router.get('/logout', (req: Request, res: Response): void => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.json({ message: 'successfully logged out', isLoggedIn: false });
});

router.get('/refresh', authenticator, (req: Request, res: Response): void => {
  const timeStamp = new Date().toTimeString();
  console.log('REFRESH ' + timeStamp);

  res.json('refresh token confirmed and sent');
});

router.get('/status', authenticator, (req: Request, res: Response) => {
  res.status(200).json({ authenticated: true });
});

export default router;
