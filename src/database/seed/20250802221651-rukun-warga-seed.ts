'use strict'

import _ from 'lodash'
import { DataTypes, QueryInterface } from 'sequelize'
import { v4 } from 'uuid'

/** @type {import('sequelize-cli').Migration} */
export async function up(
  queryInterface: QueryInterface,
  Sequelize: typeof DataTypes
) {
  const [tables]: any = await queryInterface.sequelize.query(
    "SHOW TABLES LIKE 'grades'"
  )

  const tableName = tables && tables.length > 0 ? 'grades' : 'rukun_wargas'

  const [existing]: any = await queryInterface.sequelize.query(
    `SELECT id FROM \`${tableName}\` LIMIT 1`
  )

  if (existing && existing.length > 0) {
    return
  }

  const formData: any[] = []

  const names = tableName === 'grades' ? ['VII', 'VIII', 'IX'] : Array.from({ length: 20 }, (_, i) => String(i + 1))

  for (const name of names) {
    formData.push({
      id: v4(),
      name,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  }

  await queryInterface.bulkInsert(tableName, formData)
}

export async function down(
  queryInterface: QueryInterface,
  Sequelize: typeof DataTypes
) {
  const [tables]: any = await queryInterface.sequelize.query(
    "SHOW TABLES LIKE 'grades'"
  )
  const tableName = tables && tables.length > 0 ? 'grades' : 'rukun_wargas'
  await queryInterface.bulkDelete(tableName, {})
}
