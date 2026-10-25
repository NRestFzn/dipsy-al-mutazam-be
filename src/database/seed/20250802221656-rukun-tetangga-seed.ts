'use strict'

import _ from 'lodash'
import { DataTypes, QueryInterface, QueryTypes } from 'sequelize'
import { v4 } from 'uuid'

/** @type {import('sequelize-cli').Migration} */
export async function up(
  queryInterface: QueryInterface,
  Sequelize: typeof DataTypes
) {
  const formData: any[] = []

  const rukunWarga: { id: string }[] = await queryInterface.sequelize.query(
    'SELECT id FROM `rukun_wargas` ORDER BY name ASC',
    { type: QueryTypes.SELECT }
  )

  for (const rw of rukunWarga) {
    for (let i = 1; i <= 20; i++) {
      formData.push({
        id: v4(),
        name: i,
        RukunWargaId: rw.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }
  }

  await queryInterface.bulkInsert('rukun_tetanggas', formData)
}

export async function down(
  queryInterface: QueryInterface,
  Sequelize: typeof DataTypes
) {
  await queryInterface.bulkDelete('rukun_tetanggas', {})
}
