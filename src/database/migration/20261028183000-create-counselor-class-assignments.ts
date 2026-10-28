'use strict'

import { DataTypes, QueryInterface } from 'sequelize'

/** @type {import('sequelize-cli').Migration} */
export async function up(
  queryInterface: QueryInterface,
  Sequelize: typeof DataTypes
) {
  const transaction = await queryInterface.sequelize.transaction()

  try {
    const [tableExists]: any = await queryInterface.sequelize.query(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'counselor_class_assignments'`,
      { transaction }
    )

    if (tableExists.length === 0) {
      await queryInterface.createTable(
        'counselor_class_assignments',
        {
          id: {
            allowNull: false,
            primaryKey: true,
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
          },
          UserId: {
            allowNull: false,
            type: Sequelize.UUID,
            references: { model: 'users', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
          },
          ClassId: {
            allowNull: false,
            type: Sequelize.UUID,
            references: { model: 'classes', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
          },
          academicYear: {
            allowNull: false,
            type: Sequelize.STRING,
          },
          createdAt: {
            allowNull: false,
            type: Sequelize.DATE,
          },
          updatedAt: {
            allowNull: false,
            type: Sequelize.DATE,
          },
        },
        { transaction }
      )
    }

    const [uniqueIdxExists]: any = await queryInterface.sequelize.query(
      `SELECT INDEX_NAME FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'counselor_class_assignments' AND INDEX_NAME = 'counselor_class_assignments_user_class_year_unique'`,
      { transaction }
    )

    if (uniqueIdxExists.length === 0) {
      await queryInterface.addIndex(
        'counselor_class_assignments',
        ['UserId', 'ClassId', 'academicYear'],
        {
          name: 'counselor_class_assignments_user_class_year_unique',
          unique: true,
          transaction,
        }
      )
    }

    const [userYearIdxExists]: any = await queryInterface.sequelize.query(
      `SELECT INDEX_NAME FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'counselor_class_assignments' AND INDEX_NAME = 'counselor_class_assignments_user_year_idx'`,
      { transaction }
    )

    if (userYearIdxExists.length === 0) {
      await queryInterface.addIndex(
        'counselor_class_assignments',
        ['UserId', 'academicYear'],
        {
          name: 'counselor_class_assignments_user_year_idx',
          transaction,
        }
      )
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
  const transaction = await queryInterface.sequelize.transaction()

  try {
    const [tableExists]: any = await queryInterface.sequelize.query(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'counselor_class_assignments'`,
      { transaction }
    )

    if (tableExists.length > 0) {
      await queryInterface.dropTable('counselor_class_assignments', {
        transaction,
      })
    }

    await transaction.commit()
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}
