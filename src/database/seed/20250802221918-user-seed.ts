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
  // Find default Class VII-A and its Grade
  const [class7A]: any = await queryInterface.sequelize.query(
    "SELECT id, GradeId FROM `classes` WHERE name = 'VII-A' LIMIT 1"
  )
  const defaultClassId = class7A && class7A.length > 0 ? class7A[0].id : null
  const defaultGradeId = class7A && class7A.length > 0 ? class7A[0].GradeId : null

  const data = [
    {
      fullname: 'Guru BK',
      email: 'gurubk@al-multazam.sch.id',
      RoleIds: [RoleId.gurubk],
      password: await hashing.hash(defaultPassword),
    },
    {
      fullname: 'Wali Kelas VII-A',
      email: 'walikelas@al-multazam.sch.id',
      RoleIds: [RoleId.walikelas],
      password: await hashing.hash(defaultPassword),
    },
    {
      fullname: 'Ahmad Siswa',
      email: '1234567890@al-multazam.sch.id',
      RoleIds: [RoleId.siswa],
      password: await hashing.hash(defaultPassword),
      nisn: '1234567890',
    },
  ]

  const formData: any[] = []
  const userHasRolesFormData: any[] = []
  const userDetailsFormData: any[] = []
  let waliKelasUserId: string | null = null

  if (!_.isEmpty(data)) {
    for (let i = 0; i < data.length; i += 1) {
      const item = data[i]

      const [existing]: any = await queryInterface.sequelize.query(
        'SELECT id FROM `users` WHERE email = :email LIMIT 1',
        { replacements: { email: item.email } }
      )

      if (existing && existing.length > 0) {
        if (item.email === 'walikelas@al-multazam.sch.id') {
          waliKelasUserId = existing[0].id
        }
        continue
      }

      const UserId = uuidv4()
      if (item.email === 'walikelas@al-multazam.sch.id') {
        waliKelasUserId = UserId
      }

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

      if ((item as any).nisn) {
        userDetailsFormData.push({
          id: uuidv4(),
          UserId,
          nisn: (item as any).nisn,
          nis: '2026001',
          gender: 'm',
          birthDate: '2010-05-15',
          entryYear: '2024',
          academicYear: '2024/2025',
          GradeId: defaultGradeId,
          ClassId: defaultClassId,
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
  if (userDetailsFormData.length > 0) {
    await queryInterface.bulkInsert('user_details', userDetailsFormData)
  }

  if (waliKelasUserId && defaultClassId) {
    await queryInterface.sequelize.query(
      'UPDATE `classes` SET homeroomTeacherId = :UserId WHERE id = :defaultClassId',
      { replacements: { UserId: waliKelasUserId, defaultClassId } }
    )
  }
}

export async function down(
  queryInterface: QueryInterface,
  Sequelize: typeof DataTypes
) {
  await queryInterface.bulkDelete('users', {})
}
