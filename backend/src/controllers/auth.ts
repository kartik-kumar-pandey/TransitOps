import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma';
import { generateToken, AuthenticatedRequest } from '../middleware/auth';

export async function signup(req: Request, res: Response) {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role || 'dispatcher',
      },
    });

    const token = generateToken(user.id, user.role);

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
    return;
  } catch (error: any) {
    res.status(500).json({ error: error.message });
    return;
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check if account is locked
    if (user.lockUntil && new Date(user.lockUntil) > new Date()) {
      const minutesLeft = Math.ceil((new Date(user.lockUntil).getTime() - Date.now()) / 60000);
      return res.status(403).json({
        error: `Account is temporarily locked due to 5 incorrect login attempts. Try again in ${minutesLeft} minute(s).`
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      const attempts = user.failedLoginAttempts + 1;
      const isLockedNow = attempts >= 5;
      const lockUntil = isLockedNow ? new Date(Date.now() + 15 * 60 * 1000) : null; // 15 mins

      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: attempts,
          lockUntil
        }
      });

      if (isLockedNow) {
        return res.status(403).json({
          error: 'Account has been temporarily locked for 15 minutes due to 5 failed login attempts.'
        });
      }

      return res.status(401).json({
        error: `Invalid email or password. ${5 - attempts} attempt(s) remaining.`
      });
    }

    // Reset failed attempts on success
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lockUntil: null
      }
    });

    const token = generateToken(user.id, user.role);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
    return;
  } catch (error: any) {
    res.status(500).json({ error: error.message });
    return;
  }
}

export async function forgotPassword(req: Request, res: Response) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Return 200 to prevent user enumeration
      return res.status(200).json({
        message: 'If the email exists, a reset code has been generated.',
        resetToken: 'SIMULATED-SUCCESS'
      });
    }

    const resetToken = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit PIN
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry
      }
    });

    console.log(`[PASSWORD RESET CODE FOR ${email}]: ${resetToken}`);

    return res.status(200).json({
      message: 'Password reset code generated.',
      resetToken // Return the code directly in body for user demo/testing convenience
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function resetPassword(req: Request, res: Response) {
  try {
    const { email, resetToken, newPassword } = req.body;
    if (!email || !resetToken || !newPassword) {
      return res.status(400).json({ error: 'Email, resetToken, and newPassword are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.resetToken !== resetToken || !user.resetTokenExpiry || new Date(user.resetTokenExpiry) < new Date()) {
      return res.status(400).json({ error: 'Invalid or expired password reset code.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
        failedLoginAttempts: 0,
        lockUntil: null
      }
    });

    return res.status(200).json({ message: 'Password has been reset successfully.' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
