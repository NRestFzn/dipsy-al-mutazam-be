'use strict'

import { DataTypes, QueryInterface } from 'sequelize'

/** @type {import('sequelize-cli').Migration} */
export async function up(
  queryInterface: QueryInterface,
  Sequelize: typeof DataTypes
) {
  await queryInterface.addColumn('user', 'RukunWargaId', {
    type: Sequelize.UUID,
    references: {
      model: 'rukunWarga',
      key: 'id',
    },
  })
  await queryInterface.addColumn('user', 'RukunTetanggaId', {
    type: Sequelize.UUID,
    references: {
      model: 'rukunTetangga',
      key: 'id',
    },
  })
}

export async function down(
  queryInterface: QueryInterface,
  Sequelize: typeof DataTypes
) {
  await queryInterface.removeColumn('user', 'RukunWargaId')
  await queryInterface.removeColumn('user', 'RukunTetanggaId')
}
