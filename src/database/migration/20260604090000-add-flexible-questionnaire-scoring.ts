'use strict'

import { DataTypes, QueryInterface } from 'sequelize'

export async function up(
  queryInterface: QueryInterface,
  Sequelize: typeof DataTypes
) {
  const transaction = await queryInterface.sequelize.transaction()

  try {
    await queryInterface.addColumn(
      'questionnaires',
      'scoringType',
      {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'binary_threshold',
      },
      { transaction }
    )

    await queryInterface.addColumn(
      'questionnaires',
      'scoringConfig',
      {
        type: Sequelize.JSON,
        allowNull: true,
      },
      { transaction }
    )

    await queryInterface.addColumn(
      'questionnaire_questions',
      'scoringCategory',
      {
        type: Sequelize.STRING,
        allowNull: true,
      },
      { transaction }
    )

    await queryInterface.addColumn(
      'questionnaire_questions',
      'scoreOverrides',
      {
        type: Sequelize.JSON,
        allowNull: true,
      },
      { transaction }
    )

    await queryInterface.addColumn(
      'questionnaire_answers',
      'answerLabel',
      {
        type: Sequelize.STRING,
        allowNull: true,
      },
      { transaction }
    )

    await queryInterface.addColumn(
      'questionnaire_answers',
      'score',
      {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      { transaction }
    )

    await queryInterface.addColumn(
      'questionnaire_submissions',
      'score',
      {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      { transaction }
    )

    await queryInterface.addColumn(
      'questionnaire_submissions',
      'resultKey',
      {
        type: Sequelize.STRING,
        allowNull: true,
      },
      { transaction }
    )

    await queryInterface.addColumn(
      'questionnaire_submissions',
      'resultLabel',
      {
        type: Sequelize.STRING,
        allowNull: true,
      },
      { transaction }
    )

    await queryInterface.addColumn(
      'questionnaire_submissions',
      'isRisk',
      {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      },
      { transaction }
    )

    await queryInterface.addColumn(
      'questionnaire_submissions',
      'scoringResult',
      {
        type: Sequelize.JSON,
        allowNull: true,
      },
      { transaction }
    )

    await transaction.commit()
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

export async function down(
  queryInterface: QueryInterface,
  Sequelize: typeof DataTypes
) {
  const transaction = await queryInterface.sequelize.transaction()

  try {
    await queryInterface.removeColumn(
      'questionnaire_submissions',
      'scoringResult',
      { transaction }
    )
    await queryInterface.removeColumn('questionnaire_submissions', 'isRisk', {
      transaction,
    })
    await queryInterface.removeColumn(
      'questionnaire_submissions',
      'resultLabel',
      { transaction }
    )
    await queryInterface.removeColumn(
      'questionnaire_submissions',
      'resultKey',
      { transaction }
    )
    await queryInterface.removeColumn('questionnaire_submissions', 'score', {
      transaction,
    })
    await queryInterface.removeColumn('questionnaire_answers', 'score', {
      transaction,
    })
    await queryInterface.removeColumn(
      'questionnaire_answers',
      'answerLabel',
      { transaction }
    )
    await queryInterface.removeColumn(
      'questionnaire_questions',
      'scoreOverrides',
      { transaction }
    )
    await queryInterface.removeColumn(
      'questionnaire_questions',
      'scoringCategory',
      { transaction }
    )
    await queryInterface.removeColumn('questionnaires', 'scoringConfig', {
      transaction,
    })
    await queryInterface.removeColumn('questionnaires', 'scoringType', {
      transaction,
    })

    await transaction.commit()
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}
