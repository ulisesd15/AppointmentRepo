require('dotenv').config();

const baseConfig = {
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'appointment_db',
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  dialect: 'mysql',
  logging: false,
};

module.exports = {
  development: baseConfig,
  test: baseConfig,
  production: {
    ...baseConfig,
    use_env_variable: process.env.DATABASE_URL ? 'DATABASE_URL' : undefined,
  },
};
