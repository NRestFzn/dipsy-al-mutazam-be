'use strict'

import { DataTypes, QueryInterface } from 'sequelize'

/** @type {import('sequelize-cli').Migration} */
export async function up(
  queryInterface: QueryInterface,
  Sequelize: typeof DataTypes
) {
  await queryInterface.createTable('userDetail', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
    },
    UserId: {
      allowNull: false,
      type: Sequelize.UUID,
      references: {
        model: 'user',
        key: 'id',
      },
      onUpdate: 'cascade',
      onDelete: 'cascade',
    },
    RukunWargaId: {
      allowNull: false,
      type: Sequelize.UUID,
      references: {
        model: 'rukunWarga',
        key: 'id',
      },
      onUpdate: 'cascade',
      onDelete: 'restrict',
    },
    RukunTetanggaId: {
      allowNull: false,
      type: Sequelize.UUID,
      references: {
        model: 'rukunTetangga',
        key: 'id',
      },
      onUpdate: 'cascade',
      onDelete: 'restrict',
    },
    EducationId: {
      allowNull: false,
      type: Sequelize.UUID,
      references: {
        model: 'education',
        key: 'id',
      },
      onUpdate: 'cascade',
      onDelete: 'restrict',
    },
    SalaryRangeId: {
      allowNull: false,
      type: Sequelize.UUID,
      references: {
        model: 'salaryRange',
        key: 'id',
      },
      onUpdate: 'cascade',
      onDelete: 'restrict',
    },
    MarriageStatusId: {
      allowNull: false,
      type: Sequelize.UUID,
      references: {
        model: 'marriageStatus',
        key: 'id',
      },
      onUpdate: 'cascade',
      onDelete: 'restrict',
    },
    profession: {
      allowNull: false,
      type: Sequelize.STRING,
    },
    nik: {
      allowNull: false,
      type: Sequelize.STRING(16, true),
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
}

export async function down(
  queryInterface: QueryInterface,
  Sequelize: typeof DataTypes
) {
  await queryInterface.dropTable('userDetail')
}
