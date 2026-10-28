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
  {
    id: RoleId.tu,
    name: 'tu', // Tata Usaha
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

      const [existing]: any = await queryInterface.sequelize.query(
        'SELECT id FROM `roles` WHERE id = :id OR name = :name LIMIT 1',
        { replacements: { id: item.id, name: item.name } }
      )

      if (!existing || existing.length === 0) {
        formData.push({
          ...item,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      }
    }
  }

  if (formData.length > 0) {
    await queryInterface.bulkInsert('roles', formData)
  }
}

export async function down(
  queryInterface: QueryInterface,
  Sequelize: typeof DataTypes
) {
  await queryInterface.bulkDelete('roles', {})
}
