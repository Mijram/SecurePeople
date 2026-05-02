import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { getPool } from '../database/db';
import { JwtPayload } from '../types';

const router = Router();

// POST /api/auth/register
router.post(
  '/register',
  [
    body('full_name').trim().notEmpty().withMessage('El nombre completo es obligatorio'),
    body('email').isEmail().withMessage('Correo electrónico inválido').normalizeEmail(),
    body('nickname')
      .trim()
      .notEmpty()
      .withMessage('El nickname es obligatorio')
      .isLength({ min: 3, max: 30 })
      .withMessage('El nickname debe tener entre 3 y 30 caracteres')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('El nickname solo puede contener letras, números y guiones bajos'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('confirm_password').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Las contraseñas no coinciden');
      }
      return true;
    }),
    body('phone').optional().trim(),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { full_name, email, nickname, password, phone } = req.body;

    try {
      const client = await getPool().connect();

      // Check if email already exists
      const emailCheck = await client.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );
      if (emailCheck.rows.length > 0) {
        client.release();
        res.status(409).json({ error: 'El correo electrónico ya está registrado' });
        return;
      }

      // Check if nickname already exists
      const nicknameCheck = await client.query(
        'SELECT id FROM users WHERE nickname = $1',
        [nickname]
      );
      if (nicknameCheck.rows.length > 0) {
        client.release();
        res.status(409).json({ error: 'El nickname ya está en uso' });
        return;
      }

      // Hash password
      const saltRounds = 10;
      const password_hash = await bcrypt.hash(password, saltRounds);

      // Insert user with generated UUID
      const userId = uuidv4();
      const result = await client.query(
        `INSERT INTO users (id, full_name, email, nickname, password_hash, phone)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, full_name, email, nickname, phone, avatar_url, created_at`,
        [userId, full_name, email, nickname, password_hash, phone || null]
      );

      client.release();

      const user = result.rows[0];

      // Generate JWT
      const secret = process.env.JWT_SECRET || 'securepeople_default_secret';
      const payload: JwtPayload = {
        userId: user.id,
        email: user.email,
        nickname: user.nickname,
      };
      const token = jwt.sign(payload, secret, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      } as jwt.SignOptions);

      res.status(201).json({
        message: 'Usuario registrado exitosamente',
        token,
        user: {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          nickname: user.nickname,
          phone: user.phone,
          avatar_url: user.avatar_url,
          created_at: user.created_at,
        },
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
);

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Correo electrónico inválido').normalizeEmail(),
    body('password').notEmpty().withMessage('La contraseña es obligatoria'),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { email, password } = req.body;

    try {
      const client = await getPool().connect();

      const result = await client.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );
      client.release();

      if (result.rows.length === 0) {
        res.status(401).json({ error: 'Credenciales inválidas' });
        return;
      }

      const user = result.rows[0];

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        res.status(401).json({ error: 'Credenciales inválidas' });
        return;
      }

      // Generate JWT
      const secret = process.env.JWT_SECRET || 'securepeople_default_secret';
      const payload: JwtPayload = {
        userId: user.id,
        email: user.email,
        nickname: user.nickname,
      };
      const token = jwt.sign(payload, secret, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      } as jwt.SignOptions);

      res.json({
        message: 'Inicio de sesión exitoso',
        token,
        user: {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          nickname: user.nickname,
          phone: user.phone,
          avatar_url: user.avatar_url,
          created_at: user.created_at,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
);

export default router;
