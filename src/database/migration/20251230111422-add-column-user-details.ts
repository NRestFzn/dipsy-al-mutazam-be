'use strict'

import { DataTypes, QueryInterface, QueryTypes } from 'sequelize'
import Hashing from '@/config/hash.config'
import { env } from '@/config/env.config'
import { Encryption } from '@/libs/encryption'

const hashing = new Hashing()

interface UserDetailRow {
  UserId: string | number
  nik: string
}

interface EncryptedRow {
  UserId: string | number
  nikEncrypted: string
}

/** @type {import('sequelize-cli').Migration} */

export async function up(
  queryInterface: QueryInterface,
  Sequelize: typeof DataTypes
) {
  const transaction = await queryInterface.sequelize.transaction()

  try {
    await queryInterface.addColumn(
      'user_details',
      'nikHash',
      {
        type: Sequelize.STRING,
        allowNull: true,
      },
      { transaction }
    )

    await queryInterface.addColumn(
      'user_details',
      'nikEncrypted',
      {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      { transaction }
    )

    const results = await queryInterface.sequelize.query<UserDetailRow>(
      'SELECT UserId, `nik` FROM user_details WHERE `nik` IS NOT NULL',
      { type: QueryTypes.SELECT, transaction }
    )

    for (const row of results) {
      if (row.nik) {
        const encrypted = Encryption.encrypt(row.nik)
        const hashed =  Encryption.hashIndex(row.nik)

        await queryInterface.sequelize.query(
          `UPDATE user_details 
           SET nikHash = :hash, nikEncrypted = :enc 
           WHERE UserId = :id`,
          {
            replacements: {
              hash: hashed,
              enc: encrypted,
              id: row.UserId,
            },
            transaction,
          }
        )
      }
    }

    await queryInterface.removeColumn('user_details', 'nik', { transaction })

    await transaction.commit()
  } catch (error) {
    await transaction.rollback()
    console.error('Migration Failed:', error)
    throw error
  }
}

export async function down(
  queryInterface: QueryInterface,
  Sequelize: typeof DataTypes
) {
  const transaction = await queryInterface.sequelize.transaction()

  try {
    await queryInterface.addColumn(
      'user_details',
      'nik',
      {
        type: Sequelize.STRING,
        allowNull: true,
      },
      { transaction }
    )

    const results = await queryInterface.sequelize.query<EncryptedRow>(
      'SELECT UserId, nikEncrypted FROM user_details WHERE nikEncrypted IS NOT NULL',
      { type: QueryTypes.SELECT, transaction }
    )

    for (const row of results) {
      if (row.nikEncrypted) {
        const plainNik = Encryption.decrypt(row.nikEncrypted)

        await queryInterface.sequelize.query(
          `UPDATE user_details SET \`nik\` = :nik WHERE UserId = :id`,
          {
            replacements: {
              nik: plainNik,
              id: row.UserId,
            },
            transaction,
          }
        )
      }
    }

    await queryInterface.removeColumn('user_details', 'nikHash', {
      transaction,
    })
    await queryInterface.removeColumn('user_details', 'nikEncrypted', {
      transaction,
    })

    await transaction.commit()
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}
