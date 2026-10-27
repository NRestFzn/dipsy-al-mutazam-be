'use strict'

import _ from 'lodash'
import { DataTypes, QueryInterface } from 'sequelize'
import { v4 } from 'uuid'

const data = [
  {
    minRange: 0,
    maxRange: 250000,
  },
  {
    minRange: 250000,
    maxRange: 500000,
  },
  {
    minRange: 500000,
    maxRange: 1000000,
  },
  {
    minRange: 1000000,
    maxRange: 1500000,
  },
  {
    minRange: 1500000,
    maxRange: 2000000,
  },
  {
    minRange: 2000000,
    maxRange: 2500000,
  },
]

/** @type {import('sequelize-cli').Migration} */
export async function up(
  queryInterface: QueryInterface,
  Sequelize: typeof DataTypes
) {
  const formData: any[] = []

  if (!_.isEmpty(data)) {
    for (let i = 0; i < data.length; i += 1) {
      const item = data[i]

      formData.push({
        ...item,
        id: v4(),
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }
  }

  await queryInterface.bulkInsert('salary_ranges', formData)
}

export async function down(
  queryInterface: QueryInterface,
  Sequelize: typeof DataTypes
) {
  await queryInterface.bulkDelete('salary_ranges', {})
}
