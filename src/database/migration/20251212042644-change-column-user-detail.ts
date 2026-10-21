'use strict'

import { DataTypes, QueryInterface } from 'sequelize'

/** @type {import('sequelize-cli').Migration} */
export async function up(
  queryInterface: QueryInterface,
  Sequelize: typeof DataTypes
) {
  const transaction = await queryInterface.sequelize.transaction()

  try {
    // KITA SESUAIKAN DENGAN SCREENSHOT ANDA
    const foreignKeys = [
      {
        field: 'RukunWargaId',
        targetModel: 'rukunWarga',
        // Nama constraint LAMA yang ada di database saat ini (RESTRICT)
        oldConstraintName: 'userdetail_ibfk_2',
        // Nama constraint BARU yang akan kita buat (CASCADE)
        newConstraintName: 'fk_userDetail_RukunWargaId',
      },
      {
        field: 'RukunTetanggaId',
        targetModel: 'rukunTetangga',
        oldConstraintName: 'userdetail_ibfk_3',
        newConstraintName: 'fk_userDetail_RukunTetanggaId',
      },
      {
        field: 'EducationId',
        targetModel: 'education',
        oldConstraintName: 'userdetail_ibfk_4',
        newConstraintName: 'fk_userDetail_EducationId',
      },
      {
        field: 'SalaryRangeId',
        targetModel: 'salaryRange',
        oldConstraintName: 'userdetail_ibfk_5',
        newConstraintName: 'fk_userDetail_SalaryRangeId',
      },
      {
        field: 'MarriageStatusId',
        targetModel: 'marriageStatus',
        oldConstraintName: 'userdetail_ibfk_6',
        newConstraintName: 'fk_userDetail_MarriageStatusId',
      },
    ]

    for (const fk of foreignKeys) {
      // 1. Hapus Constraint Lama
      // Cari nama constraint sebenarnya di database (bisa berupa ibfk_x atau angka seperti di MariaDB)
      let constraintNameToRemove = fk.oldConstraintName
      const [results]: any = await queryInterface.sequelize.query(
        `SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
         WHERE TABLE_SCHEMA = DATABASE() 
           AND TABLE_NAME = 'userDetail' 
           AND COLUMN_NAME = '${fk.field}' 
           AND REFERENCED_TABLE_NAME IS NOT NULL 
         LIMIT 1`,
        { transaction }
      )

      if (results && results.length > 0) {
        constraintNameToRemove = results[0].CONSTRAINT_NAME
      }

      await queryInterface.removeConstraint(
        'userDetail',
        constraintNameToRemove,
        { transaction }
      )

      // 2. Buat Constraint Baru dengan aturan CASCADE
      await queryInterface.addConstraint('userDetail', {
        fields: [fk.field],
        type: 'foreign key',
        name: fk.newConstraintName, // Kita pakai nama baru biar rapi
        references: {
          table: fk.targetModel,
          field: 'id',
        },
        onDelete: 'CASCADE', // Ubah jadi CASCADE
        onUpdate: 'CASCADE',
        transaction,
      })
    }

    await transaction.commit()
  } catch (error) {
    await transaction.rollback()
    console.error('Gagal migrasi:', error) // Logging error biar jelas
    throw error
  }
}

export async function down(
  queryInterface: QueryInterface,
  Sequelize: typeof DataTypes
) {
  const transaction = await queryInterface.sequelize.transaction()

  try {
    const foreignKeys = [
      {
        field: 'RukunWargaId',
        targetModel: 'rukunWarga',
        oldConstraintName: 'userdetail_ibfk_2',
        newConstraintName: 'fk_userDetail_RukunWargaId',
      },
      {
        field: 'RukunTetanggaId',
        targetModel: 'rukunTetangga',
        oldConstraintName: 'userdetail_ibfk_3',
        newConstraintName: 'fk_userDetail_RukunTetanggaId',
      },
      {
        field: 'EducationId',
        targetModel: 'education',
        oldConstraintName: 'userdetail_ibfk_4',
        newConstraintName: 'fk_userDetail_EducationId',
      },
      {
        field: 'SalaryRangeId',
        targetModel: 'salaryRange',
        oldConstraintName: 'userdetail_ibfk_5',
        newConstraintName: 'fk_userDetail_SalaryRangeId',
      },
      {
        field: 'MarriageStatusId',
        targetModel: 'marriageStatus',
        oldConstraintName: 'userdetail_ibfk_6',
        newConstraintName: 'fk_userDetail_MarriageStatusId',
      },
    ]

    for (const fk of foreignKeys) {
      // 1. Hapus Constraint CASCADE (nama baru)
      let constraintNameToRemove = fk.newConstraintName
      const [results]: any = await queryInterface.sequelize.query(
        `SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
         WHERE TABLE_SCHEMA = DATABASE() 
           AND TABLE_NAME = 'userDetail' 
           AND COLUMN_NAME = '${fk.field}' 
           AND REFERENCED_TABLE_NAME IS NOT NULL 
         LIMIT 1`,
        { transaction }
      )

      if (results && results.length > 0) {
        constraintNameToRemove = results[0].CONSTRAINT_NAME
      }

      await queryInterface.removeConstraint(
        'userDetail',
        constraintNameToRemove,
        { transaction }
      )

      // 2. Kembalikan ke Constraint RESTRICT (nama lama ibfk)
      await queryInterface.addConstraint('userDetail', {
        fields: [fk.field],
        type: 'foreign key',
        name: fk.oldConstraintName,
        references: {
          table: fk.targetModel,
          field: 'id',
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
        transaction,
      })
    }

    await transaction.commit()
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}
