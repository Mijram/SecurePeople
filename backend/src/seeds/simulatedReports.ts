import { getPool } from '../database/db';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

function randomOffset(range: number): number {
  return (Math.random() - 0.5) * range;
}

const simulatedReports = [
  {
    description: 'Se reporta accidente de tránsito en la Calle 26 con Carrera 7. Dos vehículos involucrados, al parecer hay heridos leves.',
    category: 'Accidente',
    danger_level: 6,
    latitude: 4.6534,
    longitude: -74.0836,
    address: 'Calle 26 con Carrera 7, Bogotá',
  },
  {
    description: 'Robo a mano armada en el sector de Chapinero. Delincuentes en moto, se llevaron celular y billetera.',
    category: 'Robo',
    danger_level: 8,
    latitude: 4.6486,
    longitude: -74.0628,
    address: 'Chapinero, Bogotá',
  },
  {
    description: 'Incendio en edificio residencial en el barrio Teusaquillo. Bomberos en camino.',
    category: 'Incendio',
    danger_level: 9,
    latitude: 4.6351,
    longitude: -74.0703,
    address: 'Teusaquillo, Bogotá',
  },
  {
    description: 'Persona desmayada en la estación de TransMilenio Portal Norte. Se requiere atención médica urgente.',
    category: 'Emergencia médica',
    danger_level: 7,
    latitude: 4.7588,
    longitude: -74.0456,
    address: 'Portal Norte TransMilenio, Bogotá',
  },
  {
    description: 'Manifestación pacífica en la Plaza de Bolívar. Cierre de vías aledañas.',
    category: 'Manifestación',
    danger_level: 3,
    latitude: 4.5981,
    longitude: -74.0761,
    address: 'Plaza de Bolívar, Bogotá',
  },
  {
    description: 'Árbol caído sobre la vía en la Autopista Norte. Obstrucción total del carril derecho.',
    category: 'Obstrucción vial',
    danger_level: 5,
    latitude: 4.7200,
    longitude: -74.0500,
    address: 'Autopista Norte, Bogotá',
  },
  {
    description: 'Persona sospechosa merodeando vehículos en el parqueadero del Centro Comercial Andino.',
    category: 'Situación sospechosa',
    danger_level: 4,
    latitude: 4.6660,
    longitude: -74.0530,
    address: 'CC Andino, Bogotá',
  },
  {
    description: 'Accidente de motocicleta en la Avenida El Dorado. Motociclista herido esperando ambulancia.',
    category: 'Accidente',
    danger_level: 7,
    latitude: 4.6580,
    longitude: -74.1050,
    address: 'Avenida El Dorado, Bogotá',
  },
  {
    description: 'Robo de bicicleta en el Parque de la 93. Ladrón huyó hacia el norte.',
    category: 'Robo',
    danger_level: 5,
    latitude: 4.6760,
    longitude: -74.0480,
    address: 'Parque de la 93, Bogotá',
  },
  {
    description: 'Fuga de gas en edificio de apartamentos en Usaquén. Residentes evacuados preventivamente.',
    category: 'Otro',
    danger_level: 8,
    latitude: 4.6950,
    longitude: -74.0310,
    address: 'Usaquén, Bogotá',
  },
];

export async function seedDatabase(): Promise<void> {
  try {
    const pool = getPool();
    const client = await pool.connect();

    // Create a demo user for simulated reports
    const passwordHash = await bcrypt.hash('demo123456', 10);

    let demoUserId: string;

    // Check if demo user exists
    const existingUser = await client.query(
      'SELECT id FROM users WHERE email = $1',
      ['demo@securepeople.co']
    );

    if (existingUser.rows.length === 0) {
      const demoId = uuidv4();
      const userResult = await client.query(
        `INSERT INTO users (id, full_name, email, nickname, password_hash, phone)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [demoId, 'Usuario Demo', 'demo@securepeople.co', 'ciudadano_bogota', passwordHash, '3001234567']
      );
      demoUserId = userResult.rows[0].id;
      console.log('✅ Demo user created: demo@securepeople.co / demo123456');
    } else {
      demoUserId = existingUser.rows[0].id;
    }

    // Check if reports already seeded
    const existingReports = await client.query('SELECT COUNT(*) as count FROM reports');
    if (parseInt(existingReports.rows[0].count) > 0) {
      client.release();
      console.log('ℹ️  Reports already seeded, skipping...');
      return;
    }

    // Insert simulated reports
    for (const report of simulatedReports) {
      await client.query(
        `INSERT INTO reports (id, user_id, description, category, danger_level, latitude, longitude, address)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          uuidv4(),
          demoUserId,
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
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
}
