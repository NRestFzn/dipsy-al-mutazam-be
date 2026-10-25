'use strict'

import { green } from 'colorette'
import _ from 'lodash'
import { DataTypes, QueryInterface, QueryTypes } from 'sequelize'
import { v4 as uuidv4 } from 'uuid'
import { env } from '@/config/env.config'
import Hashing from '@/config/hash.config'
import { logger } from '@/config/httplogger.config'
import { RoleId } from '@/libs/constant/roleIds'

const hashing = new Hashing()

const defaultPassword = env.APP_DEFAULT_PASS
logger.info(`Seed - your default password: ${green(defaultPassword)}`)

/** @type {import('sequelize-cli').Migration} */
export async function up(
  queryInterface: QueryInterface,
  Sequelize: typeof DataTypes
) {
  const data = [
    {
      fullname: 'Admin Medis',
      email: 'admin.medis@example.com',
      RoleIds: [RoleId.adminMedis],
      password: await hashing.hash(defaultPassword),
    },
    {
      fullname: 'Admin Desa',
      email: 'admin.desa@example.com',
      RoleIds: [RoleId.adminDesa],
      password: await hashing.hash(defaultPassword),
    },
  ]

  const formData = []

  const userHasRolesFormData = []

  if (!_.isEmpty(data)) {
    for (let i = 0; i < data.length; i += 1) {
      const item = data[i]

      const UserId = uuidv4()

      formData.push({
        id: UserId,
        fullname: item.fullname,
        email: item.email,
        password: item.password,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      for (let j = 0; j < item.RoleIds.length; j++) {
        userHasRolesFormData.push({
          id: uuidv4(),
          RoleId: data[i].RoleIds[j],
          UserId,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      }
    }
  }

  await queryInterface.bulkInsert('users', formData)
  await queryInterface.bulkInsert('user_has_roles', userHasRolesFormData)
}

export async function down(
  queryInterface: QueryInterface,
  Sequelize: typeof DataTypes
) {
  await queryInterface.bulkDelete('users', {})
}
