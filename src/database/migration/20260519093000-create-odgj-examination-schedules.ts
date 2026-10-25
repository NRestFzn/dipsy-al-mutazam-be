'use strict'

import { DataTypes, QueryInterface } from 'sequelize'
import { QueryTypes } from 'sequelize'
import { randomUUID } from 'crypto'

export async function up(
  queryInterface: QueryInterface,
  Sequelize: typeof DataTypes
) {
  const odgjResidentColumns = await queryInterface.describeTable(
    'odgj_residents'
  )

  await queryInterface.createTable('odgj_examination_schedules', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
    },
    OdgjResidentId: {
      allowNull: false,
      type: Sequelize.UUID,
      references: {
        model: 'odgj_residents',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    examinationDate: {
      allowNull: false,
      type: Sequelize.DATEONLY,
    },
    status: {
      allowNull: false,
      type: Sequelize.ENUM('scheduled', 'completed', 'missed'),
      defaultValue: 'scheduled',
    },
    notes: {
      allowNull: true,
      type: Sequelize.TEXT,
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
  })

  if (odgjResidentColumns.examinationDate) {
    const legacySchedules = await queryInterface.sequelize.query<{
      id: string
      examinationDate: Date
      notes?: string | null
      createdAt: Date
      updatedAt: Date
    }>(
      'SELECT id, examinationDate, notes, createdAt, updatedAt FROM odgj_residents WHERE examinationDate IS NOT NULL',
      { type: QueryTypes.SELECT }
    )

    if (legacySchedules.length) {
      await queryInterface.bulkInsert(
        'odgj_examination_schedules',
        legacySchedules.map((schedule) => ({
          id: randomUUID(),
          OdgjResidentId: schedule.id,
          examinationDate: schedule.examinationDate,
          status: 'scheduled',
          notes: schedule.notes,
          createdAt: schedule.createdAt || new Date(),
          updatedAt: schedule.updatedAt || new Date(),
        }))
      )
    }

    await queryInterface.removeColumn('odgj_residents', 'examinationDate')
  }
}

export async function down(
  queryInterface: QueryInterface,
  Sequelize: typeof DataTypes
) {
  await queryInterface.dropTable('odgj_examination_schedules')

  const odgjResidentColumns = await queryInterface.describeTable(
    'odgj_residents'
  )

  if (!odgjResidentColumns.examinationDate) {
    await queryInterface.addColumn('odgj_residents', 'examinationDate', {
      allowNull: true,
      type: Sequelize.DATEONLY,
    })
  }
}
