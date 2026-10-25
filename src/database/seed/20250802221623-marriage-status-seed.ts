'use strict'

import _ from 'lodash'
import { DataTypes, QueryInterface } from 'sequelize'
import { v4 } from 'uuid'

const data = [
  {
    name: 'Menikah',
  },
  {
    name: 'Bercerai',
  },
  {
    name: 'Belum Menikah',
  },
]

/** @type {import('sequelize-cli').Migration} */
export async function up(
  queryInterface: QueryInterface,
  Sequelize: typeof DataTypes
) {
  const formData: any[] = []

  const startTime = new Date()

  if (!_.isEmpty(data)) {
    for (let i = 0; i < data.length; i += 1) {
      const item = data[i]

      const timeStamps = new Date(startTime.getTime() + i * 1000)

      formData.push({
        ...item,
        id: v4(),
        createdAt: timeStamps,
        updatedAt: timeStamps,
      })
    }
  }

  await queryInterface.bulkInsert('marriage_statuses', formData)
}

export async function down(
  queryInterface: QueryInterface,
  Sequelize: typeof DataTypes
) {
  await queryInterface.bulkDelete('marriage_statuses', {})
}
