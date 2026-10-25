'use strict'

import { DataTypes, QueryInterface } from 'sequelize'

export async function up(
  queryInterface: QueryInterface,
  Sequelize: typeof DataTypes
) {
  await queryInterface.addColumn('userDetail', 'phoneNumber', {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  })
}

export async function down(
  queryInterface: QueryInterface,
  Sequelize: typeof DataTypes
) {
  await queryInterface.removeColumn('userDetail', 'phoneNumber')
}
