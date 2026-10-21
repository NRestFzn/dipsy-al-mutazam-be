'use strict'

import { DataTypes, QueryInterface, QueryTypes } from 'sequelize'
import { v4 } from 'uuid'

/** @type {import('sequelize-cli').Migration} */
export async function up(
  queryInterface: QueryInterface,
  Sequelize: typeof DataTypes
) {
  const [existing]: any = await queryInterface.sequelize.query(
    'SELECT id FROM `classes` LIMIT 1'
  )

  if (existing && existing.length > 0) {
    return
  }

  const formData: any[] = []

  const parents: { id: string; name: string }[] =
    await queryInterface.sequelize.query(
      'SELECT id, name FROM `grades` ORDER BY name ASC',
      { type: QueryTypes.SELECT }
    )

  for (const parent of parents) {
    const suffixes = ['A', 'B']
    for (const suffix of suffixes) {
      const name = `${parent.name}-${suffix}`
      formData.push({
        id: v4(),
        name,
        GradeId: parent.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }
  }

  if (formData.length > 0) {
    await queryInterface.bulkInsert('classes', formData)
  }
}

export async function down(
  queryInterface: QueryInterface,
  Sequelize: typeof DataTypes
) {
  await queryInterface.bulkDelete('classes', {})
}
