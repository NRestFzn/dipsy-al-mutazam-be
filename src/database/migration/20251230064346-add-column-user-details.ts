'use strict'

import { DataTypes, QueryInterface, QueryTypes } from 'sequelize'

/** @type {import('sequelize-cli').Migration} */

interface UserRow {
  id: number | string
  UserId?: number | string
  gender: 'm' | 'f' | null
  birthDate: string | Date | null
}

export async function up(
  queryInterface: QueryInterface,
  Sequelize: typeof DataTypes
) {
  const transaction = await queryInterface.sequelize.transaction()

  try {
    await queryInterface.addColumn(
      'user_details',
      'gender',
      {
        type: Sequelize.ENUM('m', 'f'),
        allowNull: true,
      },
      { transaction }
    )

    await queryInterface.addColumn(
      'user_details',
      'birthDate',
      {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      { transaction }
    )

    const users = await queryInterface.sequelize.query<UserRow>(
      `SELECT id, gender, \`birthDate\` FROM users`,
      { type: QueryTypes.SELECT, transaction }
    )

    for (const user of users) {
      if (user.gender || user.birthDate) {
        await queryInterface.sequelize.query(
          `UPDATE user_details 
           SET gender = :gender, \`birthDate\` = :birthDate 
           WHERE UserId = :userId`,
          {
            replacements: {
              gender: user.gender,
              birthDate: user.birthDate,
              userId: user.id,
            },
            transaction,
          }
        )
      }
    }

    await queryInterface.removeColumn('users', 'gender', { transaction })
    await queryInterface.removeColumn('users', 'birthDate', { transaction })

    await transaction.commit()
  } catch (error) {
    await transaction.rollback()
    console.error(error)
    throw error
  }
}

export async function down(
  queryInterface: QueryInterface,
  Sequelize: typeof DataTypes
) {
  const transaction = await queryInterface.sequelize.transaction()

  try {
    await queryInterface.addColumn(
      'users',
      'gender',
      {
        type: Sequelize.ENUM('m', 'f'),
        allowNull: true,
      },
      { transaction }
    )

    await queryInterface.addColumn(
      'users',
      'birthDate',
      {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      { transaction }
    )

    const userDetails = await queryInterface.sequelize.query<UserRow>(
      `SELECT UserId, gender, \`birthDate\` FROM user_details`,
      { type: QueryTypes.SELECT, transaction }
    )

    for (const detail of userDetails) {
      if (detail.UserId) {
        await queryInterface.sequelize.query(
          `UPDATE users 
           SET gender = :gender, \`birthDate\` = :birthDate 
           WHERE id = :id`,
          {
            replacements: {
              gender: detail.gender,
              birthDate: detail.birthDate,
              id: detail.UserId,
            },
            transaction,
          }
        )
      }
    }

    await queryInterface.removeColumn('user_details', 'gender', {
      transaction,
    })
    await queryInterface.removeColumn('user_details', 'birthDate', {
      transaction,
    })

    await transaction.commit()
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}
