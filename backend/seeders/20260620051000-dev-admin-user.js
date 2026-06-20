'use strict';

const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const password = await bcrypt.hash('Password123!', 10);

    await queryInterface.bulkInsert('users', [
      {
        fullName: 'Quirofisicos Rocha Admin',
        email: 'admin@quirofisicosrocha.com',
        phone: '0000000000',
        password,
        authProvider: 'local',
        googleId: null,
        role: 'admin',
        is_verified: true,
        created_at: now,
        updated_at: now,
      },
    ], {
      ignoreDuplicates: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', {
      email: 'admin@quirofisicosrocha.com',
    });
  },
};
