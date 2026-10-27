'use strict'

import _ from 'lodash'
import { DataTypes, QueryInterface } from 'sequelize'
import { v4 } from 'uuid'

/** @type {import('sequelize-cli').Migration} */
export async function up(
  queryInterface: QueryInterface,
  Sequelize: typeof DataTypes
) {
  const formData: any[] = []

  for (let i = 1; i <= 20; i++) {
    formData.push({
      id: v4(),
      name: i,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  }

  await queryInterface.bulkInsert('rukun_wargas', formData)
}

export async function down(
  queryInterface: QueryInterface,
  Sequelize: typeof DataTypes
) {
  await queryInterface.bulkDelete('rukun_wargas', {})
}
