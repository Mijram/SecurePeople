import { getPool } from '../database/db';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

function randomOffset(range: number): number {
  return (Math.random() - 0.5) * range;
}

// Simulated users
const simulatedUsers = [
  { full_name: 'Usuario Demo', email: 'demo@securepeople.co', nickname: 'ciudadano_bogota', phone: '3001234567', avatar: '👤' },
  { full_name: 'María González', email: 'maria@example.com', nickname: 'maria_chapinero', phone: '3102345678', avatar: '🦋' },
  { full_name: 'Carlos Rodríguez', email: 'carlos@example.com', nickname: 'carlos_usaquen', phone: '3203456789', avatar: '🦅' },
  { full_name: 'Ana Martínez', email: 'ana@example.com', nickname: 'ana_teusaquillo', phone: '3104567890', avatar: '🎯' },
  { full_name: 'Luis Pérez', email: 'luis@example.com', nickname: 'luis_suba', phone: '3205678901', avatar: '🔥' },
  { full_name: 'Sofia Castro', email: 'sofia@example.com', nickname: 'sofia_kennedy', phone: '3106789012', avatar: '🌟' },
];

const simulatedReports = [
  {
    description: 'Se reporta accidente de tránsito en la Calle 26 con Carrera 7. Dos vehículos involucrados, al parecer hay heridos leves.',
    category: 'Accidente',
    danger_level: 6,
    latitude: 4.6534,
    longitude: -74.0836,
    address: 'Calle 26 con Carrera 7, Bogotá',
    userIndex: 1,
  },
  {
    description: 'Robo a mano armada en el sector de Chapinero. Delincuentes en moto, se llevaron celular y billetera.',
    category: 'Robo',
    danger_level: 8,
    latitude: 4.6486,
    longitude: -74.0628,
    address: 'Chapinero, Bogotá',
    userIndex: 2,
  },
  {
    description: 'Incendio en edificio residencial en el barrio Teusaquillo. Bomberos en camino.',
    category: 'Incendio',
    danger_level: 9,
    latitude: 4.6351,
    longitude: -74.0703,
    address: 'Teusaquillo, Bogotá',
    userIndex: 3,
  },
  {
    description: 'Persona desmayada en la estación de TransMilenio Portal Norte. Se requiere atención médica urgente.',
    category: 'Emergencia médica',
    danger_level: 7,
    latitude: 4.7588,
    longitude: -74.0456,
    address: 'Portal Norte TransMilenio, Bogotá',
    userIndex: 4,
  },
  {
    description: 'Manifestación pacífica en la Plaza de Bolívar. Cierre de vías aledañas.',
    category: 'Manifestación',
    danger_level: 3,
    latitude: 4.5981,
    longitude: -74.0761,
    address: 'Plaza de Bolívar, Bogotá',
    userIndex: 0,
  },
  {
    description: 'Árbol caído sobre la vía en la Autopista Norte. Obstrucción total del carril derecho.',
    category: 'Obstrucción vial',
    danger_level: 5,
    latitude: 4.7200,
    longitude: -74.0500,
    address: 'Autopista Norte, Bogotá',
    userIndex: 5,
  },
  {
    description: 'Persona sospechosa merodeando vehículos en el parqueadero del Centro Comercial Andino.',
    category: 'Situación sospechosa',
    danger_level: 4,
    latitude: 4.6660,
    longitude: -74.0530,
    address: 'CC Andino, Bogotá',
    userIndex: 1,
  },
  {
    description: 'Accidente de motocicleta en la Avenida El Dorado. Motociclista herido esperando ambulancia.',
    category: 'Accidente',
    danger_level: 7,
    latitude: 4.6580,
    longitude: -74.1050,
    address: 'Avenida El Dorado, Bogotá',
    userIndex: 2,
  },
  {
    description: 'Robo de bicicleta en el Parque de la 93. Ladrón huyó hacia el norte.',
    category: 'Robo',
    danger_level: 5,
    latitude: 4.6760,
    longitude: -74.0480,
    address: 'Parque de la 93, Bogotá',
    userIndex: 3,
  },
  {
    description: 'Fuga de gas en edificio de apartamentos en Usaquén. Residentes evacuados preventivamente.',
    category: 'Otro',
    danger_level: 8,
    latitude: 4.6950,
    longitude: -74.0310,
    address: 'Usaquén, Bogotá',
    userIndex: 4,
  },
];

export async function seedDatabase(): Promise<void> {
  try {
    const pool = getPool();
    const client = await pool.connect();

    const passwordHash = await bcrypt.hash('demo123456', 10);
    const userIds: string[] = [];

    // Create all simulated users
    for (const user of simulatedUsers) {
      const existingUser = await client.query(
        'SELECT id FROM users WHERE email = $1',
        [user.email]
      );

      let userId: string;
      if (existingUser.rows.length === 0) {
        const newId = uuidv4();
        const userResult = await client.query(
          `INSERT INTO users (id, full_name, email, nickname, password_hash, phone, avatar_url)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING id`,
          [newId, user.full_name, user.email, user.nickname, passwordHash, user.phone, user.avatar]
        );
        userId = userResult.rows[0].id;
      } else {
        userId = existingUser.rows[0].id;
      }
      userIds.push(userId);
    }

    console.log(`✅ ${simulatedUsers.length} simulated users created/verified`);

    // Check if reports already seeded
    const existingReports = await client.query('SELECT COUNT(*) as count FROM reports');
    if (parseInt(existingReports.rows[0].count) > 0) {
      client.release();
      console.log('ℹ️  Reports already seeded, skipping...');
      return;
    }

    // Insert simulated reports with different users
    for (const report of simulatedReports) {
      const userId = userIds[report.userIndex];
      await client.query(
        `INSERT INTO reports (id, user_id, description, category, danger_level, latitude, longitude, address)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          uuidv4(),
          userId,
          report.description,
          report.category,
          report.danger_level,
          report.latitude + randomOffset(0.01),
          report.longitude + randomOffset(0.01),
          report.address,
        ]
      );
    }

    client.release();
    console.log(`✅ ${simulatedReports.length} simulated reports seeded in Bogotá`);
    console.log('✅ Demo user: demo@securepeople.co / demo123456');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
}
