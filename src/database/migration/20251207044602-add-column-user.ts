'use strict'

import { DataTypes, QueryInterface } from 'sequelize'

export async function up(
  queryInterface: QueryInterface,
  Sequelize: typeof DataTypes
) {
  await queryInterface.addColumn('user', 'profilePicture', {
    type: Sequelize.STRING,
    allowNull: true,
  })
}

export async function down(
  queryInterface: QueryInterface,
  Sequelize: typeof DataTypes
) {
  await queryInterface.removeColumn('user', 'profilePicture')
}
