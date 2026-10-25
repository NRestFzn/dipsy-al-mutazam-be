'use strict'

import { DataTypes, QueryInterface } from 'sequelize'

/** @type {import('sequelize-cli').Migration} */
export async function up(
  queryInterface: QueryInterface,
  Sequelize: typeof DataTypes
) {
  const transaction = await queryInterface.sequelize.transaction()

  try {
    // 1. Ensure grades table exists and has 'level' column
    const [gradesTableExists]: any = await queryInterface.sequelize.query(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'grades'`,
      { transaction }
    )

    if (gradesTableExists.length === 0) {
      await queryInterface.createTable(
        'grades',
        {
          id: {
            allowNull: false,
            primaryKey: true,
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
          },
          name: {
            allowNull: false,
            type: Sequelize.STRING,
          },
          level: {
            type: Sequelize.ENUM('SMP', 'SMA'),
            allowNull: true,
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
    } else {
      const [levelColExists]: any = await queryInterface.sequelize.query(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'grades' AND COLUMN_NAME = 'level'`,
        { transaction }
      )

      if (levelColExists.length === 0) {
        await queryInterface.addColumn(
          'grades',
          'level',
          {
            type: Sequelize.ENUM('SMP', 'SMA'),
            allowNull: true,
          },
          { transaction }
        )
      }
    }

    // 2. Ensure classes table exists and has 'homeroomTeacherId' column
    const [classesTableExists]: any = await queryInterface.sequelize.query(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'classes'`,
      { transaction }
    )

    if (classesTableExists.length === 0) {
      await queryInterface.createTable(
        'classes',
        {
          id: {
            allowNull: false,
            primaryKey: true,
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
          },
          name: {
            allowNull: false,
            type: Sequelize.STRING,
          },
          GradeId: {
            allowNull: false,
            type: Sequelize.UUID,
            references: {
              model: 'grades',
              key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
          },
          homeroomTeacherId: {
            type: Sequelize.UUID,
            allowNull: true,
            references: {
              model: 'users',
              key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
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
    } else {
      const [teacherColExists]: any = await queryInterface.sequelize.query(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'classes' AND COLUMN_NAME = 'homeroomTeacherId'`,
        { transaction }
      )

      if (teacherColExists.length === 0) {
        await queryInterface.addColumn(
          'classes',
          'homeroomTeacherId',
          {
            type: Sequelize.UUID,
            allowNull: true,
            references: {
              model: 'users',
              key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
          },
          { transaction }
        )
      }
    }

    // 3. Drop rukun_tetanggas if exists
    const [rtTableExists]: any = await queryInterface.sequelize.query(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'rukun_tetanggas'`,
      { transaction }
    )

    if (rtTableExists.length > 0) {
      await queryInterface.dropTable('rukun_tetanggas', { transaction })
    }

    // 4. Drop rukun_wargas if exists
    const [rwTableExists]: any = await queryInterface.sequelize.query(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'rukun_wargas'`,
      { transaction }
    )

    if (rwTableExists.length > 0) {
      await queryInterface.dropTable('rukun_wargas', { transaction })
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
  const transaction = await queryInterface.sequelize.transaction()

  try {
    // 1. Re-create rukun_wargas if not exists
    await queryInterface.createTable(
      'rukun_wargas',
      {
        id: {
          allowNull: false,
          primaryKey: true,
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
        },
        name: {
          allowNull: false,
          type: Sequelize.INTEGER,
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

    // 2. Re-create rukun_tetanggas if not exists
    await queryInterface.createTable(
      'rukun_tetanggas',
      {
        id: {
          allowNull: false,
          primaryKey: true,
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
        },
        name: {
          allowNull: false,
          type: Sequelize.INTEGER,
        },
        RukunWargaId: {
          allowNull: false,
          type: Sequelize.UUID,
          references: {
            model: 'rukun_wargas',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
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

    await transaction.commit()
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}
