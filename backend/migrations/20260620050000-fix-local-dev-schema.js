'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();

    if (tables.includes('Appointments') && !tables.includes('appointments')) {
      await queryInterface.renameTable('Appointments', 'appointments');
    }

    if (tables.includes('ScheduleExceptions') && !tables.includes('scheduleExceptions')) {
      await queryInterface.renameTable('ScheduleExceptions', 'scheduleExceptions');
    }

    const appointmentTable = tables.includes('appointments') || tables.includes('Appointments');
    if (appointmentTable) {
      const appointmentColumns = await queryInterface.describeTable('appointments');
      if (!appointmentColumns.status) {
        await queryInterface.addColumn('appointments', 'status', {
          type: Sequelize.ENUM('pending', 'confirmed', 'completed', 'cancelled'),
          allowNull: false,
          defaultValue: 'pending',
        });
      }
    }

    const userColumns = await queryInterface.describeTable('users');
    if (!userColumns.is_verified && !userColumns.isVerified) {
      await queryInterface.addColumn('users', 'is_verified', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      });
    }
  },

  async down(queryInterface) {
    const tables = await queryInterface.showAllTables();

    if (tables.includes('appointments')) {
      const appointmentColumns = await queryInterface.describeTable('appointments');
      if (appointmentColumns.status) {
        await queryInterface.removeColumn('appointments', 'status');
      }
    }

    if (tables.includes('appointments') && !tables.includes('Appointments')) {
      await queryInterface.renameTable('appointments', 'Appointments');
    }

    if (tables.includes('scheduleExceptions') && !tables.includes('ScheduleExceptions')) {
      await queryInterface.renameTable('scheduleExceptions', 'ScheduleExceptions');
    }
  },
};
