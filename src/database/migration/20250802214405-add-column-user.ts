'use strict'

import { DataTypes, QueryInterface } from 'sequelize'

/** @type {import('sequelize-cli').Migration} */
export async function up(
  queryInterface: QueryInterface,
  Sequelize: typeof DataTypes
) {
  await queryInterface.addColumn('user', 'MarriageStatusId', {
    type: Sequelize.UUID,
    references: {
      model: 'marriageStatus',
      key: 'id',
    },
  })
  await queryInterface.addColumn('user', 'EducationId', {
    type: Sequelize.UUID,
    references: {
      model: 'education',
      key: 'id',
    },
  })
}

export async function down(
  queryInterface: QueryInterface,
  Sequelize: typeof DataTypes
) {
  await queryInterface.removeColumn('user', 'MarriageStatusId')
  await queryInterface.removeColumn('user', 'EducationId')
}
