'use strict'

import { DataTypes, QueryInterface } from 'sequelize'

/** @type {import('sequelize-cli').Migration} */
export async function up(
  queryInterface: QueryInterface,
  Sequelize: typeof DataTypes
) {
  await queryInterface.createTable('questionnaire_submissions', {
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
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    QuestionnaireId: {
      allowNull: false,
      type: Sequelize.UUID,
      references: {
        model: 'questionnaires',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    SubmittedBy: {
      allowNull: false,
      type: Sequelize.UUID,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    isAssisted: {
      allowNull: false,
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    score: {
      allowNull: true,
      type: Sequelize.INTEGER,
    },
    resultKey: {
      allowNull: true,
      type: Sequelize.STRING,
    },
    resultLabel: {
      allowNull: true,
      type: Sequelize.STRING,
    },
    isRisk: {
      allowNull: true,
      type: Sequelize.BOOLEAN,
    },
    scoringResult: {
      allowNull: true,
      type: Sequelize.JSON,
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
  await queryInterface.dropTable('questionnaire_submissions')
}
