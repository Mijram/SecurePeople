export interface User {
  id: string;
  full_name: string;
  phone?: string;
  email: string;
  nickname: string;
  password_hash: string;
  avatar_url?: string;
  created_at: Date;
  updated_at: Date;
}

export interface UserPublic {
  id: string;
  full_name: string;
  nickname: string;
  avatar_url?: string;
  created_at: Date;
}

export interface Report {
  id: string;
  user_id: string;
  description: string;
  category: ReportCategory;
  danger_level: number;
  latitude: number;
  longitude: number;
  address?: string;
  status: ReportStatus;
  created_at: Date;
  updated_at: Date;
  // Joined fields
  nickname?: string;
  avatar_url?: string;
}

export type ReportCategory =
  | 'Robo'
  | 'Accidente'
  | 'Incendio'
  | 'Emergencia médica'
  | 'Manifestación'
  | 'Obstrucción vial'
  | 'Situación sospechosa'
  | 'Otro';

export type ReportStatus = 'active' | 'resolved' | 'dismissed';

export interface JwtPayload {
  userId: string;
  email: string;
  nickname: string;
}

export interface AuthRequest extends Express.Request {
  user?: JwtPayload;
}

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
