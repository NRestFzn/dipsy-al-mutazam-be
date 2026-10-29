'use strict'

import { DataTypes, QueryInterface } from 'sequelize'

/** @type {import('sequelize-cli').Migration} */
export async function up(
  queryInterface: QueryInterface,
  Sequelize: typeof DataTypes
) {
  const transaction = await queryInterface.sequelize.transaction()

  try {
    const [existing]: any = await queryInterface.sequelize.query(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'academic_years'`,
      { transaction }
    )

    if (existing.length === 0) {
      await queryInterface.createTable(
        'academic_years',
        {
          id: {
            allowNull: false,
            primaryKey: true,
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
          },
          name: { allowNull: false, type: Sequelize.STRING, unique: true },
          isActive: {
            allowNull: false,
            type: Sequelize.BOOLEAN,
            defaultValue: false,
          },
          startDate: { allowNull: true, type: Sequelize.DATEONLY },
          endDate: { allowNull: true, type: Sequelize.DATEONLY },
          createdAt: { allowNull: false, type: Sequelize.DATE },
          updatedAt: { allowNull: false, type: Sequelize.DATE },
        },
        { transaction }
      )
    }

    const [names]: any = await queryInterface.sequelize.query(
      `SELECT name FROM (
         SELECT DISTINCT academicYear AS name FROM user_details WHERE academicYear IS NOT NULL AND academicYear <> ''
         UNION
         SELECT DISTINCT academicYear AS name FROM homeroom_assignments WHERE academicYear IS NOT NULL AND academicYear <> ''
         UNION
         SELECT DISTINCT academicYear AS name FROM counselor_class_assignments WHERE academicYear IS NOT NULL AND academicYear <> ''
       ) t WHERE name REGEXP '^[0-9]{4}/[0-9]{4}$'`,
      { transaction }
    )

    for (const row of names) {
      await queryInterface.sequelize.query(
        `INSERT INTO academic_years (id, name, isActive, createdAt, updatedAt)
         SELECT UUID(), :name, 0, NOW(), NOW() FROM DUAL
         WHERE NOT EXISTS (SELECT 1 FROM academic_years WHERE name = :name)`,
        { replacements: { name: row.name }, transaction }
      )
    }

    const [activeExists]: any = await queryInterface.sequelize.query(
      `SELECT id FROM academic_years WHERE isActive = 1 LIMIT 1`,
      { transaction }
    )

    if (activeExists.length === 0) {
      const [candidate]: any = await queryInterface.sequelize.query(
        `SELECT academicYear AS name FROM user_details
         WHERE academicYear IS NOT NULL AND academicYear <> ''
         GROUP BY academicYear ORDER BY COUNT(*) DESC, academicYear DESC LIMIT 1`,
        { transaction }
      )

      const targetName = candidate.length > 0 ? candidate[0].name : null

      if (targetName) {
        await queryInterface.sequelize.query(
          `UPDATE academic_years SET isActive = 1 WHERE name = :name`,
          { replacements: { name: targetName }, transaction }
        )
      } else {
        await queryInterface.sequelize.query(
          `UPDATE academic_years SET isActive = 1 ORDER BY name DESC LIMIT 1`,
          { transaction }
        )
      }
    }

    await transaction.commit()
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

export async function down(
  queryInterface: QueryInterface,
  _Sequelize: typeof DataTypes
) {
  await queryInterface.dropTable('academic_years')
}
