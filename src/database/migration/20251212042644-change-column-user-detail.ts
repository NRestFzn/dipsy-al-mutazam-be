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
      // 1. Hapus Constraint Lama (Nama sesuai screenshot: ibfk_...)
      // Pastikan nama tabel 'userDetail' sesuai dengan definisi model Anda
      await queryInterface.removeConstraint(
        'userDetail',
        fk.oldConstraintName,
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
      await queryInterface.removeConstraint(
        'userDetail',
        fk.newConstraintName,
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
