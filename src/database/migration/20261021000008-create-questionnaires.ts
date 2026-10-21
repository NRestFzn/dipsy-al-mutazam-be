'use strict'

import { DataTypes, QueryInterface } from 'sequelize'

/** @type {import('sequelize-cli').Migration} */
export async function up(
  queryInterface: QueryInterface,
  Sequelize: typeof DataTypes
) {
  await queryInterface.createTable('questionnaires', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
    },
    title: {
      allowNull: false,
      type: Sequelize.STRING,
    },
    description: {
      allowNull: false,
      type: Sequelize.TEXT,
    },
    status: {
      allowNull: false,
      type: Sequelize.ENUM('draft', 'publish'),
    },
    riskThreshold: {
      allowNull: false,
      type: Sequelize.INTEGER,
    },
    cooldownInMinutes: {
      allowNull: false,
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    scoringType: {
      allowNull: false,
      type: Sequelize.STRING,
      defaultValue: 'binary_threshold',
    },
    scoringConfig: {
      allowNull: true,
      type: Sequelize.JSON,
    },
    CategoryId: {
      allowNull: false,
      type: Sequelize.UUID,
      references: {
        model: 'questionnaire_categories',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
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
  await queryInterface.dropTable('questionnaires')
}
