'use strict'

import { DataTypes, QueryInterface } from 'sequelize'

/** @type {import('sequelize-cli').Migration} */
export async function up(
  queryInterface: QueryInterface,
  Sequelize: typeof DataTypes
) {
  await queryInterface.removeColumn('user', 'RukunWargaId')
  await queryInterface.removeColumn('user', 'RukunTetanggaId')
  await queryInterface.removeColumn('user', 'EducationId')
  await queryInterface.removeColumn('user', 'SalaryRangeId')
  await queryInterface.removeColumn('user', 'MarriageStatusId')
  await queryInterface.removeColumn('user', 'profession')
  await queryInterface.removeColumn('user', 'nik')
}

export async function down(
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

  await queryInterface.addColumn('user', 'EducationId', {
    type: Sequelize.UUID,
    references: {
      model: 'education',
      key: 'id',
    },
  })

  await queryInterface.addColumn('user', 'SalaryRangeId', {
    type: Sequelize.UUID,
    references: {
      model: 'salaryRange',
      key: 'id',
    },
  })

  await queryInterface.addColumn('user', 'MarriageStatusId', {
    type: Sequelize.UUID,
    references: {
      model: 'marriageStatus',
      key: 'id',
    },
  })

  await queryInterface.addColumn('user', 'profession', {
    type: Sequelize.STRING,
    allowNull: false,
  })

  await queryInterface.addColumn('user', 'nik', {
    type: Sequelize.STRING(16, true),
    allowNull: false,
  })
}
