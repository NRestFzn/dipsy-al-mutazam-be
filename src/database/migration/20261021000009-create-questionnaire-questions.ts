'use strict'

import { DataTypes, QueryInterface } from 'sequelize'

/** @type {import('sequelize-cli').Migration} */
export async function up(
  queryInterface: QueryInterface,
  Sequelize: typeof DataTypes
) {
  await queryInterface.createTable('questionnaire_questions', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
    },
    questionText: {
      allowNull: false,
      type: Sequelize.TEXT,
    },
    questionType: {
      allowNull: false,
      type: Sequelize.STRING,
    },
    status: {
      allowNull: false,
      type: Sequelize.ENUM('draft', 'publish'),
    },
    order: {
      allowNull: false,
      type: Sequelize.INTEGER,
    },
    scoringCategory: {
      allowNull: true,
      type: Sequelize.STRING,
    },
    scoreOverrides: {
      allowNull: true,
      type: Sequelize.JSON,
    },
    options: {
      allowNull: true,
      type: Sequelize.JSON,
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
  await queryInterface.dropTable('questionnaire_questions')
}
