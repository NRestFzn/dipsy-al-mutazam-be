'use strict'

import { green } from 'colorette'
import _ from 'lodash'
import { DataTypes, QueryInterface } from 'sequelize'
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
      fullname: 'Tata Usaha',
      email: 'tu@al-multazam.sch.id',
      RoleIds: [RoleId.tu],
      password: await hashing.hash(defaultPassword),
    },
    {
      fullname: 'Guru BK',
      email: 'gurubk@al-multazam.sch.id',
      RoleIds: [RoleId.gurubk],
      password: await hashing.hash(defaultPassword),
    },
    {
      fullname: 'Wali Kelas',
      email: 'walikelas@al-multazam.sch.id',
      RoleIds: [RoleId.walikelas],
      password: await hashing.hash(defaultPassword),
    },
  ]

  const formData = []
  const userHasRolesFormData = []

  if (!_.isEmpty(data)) {
    for (let i = 0; i < data.length; i += 1) {
      const item = data[i]

      const [existing]: any = await queryInterface.sequelize.query(
        'SELECT id FROM `users` WHERE email = :email LIMIT 1',
        { replacements: { email: item.email } }
      )

      if (existing && existing.length > 0) {
        await queryInterface.sequelize.query(
          'UPDATE `users` SET password = :password, updatedAt = :updatedAt WHERE id = :id',
          {
            replacements: {
              password: item.password,
              updatedAt: new Date(),
              id: existing[0].id,
            },
          }
        )
        continue
      }

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
          RoleId: item.RoleIds[j],
          UserId,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      }
    }
  }

  if (formData.length > 0) {
    await queryInterface.bulkInsert('users', formData)
  }
  if (userHasRolesFormData.length > 0) {
    await queryInterface.bulkInsert('user_has_roles', userHasRolesFormData)
  }
}

export async function down(
  queryInterface: QueryInterface,
  Sequelize: typeof DataTypes
) {
  await queryInterface.bulkDelete('users', {})
}
