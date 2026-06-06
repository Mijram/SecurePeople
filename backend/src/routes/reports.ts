import { Router, Request, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { getPool } from '../database/db';
import { authenticateToken } from '../middleware/auth';
import { ReportCategory } from '../types';
import { Server as SocketServer } from 'socket.io';

const router = Router();

const VALID_CATEGORIES: ReportCategory[] = [
  'Robo',
  'Accidente',
  'Incendio',
  'Emergencia médica',
  'Manifestación',
  'Obstrucción vial',
  'Situación sospechosa',
  'Otro',
];

// Inject socket.io instance
let io: SocketServer | null = null;
export function setSocketIO(socketIO: SocketServer): void {
  io = socketIO;
}

// GET /api/reports - Get all active reports
router.get(
  '/',
  [
    query('lat').optional().isFloat(),
    query('lng').optional().isFloat(),
    query('radius').optional().isFloat(),
    query('category').optional().isString(),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('offset').optional().isInt({ min: 0 }),
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const category = req.query.category as string | undefined;

      const pool = getPool();
      const client = await pool.connect();

      let queryStr = `
        SELECT r.*, u.nickname, u.avatar_url
        FROM reports r
        JOIN users u ON r.user_id = u.id
        WHERE r.status = 'active'
      `;
      const params: unknown[] = [];
      let paramCount = 1;

      if (category && VALID_CATEGORIES.includes(category as ReportCategory)) {
        queryStr += ` AND r.category = $${paramCount++}`;
        params.push(category);
      }

      queryStr += ` ORDER BY r.created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
      params.push(limit, offset);

      const result = await client.query(queryStr, params);
      client.release();

      res.json({
        reports: result.rows,
        total: result.rows.length,
        limit,
        offset,
      });
    } catch (error) {
      console.error('Get reports error:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
);

// GET /api/reports/user/my - Get reports by current user (must be before /:id)
router.get('/user/my', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const pool = getPool();
    const client = await pool.connect();
    const result = await client.query(
      `SELECT r.*, u.nickname, u.avatar_url
       FROM reports r
       JOIN users u ON r.user_id = u.id
       WHERE r.user_id = $1
       ORDER BY r.created_at DESC`,
      [req.user!.userId]
    );
    client.release();

    res.json({ reports: result.rows });
  } catch (error) {
    console.error('Get user reports error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/reports/:id - Get single report
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const pool = getPool();
    const client = await pool.connect();
    const result = await client.query(
      `SELECT r.*, u.nickname, u.avatar_url
       FROM reports r
       JOIN users u ON r.user_id = u.id
       WHERE r.id = $1`,
      [req.params.id]
    );
    client.release();

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Reporte no encontrado' });
      return;
    }

    res.json({ report: result.rows[0] });
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/reports - Create new report
router.post(
  '/',
  authenticateToken,
  [
    body('description')
      .trim()
      .notEmpty()
      .withMessage('La descripción del reporte es obligatoria')
      .isLength({ min: 10, max: 500 })
      .withMessage('La descripción debe tener entre 10 y 500 caracteres'),
    body('category')
      .notEmpty()
      .withMessage('La categoría es obligatoria')
      .isIn(VALID_CATEGORIES)
      .withMessage('Categoría inválida'),
    body('danger_level')
      .notEmpty()
      .withMessage('El nivel de peligro es obligatorio')
      .isInt({ min: 1, max: 10 })
      .withMessage('El nivel de peligro debe ser un número entre 1 y 10'),
    body('latitude')
      .notEmpty()
      .withMessage('La latitud es obligatoria')
      .isFloat({ min: -90, max: 90 })
      .withMessage('Latitud inválida'),
    body('longitude')
      .notEmpty()
      .withMessage('La longitud es obligatoria')
      .isFloat({ min: -180, max: 180 })
      .withMessage('Longitud inválida'),
    body('address').optional().trim().isLength({ max: 200 }),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { description, category, danger_level, latitude, longitude, address } = req.body;

    try {
      const pool = getPool();
      const client = await pool.connect();

      // Verify user exists
      const userCheck = await client.query(
        'SELECT id FROM users WHERE id = $1',
        [req.user!.userId]
      );

      if (userCheck.rows.length === 0) {
        client.release();
        res.status(401).json({ 
          error: 'Sesión expirada. Por favor, inicia sesión nuevamente.',
          code: 'USER_NOT_FOUND'
        });
        return;
      }

      const reportId = uuidv4();
      const result = await client.query(
        `INSERT INTO reports (id, user_id, description, category, danger_level, latitude, longitude, address)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [reportId, req.user!.userId, description, category, danger_level, latitude, longitude, address || null]
      );

      // Get user info for the response
      const userResult = await client.query(
        'SELECT nickname, avatar_url FROM users WHERE id = $1',
        [req.user!.userId]
      );
      client.release();

      const report = {
        ...result.rows[0],
        nickname: userResult.rows[0]?.nickname,
        avatar_url: userResult.rows[0]?.avatar_url,
      };

      // Emit real-time event via Socket.IO
      if (io) {
        io.emit('new_report', report);
      }

      res.status(201).json({
        message: 'Reporte creado exitosamente',
        report,
      });
    } catch (error) {
      console.error('Create report error:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
);

export default router;
