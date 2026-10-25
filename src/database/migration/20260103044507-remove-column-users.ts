'use strict'

import { QueryInterface, DataTypes, QueryTypes } from 'sequelize'

/** @type {import('sequelize-cli').Migration} */
export async function up(
  queryInterface: QueryInterface,
  Sequelize: typeof DataTypes
) {
  const transaction = await queryInterface.sequelize.transaction()

  try {
    await queryInterface.sequelize.query(
      `INSERT INTO user_has_roles (id, UserId, RoleId, createdAt, updatedAt)
       SELECT UUID(), id, RoleId, NOW(), NOW()
       FROM users
       WHERE RoleId IS NOT NULL`,
      {
        type: QueryTypes.INSERT,
        transaction,
      }
    )

    await queryInterface.removeColumn('users', 'RoleId', { transaction })

    await transaction.commit()
  } catch (error) {
    await transaction.rollback()
    console.error('Migration Data Transfer Failed:', error)
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
      'RoleId',
      {
        type: Sequelize.STRING,
        allowNull: true,
        references: {
          model: 'roles',
          key: 'id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      },
      { transaction }
    )

    await queryInterface.sequelize.query(
      `
        UPDATE users 
        INNER JOIN user_has_roles ON users.id = user_has_roles.UserId
        SET users.RoleId = user_has_roles.RoleId
       `,
      {
        type: QueryTypes.UPDATE,
        transaction,
      }
    )

    await transaction.commit()
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}
