'use strict'

import { DataTypes, QueryInterface } from 'sequelize'

export async function up(
  queryInterface: QueryInterface,
  Sequelize: typeof DataTypes
) {
  await queryInterface.addColumn('questionnaire', 'cooldownInMinutes', {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
}

export async function down(
  queryInterface: QueryInterface,
  Sequelize: typeof DataTypes
) {
  await queryInterface.removeColumn('questionnaire', 'cooldownInMinutes')
}
