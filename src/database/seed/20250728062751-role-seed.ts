'use strict'

import _ from 'lodash'
import { DataTypes, QueryInterface } from 'sequelize'
import { RoleId } from '@/libs/constant/roleIds'

const data = [
  {
    id: RoleId.adminDesa,
    name: 'admin desa',
  },
  {
    id: RoleId.adminMedis,
    name: 'admin medis',
  },
  {
    id: RoleId.user,
    name: 'user',
  },
  {
    id: RoleId.kaderDesa,
    name: 'kader desa',
  },
  {
    id: RoleId.kepalaKeluarga,
    name: 'kepala keluarga',
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
