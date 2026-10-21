'use strict'

import { DataTypes, QueryInterface } from 'sequelize'
import { v4 } from 'uuid'

/** @type {import('sequelize-cli').Migration} */
export async function up(
  queryInterface: QueryInterface,
  Sequelize: typeof DataTypes
) {
  const [existing]: any = await queryInterface.sequelize.query(
    'SELECT id FROM `grades` LIMIT 1'
  )

  if (existing && existing.length > 0) {
    return
  }

  const formData: any[] = []
  const names = ['VII', 'VIII', 'IX']

  for (const name of names) {
    formData.push({
      id: v4(),
      name,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  }

  await queryInterface.bulkInsert('grades', formData)
}

export async function down(
  queryInterface: QueryInterface,
  Sequelize: typeof DataTypes
) {
  await queryInterface.bulkDelete('grades', {})
}
