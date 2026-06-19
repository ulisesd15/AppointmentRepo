const app = require('./app');
const env = require('./config/env');
const sequelize = require('./config/db');

async function start() {
  try {
    await sequelize.authenticate();
    console.log('Database connected');

    app.listen(env.port, () => {
      console.log(`Backend running on port ${env.port}`);
    });
  } catch (error) {
    console.error('Startup failed:', error);
    process.exit(1);
  }
}

start();