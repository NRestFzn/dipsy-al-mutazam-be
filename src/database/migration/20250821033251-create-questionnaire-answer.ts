'use strict'

import { DataTypes, QueryInterface } from 'sequelize'

/** @type {import('sequelize-cli').Migration} */
export async function up(
  queryInterface: QueryInterface,
  Sequelize: typeof DataTypes
) {
  await queryInterface.createTable('questionnaireAnswer', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
    },
    QuestionnaireSubmissionId: {
      allowNull: false,
      type: Sequelize.UUID,
      references: {
        model: 'questionnaireSubmission',
        key: 'id',
      },
      onUpdate: 'cascade',
      onDelete: 'cascade',
    },
    QuestionnaireQuestionId: {
      allowNull: false,
      type: Sequelize.UUID,
      references: {
        model: 'questionnaireQuestion',
        key: 'id',
      },
      onUpdate: 'cascade',
      onDelete: 'cascade',
    },
    answerValue: {
      allowNull: false,
      type: DataTypes.STRING,
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
  await queryInterface.dropTable('questionnaireAnswer')
}
