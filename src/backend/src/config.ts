export const config = {
  port: process.env.PORT || 3001,
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    name: process.env.DB_NAME || 'multicrm',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    ssl: process.env.NODE_ENV === 'production',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-change-in-production',
    expiresIn: '7d',
  },
  nodeEnv: process.env.NODE_ENV || 'development',
};
