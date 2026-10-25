'use strict'

import { DataTypes, QueryInterface } from 'sequelize'

export async function up(
  queryInterface: QueryInterface,
  Sequelize: typeof DataTypes
) {
  await queryInterface.addColumn('questionnaires', 'CategoryId', {
    type: Sequelize.UUID,
    allowNull: true,
    references: {
      model: 'questionnaire_categories',
      key: 'id',
    },
    onDelete: 'cascade',
    onUpdate: 'cascade',
  })
}

export async function down(
  queryInterface: QueryInterface,
  Sequelize: typeof DataTypes
) {
  await queryInterface.removeColumn('questionnaires', 'CategoryId')
}
