import { DataTypes, QueryInterface } from 'sequelize'
import { Encryption } from '@/libs/encryption'

export async function up(
  queryInterface: QueryInterface,
  Sequelize: typeof DataTypes
) {
  await queryInterface.addColumn('user_details', 'nik', {
    type: Sequelize.STRING(16),
    allowNull: true,
  })

  const rows = await queryInterface.sequelize.query(
    `SELECT id, nikEncrypted FROM user_details WHERE nikEncrypted IS NOT NULL`,
    { type: 'SELECT' }
  )

  for (const row of rows as any[]) {
    try {
      const decrypted = Encryption.decrypt(row.nikEncrypted)
      await queryInterface.sequelize.query(
        `UPDATE user_details SET nik = ? WHERE id = ?`,
        { replacements: [decrypted, row.id] }
      )
    } catch {
      await queryInterface.sequelize.query(
        `UPDATE user_details SET nik = ? WHERE id = ?`,
        { replacements: [row.nikEncrypted, row.id] }
      )
    }
  }

  await queryInterface.addConstraint('user_details', {
    fields: ['nik'],
    type: 'unique',
    name: 'unique_nik',
  })

  await queryInterface.removeColumn('user_details', 'nikHash')
  await queryInterface.removeColumn('user_details', 'nikEncrypted')
}

export async function down(
  queryInterface: QueryInterface,
  Sequelize: typeof DataTypes
) {
  await queryInterface.addColumn('user_details', 'nikHash', {
    type: Sequelize.STRING,
    allowNull: true,
  })

  await queryInterface.addColumn('user_details', 'nikEncrypted', {
    type: Sequelize.STRING,
    allowNull: true,
  })

  const rows = await queryInterface.sequelize.query(
    `SELECT id, nik FROM user_details WHERE nik IS NOT NULL`,
    { type: 'SELECT' }
  )

  for (const row of rows as any[]) {
    const encrypted = Encryption.encrypt(row.nik)
    const hashed = Encryption.hashIndex(row.nik)
    await queryInterface.sequelize.query(
      `UPDATE user_details SET nikEncrypted = ?, nikHash = ? WHERE id = ?`,
      { replacements: [encrypted, hashed, row.id] }
    )
  }

  await queryInterface.removeColumn('user_details', 'nik')
}
