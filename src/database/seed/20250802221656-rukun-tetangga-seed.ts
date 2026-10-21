'use strict'

import _ from 'lodash'
import { DataTypes, QueryInterface, QueryTypes } from 'sequelize'
import { v4 } from 'uuid'

/** @type {import('sequelize-cli').Migration} */
export async function up(
  queryInterface: QueryInterface,
  Sequelize: typeof DataTypes
) {
  const [tables]: any = await queryInterface.sequelize.query(
    "SHOW TABLES LIKE 'classes'"
  )

  const isSchoolMode = tables && tables.length > 0
  const tableName = isSchoolMode ? 'classes' : 'rukun_tetanggas'
  const parentTable = isSchoolMode ? 'grades' : 'rukun_wargas'
  const foreignKey = isSchoolMode ? 'GradeId' : 'RukunWargaId'

  const [existing]: any = await queryInterface.sequelize.query(
    `SELECT id FROM \`${tableName}\` LIMIT 1`
  )

  if (existing && existing.length > 0) {
    return
  }

  const formData: any[] = []

  const parents: { id: string; name: string }[] =
    await queryInterface.sequelize.query(
      `SELECT id, name FROM \`${parentTable}\` ORDER BY name ASC`,
      { type: QueryTypes.SELECT }
    )

  for (const parent of parents) {
    const suffixes = isSchoolMode ? ['A', 'B'] : Array.from({ length: 20 }, (_, i) => String(i + 1))
    for (const suffix of suffixes) {
      const name = isSchoolMode ? `${parent.name}-${suffix}` : suffix
      formData.push({
        id: v4(),
        name,
        [foreignKey]: parent.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }
  }

  if (formData.length > 0) {
    await queryInterface.bulkInsert(tableName, formData)
  }
}

export async function down(
  queryInterface: QueryInterface,
  Sequelize: typeof DataTypes
) {
  const [tables]: any = await queryInterface.sequelize.query(
    "SHOW TABLES LIKE 'classes'"
  )
  const tableName = tables && tables.length > 0 ? 'classes' : 'rukun_tetanggas'
  await queryInterface.bulkDelete(tableName, {})
}
