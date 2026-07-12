import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma';
import { generateToken, AuthenticatedRequest } from '../middleware/auth';

export async function signup(req: AuthenticatedRequest, res: Response) {
  try {
    // Enforce that only logged-in fleet managers can create users
    if (!req.user || req.user.role !== 'fleet_manager') {
      res.status(403).json({ error: 'Forbidden: Only fleet managers can register users' });
      return;
    }

    const { email, password, name, role } = req.body;

    // Block self-elevation: prevent creating another fleet_manager unless authorized
    if (role === 'fleet_manager' && req.user.role !== 'fleet_manager') {
      res.status(403).json({ error: 'Forbidden: Cannot create an elevated fleet_manager role' });
      return;
    }

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

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

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
