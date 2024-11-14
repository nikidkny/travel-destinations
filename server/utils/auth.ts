import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import 'dotenv/config';

// Authenticator middleware
export const authenticator = (req: Request, res: Response, next: NextFunction): void => {
  const { accessToken, refreshToken } = req.cookies;

  if (accessToken) {
    try {
      const { iat, exp, ...userInfo } = jwt.verify(
        accessToken,
        process.env.JWT_ACCESS_SECRET!,
      ) as JwtPayload;
      res.locals.userInfo = userInfo;
      next();
      return;
    } catch (err) {
      console.log('Invalid Access Token:', err.message);
    }
  }

  // If no valid access token, check if there's a refresh token
  if (refreshToken) {
    try {
      const { iat, exp, ...userInfo } = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET!,
      ) as JwtPayload;
      res.locals.userInfo = userInfo;

      // Issue a new access token
      const newAccessToken = jwt.sign(userInfo, process.env.JWT_ACCESS_SECRET!, {
        expiresIn: `${process.env.JWT_ACCESS_LIFESPAN}m`,
      });

      res.clearCookie('accessToken');
      res.cookie('accessToken', newAccessToken, {
        httpOnly: true,
        secure: true,
        maxAge: Number(process.env.JWT_ACCESS_LIFESPAN) * 60 * 1000, // Lifetime of access token in ms
        sameSite: 'none',
      });

      next();
      return;
    } catch (err) {
      console.log('Invalid Refresh Token:', err.message);
      res.status(401).json('Invalid Refresh Token');
      return;
    }
  }

  // If no valid access token or refresh token, reject the request
  res.status(401).json('UNAUTHORIZED REQUEST - NO TOKEN');
  return;
};
