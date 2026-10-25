'use strict'

import _ from 'lodash'
import { DataTypes, QueryInterface } from 'sequelize'
import { RoleId } from '@/libs/constant/roleIds'

const data = [
  {
    id: RoleId.siswa,
    name: 'siswa',
  },
  {
    id: RoleId.gurubk,
    name: 'gurubk',
  },
  {
    id: RoleId.walikelas,
    name: 'walikelas',
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
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }
  }

  await queryInterface.bulkInsert('roles', formData)
}

export async function down(
  queryInterface: QueryInterface,
  Sequelize: typeof DataTypes
) {
  await queryInterface.bulkDelete('roles', {})
}
