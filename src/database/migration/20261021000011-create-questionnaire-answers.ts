'use strict'

import { DataTypes, QueryInterface } from 'sequelize'

/** @type {import('sequelize-cli').Migration} */
export async function up(
  queryInterface: QueryInterface,
  Sequelize: typeof DataTypes
) {
  await queryInterface.createTable('questionnaire_answers', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
    },
    answerValue: {
      allowNull: false,
      type: Sequelize.STRING,
    },
    answerLabel: {
      allowNull: true,
      type: Sequelize.STRING,
    },
    score: {
      allowNull: true,
      type: Sequelize.INTEGER,
    },
    QuestionnaireQuestionId: {
      allowNull: false,
      type: Sequelize.UUID,
      references: {
        model: 'questionnaire_questions',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    QuestionnaireSubmissionId: {
      allowNull: false,
      type: Sequelize.UUID,
      references: {
        model: 'questionnaire_submissions',
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
  await queryInterface.dropTable('questionnaire_answers')
}
