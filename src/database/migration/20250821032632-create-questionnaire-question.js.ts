'use strict'

import { DataTypes, QueryInterface } from 'sequelize'

/** @type {import('sequelize-cli').Migration} */
export async function up(
  queryInterface: QueryInterface,
  Sequelize: typeof DataTypes
) {
  await queryInterface.createTable('questionnaireQuestion', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
    },
    questionText: {
      allowNull: false,
      type: Sequelize.STRING,
    },
    questionType: {
      allowNull: false,
      type: Sequelize.STRING,
    },
    order: {
      allowNull: false,
      type: Sequelize.INTEGER,
    },
    status: {
      allowNull: false,
      type: Sequelize.ENUM('draft', 'publish'),
    },
    QuestionnaireId: {
      allowNull: false,
      type: Sequelize.UUID,
      references: {
        model: 'questionnaire',
        key: 'id',
      },
      onUpdate: 'cascade',
      onDelete: 'cascade',
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
  await queryInterface.dropTable('questionnaireQuestion')
}
