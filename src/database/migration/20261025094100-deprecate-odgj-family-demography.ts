'use strict'

import { DataTypes, QueryInterface } from 'sequelize'

/** @type {import('sequelize-cli').Migration} */
export async function up(
  queryInterface: QueryInterface,
  Sequelize: typeof DataTypes
) {
  const transaction = await queryInterface.sequelize.transaction()

  try {
    // 1. Drop FamilyId constraint and column from user_details if exists
    const [familyColExists]: any = await queryInterface.sequelize.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'user_details' AND COLUMN_NAME = 'FamilyId'`,
      { transaction }
    )

    if (familyColExists.length > 0) {
      // Find foreign key name on FamilyId if any
      const [fks]: any = await queryInterface.sequelize.query(
        `SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'user_details' AND COLUMN_NAME = 'FamilyId' AND REFERENCED_TABLE_NAME = 'families'`,
        { transaction }
      )

      for (const fk of fks) {
        await queryInterface.removeConstraint(
          'user_details',
          fk.CONSTRAINT_NAME,
          { transaction }
        )
      }

      await queryInterface.removeColumn('user_details', 'FamilyId', {
        transaction,
      })
    }

    // 2. Drop ODGJ tables if exist
    const [odgjSchedExists]: any = await queryInterface.sequelize.query(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'odgj_examination_schedules'`,
      { transaction }
    )
    if (odgjSchedExists.length > 0) {
      await queryInterface.dropTable('odgj_examination_schedules', {
        transaction,
      })
    }

    const [odgjResExists]: any = await queryInterface.sequelize.query(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'odgj_residents'`,
      { transaction }
    )
    if (odgjResExists.length > 0) {
      await queryInterface.dropTable('odgj_residents', { transaction })
    }

    // 3. Drop families table if exists
    const [familiesExists]: any = await queryInterface.sequelize.query(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'families'`,
      { transaction }
    )
    if (familiesExists.length > 0) {
      await queryInterface.dropTable('families', { transaction })
    }

    // 4. Drop village demographic master tables if exist
    const [marriageExists]: any = await queryInterface.sequelize.query(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'marriage_statuses'`,
      { transaction }
    )
    if (marriageExists.length > 0) {
      await queryInterface.dropTable('marriage_statuses', { transaction })
    }

    const [educationExists]: any = await queryInterface.sequelize.query(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'educations'`,
      { transaction }
    )
    if (educationExists.length > 0) {
      await queryInterface.dropTable('educations', { transaction })
    }

    const [salaryExists]: any = await queryInterface.sequelize.query(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'salary_ranges'`,
      { transaction }
    )
    if (salaryExists.length > 0) {
      await queryInterface.dropTable('salary_ranges', { transaction })
    }

    await transaction.commit()
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

export async function down(
  queryInterface: QueryInterface,
  Sequelize: typeof DataTypes
) {
  // Irreversible cleanup migration for obsolete village modules
}
