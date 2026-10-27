'use strict'

import { DataTypes, QueryInterface } from 'sequelize'

/** @type {import('sequelize-cli').Migration} */
export async function up(
  queryInterface: QueryInterface,
  Sequelize: typeof DataTypes
) {
  const transaction = await queryInterface.sequelize.transaction()

  try {
    const [historyTable]: any = await queryInterface.sequelize.query(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'student_class_histories'`,
      { transaction }
    )

    if (historyTable.length === 0) {
      await queryInterface.createTable(
        'student_class_histories',
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
          academicYear: {
            allowNull: false,
            type: Sequelize.STRING,
          },
          GradeId: {
            allowNull: true,
            type: Sequelize.UUID,
            references: { model: 'grades', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
          },
          ClassId: {
            allowNull: true,
            type: Sequelize.UUID,
            references: { model: 'classes', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
          },
          homeroomTeacherId: {
            allowNull: true,
            type: Sequelize.UUID,
            references: { model: 'users', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
          },
          notes: {
            allowNull: true,
            type: Sequelize.TEXT,
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

      await queryInterface.addIndex(
        'student_class_histories',
        ['UserId', 'academicYear'],
        {
          name: 'student_class_histories_user_year',
          transaction,
        }
      )
    }

    const [statusColumn]: any = await queryInterface.sequelize.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'user_details' AND COLUMN_NAME = 'studentStatus'`,
      { transaction }
    )

    if (statusColumn.length === 0) {
      await queryInterface.addColumn(
        'user_details',
        'studentStatus',
        {
          type: Sequelize.ENUM('aktif', 'lulus', 'pindah'),
          allowNull: false,
          defaultValue: 'aktif',
        },
        { transaction }
      )
    }

    const [graduationColumn]: any = await queryInterface.sequelize.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'user_details' AND COLUMN_NAME = 'graduationYear'`,
      { transaction }
    )

    if (graduationColumn.length === 0) {
      await queryInterface.addColumn(
        'user_details',
        'graduationYear',
        {
          type: Sequelize.STRING,
          allowNull: true,
        },
        { transaction }
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
    await queryInterface.dropTable('student_class_histories', { transaction })
    await queryInterface.removeColumn('user_details', 'studentStatus', {
      transaction,
    })
    await queryInterface.removeColumn('user_details', 'graduationYear', {
      transaction,
    })

    await transaction.commit()
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}
