'use strict'

import { DataTypes, QueryInterface } from 'sequelize'

/** @type {import('sequelize-cli').Migration} */
export async function up(
  queryInterface: QueryInterface,
  Sequelize: typeof DataTypes
) {
  await queryInterface.createTable('user', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
    },
    fullname: {
      allowNull: false,
      type: Sequelize.STRING,
    },
    email: {
      unique: true,
      allowNull: false,
      type: Sequelize.STRING,
    },
    password: {
      allowNull: false,
      type: Sequelize.STRING,
    },
    RoleId: {
      allowNull: false,
      type: Sequelize.UUID,
      references: {
        model: 'role',
        key: 'id',
      },
    },
    gender: {
      allowNull: false,
      type: Sequelize.ENUM('m', 'f'),
    },
    birthDate: {
      allowNull: false,
      type: Sequelize.DATEONLY,
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
  })
}

export async function down(
  queryInterface: QueryInterface,
  Sequelize: typeof DataTypes
) {
  await queryInterface.dropTable('user')
}
