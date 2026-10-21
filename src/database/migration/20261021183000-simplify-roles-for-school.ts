'use strict'

import { DataTypes, QueryInterface, QueryTypes } from 'sequelize'
import { v4 as uuidv4 } from 'uuid'
import { RoleId } from '@/libs/constant/roleIds'
import Hashing from '@/config/hash.config'
import { env } from '@/config/env.config'

const hashing = new Hashing()

/** @type {import('sequelize-cli').Migration} */
export async function up(
  queryInterface: QueryInterface,
  Sequelize: typeof DataTypes
) {
  const transaction = await queryInterface.sequelize.transaction()
  try {
    // 1. Ensure/Update the 3 main roles
    const targetRoles = [
      { id: RoleId.siswa, name: 'siswa' },
      { id: RoleId.gurubk, name: 'gurubk' },
      { id: RoleId.walikelas, name: 'walikelas' },
    ]

    for (const role of targetRoles) {
      const existing: any[] = await queryInterface.sequelize.query(
        'SELECT id FROM `roles` WHERE `id` = :id',
        {
          replacements: { id: role.id },
          type: QueryTypes.SELECT,
          transaction,
        }
      )

      if (existing.length > 0) {
        await queryInterface.sequelize.query(
          'UPDATE `roles` SET `name` = :name, `updatedAt` = :updatedAt WHERE `id` = :id',
          {
            replacements: {
              id: role.id,
              name: role.name,
              updatedAt: new Date(),
            },
            transaction,
          }
        )
      } else {
        await queryInterface.bulkInsert(
          'roles',
          [
            {
              id: role.id,
              name: role.name,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
          { transaction }
        )
      }
    }

    // 2. Remap old roles in user_has_roles
    // admin medis -> gurubk
    await queryInterface.sequelize.query(
      'UPDATE `user_has_roles` SET `RoleId` = :gurubk WHERE `RoleId` = :adminMedis',
      {
        replacements: {
          gurubk: RoleId.gurubk,
          adminMedis: 'b40a9513-a2bc-447a-956c-9c4d1462a1f7',
        },
        transaction,
      }
    )

    // kepala keluarga -> siswa
    await queryInterface.sequelize.query(
      'UPDATE `user_has_roles` SET `RoleId` = :siswa WHERE `RoleId` = :kepalaKeluarga',
      {
        replacements: {
          siswa: RoleId.siswa,
          kepalaKeluarga: '1c591b5e-15e1-4b8d-99ea-d2919bf5b1b6',
        },
        transaction,
      }
    )

    // 3. Remove deprecated roles
    await queryInterface.sequelize.query(
      'DELETE FROM `roles` WHERE `id` NOT IN (:allowedRoleIds)',
      {
        replacements: {
          allowedRoleIds: [RoleId.siswa, RoleId.gurubk, RoleId.walikelas],
        },
        transaction,
      }
    )

    // 4. Seed default accounts if they do not exist
    const defaultPassword = await hashing.hash(env.APP_DEFAULT_PASS || 'password')

    const defaultAccounts = [
      {
        fullname: 'Guru BK',
        email: 'gurubk@al-multazam.sch.id',
        roleId: RoleId.gurubk,
      },
      {
        fullname: 'Wali Kelas',
        email: 'walikelas@al-multazam.sch.id',
        roleId: RoleId.walikelas,
      },
    ]

    for (const acc of defaultAccounts) {
      const existingUser: any[] = await queryInterface.sequelize.query(
        'SELECT id FROM `users` WHERE `email` = :email',
        {
          replacements: { email: acc.email },
          type: QueryTypes.SELECT,
          transaction,
        }
      )

      let userId: string
      if (existingUser.length === 0) {
        userId = uuidv4()
        await queryInterface.bulkInsert(
          'users',
          [
            {
              id: userId,
              fullname: acc.fullname,
              email: acc.email,
              password: defaultPassword,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
          { transaction }
        )
      } else {
        userId = existingUser[0].id
        await queryInterface.sequelize.query(
          'UPDATE `users` SET `password` = :password, `fullname` = :fullname WHERE `id` = :id',
          {
            replacements: {
              password: defaultPassword,
              fullname: acc.fullname,
              id: userId,
            },
            transaction,
          }
        )
      }

      // Check user_has_roles
      const existingRole: any[] = await queryInterface.sequelize.query(
        'SELECT id FROM `user_has_roles` WHERE `UserId` = :userId AND `RoleId` = :roleId',
        {
          replacements: { userId, roleId: acc.roleId },
          type: QueryTypes.SELECT,
          transaction,
        }
      )

      if (existingRole.length === 0) {
        await queryInterface.bulkInsert(
          'user_has_roles',
          [
            {
              id: uuidv4(),
              UserId: userId,
              RoleId: acc.roleId,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
          { transaction }
        )
      }
    }

    await transaction.commit()
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

export async function down(
  queryInterface: QueryInterface,
  Sequelize: typeof DataTypes
) {
  // Rollback logic if necessary
}
