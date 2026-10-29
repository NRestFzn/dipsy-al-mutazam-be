'use strict'

import { DataTypes, QueryInterface } from 'sequelize'

/** @type {import('sequelize-cli').Migration} */
export async function up(
  queryInterface: QueryInterface,
  Sequelize: typeof DataTypes
) {
  const transaction = await queryInterface.sequelize.transaction()

  try {
    const [columns]: any = await queryInterface.sequelize.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'questionnaire_submissions' AND COLUMN_NAME = 'academicYear'`,
      { transaction }
    )

    if (columns.length === 0) {
      await queryInterface.addColumn(
        'questionnaire_submissions',
        'academicYear',
        { type: Sequelize.STRING, allowNull: true },
        { transaction }
      )
    }

    await queryInterface.sequelize.query(
      `UPDATE questionnaire_submissions
       SET academicYear = CONCAT(
         CASE WHEN MONTH(createdAt) >= 7 THEN YEAR(createdAt) ELSE YEAR(createdAt) - 1 END,
         '/',
         CASE WHEN MONTH(createdAt) >= 7 THEN YEAR(createdAt) + 1 ELSE YEAR(createdAt) END
       )
       WHERE academicYear IS NULL`,
      { transaction }
    )

    const [indexes]: any = await queryInterface.sequelize.query(
      `SELECT INDEX_NAME FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'questionnaire_submissions' AND INDEX_NAME = 'submissions_year_questionnaire'`,
      { transaction }
    )

    if (indexes.length === 0) {
      await queryInterface.addIndex(
        'questionnaire_submissions',
        ['academicYear', 'QuestionnaireId'],
        { name: 'submissions_year_questionnaire', transaction }
      )
    }

    await transaction.commit()
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

export async function down(
  queryInterface: QueryInterface,
  _Sequelize: typeof DataTypes
) {
  await queryInterface.removeIndex(
    'questionnaire_submissions',
    'submissions_year_questionnaire'
  )
  await queryInterface.removeColumn(
    'questionnaire_submissions',
    'academicYear'
  )
}
