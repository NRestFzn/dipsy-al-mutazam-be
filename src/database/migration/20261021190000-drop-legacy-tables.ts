'use strict'

import { DataTypes, QueryInterface, QueryTypes } from 'sequelize'

/** @type {import('sequelize-cli').Migration} */
export async function up(
  queryInterface: QueryInterface,
  Sequelize: typeof DataTypes
) {
  // 1. Drop foreign key constraint & column FamilyId from user_details
  try {
    const userDetailConstraints: any[] = await queryInterface.sequelize.query(
      `SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'user_details' AND COLUMN_NAME = 'FamilyId' AND REFERENCED_TABLE_NAME IS NOT NULL`,
      { type: QueryTypes.SELECT }
    )

    for (const constraint of userDetailConstraints) {
      await queryInterface.sequelize.query(
        `ALTER TABLE \`user_details\` DROP FOREIGN KEY \`${constraint.CONSTRAINT_NAME}\``
      )
    }

    const [cols]: any = await queryInterface.sequelize.query(
      "SHOW COLUMNS FROM `user_details` LIKE 'FamilyId'"
    )
    if (cols && cols.length > 0) {
      await queryInterface.removeColumn('user_details', 'FamilyId')
    }
  } catch (error) {
    console.warn('Notice when removing FamilyId from user_details:', error)
  }

  // 2. Drop legacy tables safely
  const tablesToDrop = [
    'odgj_examination_schedules',
    'odgj_residents',
    'families',
    'marriage_statuses',
    'marriageStatus',
    'educations',
    'salary_ranges',
    'salaryRange',
  ]

  // Disable foreign key checks momentarily to ensure clean drop without order conflicts
  await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')

  for (const table of tablesToDrop) {
    try {
      const [tableExists]: any = await queryInterface.sequelize.query(
        `SHOW TABLES LIKE '${table}'`
      )
      if (tableExists && tableExists.length > 0) {
        await queryInterface.dropTable(table)
      }
    } catch (error) {
      console.warn(`Notice when dropping table ${table}:`, error)
    }
  }

  await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1')
}

export async function down(
  queryInterface: QueryInterface,
  Sequelize: typeof DataTypes
) {
  // No-op for irreversible table cleanup
}
