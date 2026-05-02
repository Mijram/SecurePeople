import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import { getPool } from '../database/db';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// GET /api/users/me - Get current user profile
router.get('/me', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const pool = getPool();
    const client = await pool.connect();
    const result = await client.query(
      'SELECT id, full_name, email, nickname, phone, avatar_url, created_at FROM users WHERE id = $1',
      [req.user!.userId]
    );
    client.release();

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PUT /api/users/me - Update current user profile
router.put(
  '/me',
  authenticateToken,
  [
    body('nickname')
      .optional()
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage('El nickname debe tener entre 3 y 30 caracteres')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('El nickname solo puede contener letras, números y guiones bajos'),
    body('avatar_url').optional(),
    body('new_password')
      .optional()
      .isLength({ min: 6 })
      .withMessage('La nueva contraseña debe tener al menos 6 caracteres'),
    body('confirm_new_password').custom((value, { req }) => {
      if (req.body.new_password && value !== req.body.new_password) {
        throw new Error('Las contraseñas no coinciden');
      }
      return true;
    }),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { nickname, avatar_url, current_password, new_password } = req.body;

    try {
      const pool = getPool();
      const client = await pool.connect();

      // Get current user
      const userResult = await client.query(
        'SELECT * FROM users WHERE id = $1',
        [req.user!.userId]
      );

      if (userResult.rows.length === 0) {
        client.release();
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }

      const user = userResult.rows[0];

      // If changing password, verify current password
      if (new_password) {
        if (!current_password) {
          client.release();
          res.status(400).json({ error: 'Se requiere la contraseña actual para cambiarla' });
          return;
        }
        const isValid = await bcrypt.compare(current_password, user.password_hash);
        if (!isValid) {
          client.release();
          res.status(401).json({ error: 'Contraseña actual incorrecta' });
          return;
        }
      }

      // Check nickname uniqueness if changing
      if (nickname && nickname !== user.nickname) {
        const nicknameCheck = await client.query(
          'SELECT id FROM users WHERE nickname = $1 AND id != $2',
          [nickname, req.user!.userId]
        );
        if (nicknameCheck.rows.length > 0) {
          client.release();
          res.status(409).json({ error: 'El nickname ya está en uso' });
          return;
        }
      }

      // Build update query dynamically
      const setClauses: string[] = [];
      const values: unknown[] = [];
      let paramCount = 1;

      if (nickname) {
        setClauses.push(`nickname = $${paramCount++}`);
        values.push(nickname);
      }
      if (avatar_url !== undefined) {
        setClauses.push(`avatar_url = $${paramCount++}`);
        values.push(avatar_url);
      }
      if (new_password) {
        const saltRounds = 10;
        const password_hash = await bcrypt.hash(new_password, saltRounds);
        setClauses.push(`password_hash = $${paramCount++}`);
        values.push(password_hash);
      }

      if (setClauses.length === 0) {
        client.release();
        res.json({
          message: 'No hay cambios para actualizar',
          user: {
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            nickname: user.nickname,
            phone: user.phone,
            avatar_url: user.avatar_url,
          },
        });
        return;
      }

      setClauses.push(`updated_at = NOW()`);
      values.push(req.user!.userId);

      const updateQuery = `
        UPDATE users SET ${setClauses.join(', ')}
        WHERE id = $${paramCount}
        RETURNING id, full_name, email, nickname, phone, avatar_url, updated_at
      `;

      const result = await client.query(updateQuery, values);
      client.release();

      res.json({
        message: 'Perfil actualizado exitosamente',
        user: result.rows[0],
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
);

export default router;
