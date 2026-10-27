'use strict'

import { DataTypes, QueryInterface } from 'sequelize'
import { v4 as uuidv4 } from 'uuid'

const GRADES = [
  { name: 'VII', level: 'SMP' },
  { name: 'VIII', level: 'SMP' },
  { name: 'IX', level: 'SMP' },
  { name: 'X', level: 'SMA' },
  { name: 'XI', level: 'SMA' },
  { name: 'XII', level: 'SMA' },
]

/** @type {import('sequelize-cli').Migration} */
export async function up(
  queryInterface: QueryInterface,
  _Sequelize: typeof DataTypes
) {
  const now = new Date()

  for (const grade of GRADES) {
    const [existing]: any = await queryInterface.sequelize.query(
      `SELECT id FROM grades WHERE name = '${grade.name}' LIMIT 1`
    )

    if (existing.length === 0) {
      await queryInterface.bulkInsert('grades', [
        {
          id: uuidv4(),
          name: grade.name,
          level: grade.level,
          createdAt: now,
          updatedAt: now,
        },
      ])
    }
  }
}

export async function down(
  queryInterface: QueryInterface,
  _Sequelize: typeof DataTypes
) {
  for (const grade of GRADES) {
    await queryInterface.bulkDelete('grades', { name: grade.name })
  }
}
