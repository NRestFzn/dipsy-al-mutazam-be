'use strict'

import { DataTypes, QueryInterface } from 'sequelize'

module.exports = {
  up: async (queryInterface: QueryInterface, Sequelize: typeof DataTypes) => {
    const tables = [
      ['education', 'educations'],
      ['marriageStatus', 'marriage_statuses'],
      ['questionnaire', 'questionnaires'],
      ['questionnaireAnswer', 'questionnaire_answers'],
      ['questionnaireQuestion', 'questionnaire_questions'],
      ['questionnaireSubmission', 'questionnaire_submissions'],
      ['role', 'roles'],
      ['rukunTetangga', 'rukun_tetanggas'],
      ['rukunWarga', 'rukun_wargas'],
      ['salaryRange', 'salary_ranges'],
      ['user', 'users'],
      ['userDetail', 'user_details'],
    ]

    for (const [oldName, newName] of tables) {
      await queryInterface.renameTable(oldName, newName)
    }
  },

  down: async (queryInterface: QueryInterface, Sequelize: typeof DataTypes) => {
    const tables = [
      ['educations', 'education'],
      ['marriage_statuses', 'marriageStatus'],
      ['questionnaires', 'questionnaire'],
      ['questionnaire_answers', 'questionnaireAnswer'],
      ['questionnaire_questions', 'questionnaireQuestion'],
      ['questionnaire_submissions', 'questionnaireSubmission'],
      ['roles', 'role'],
      ['rukun_tetanggas', 'rukunTetangga'],
      ['rukun_wargas', 'rukunWarga'],
      ['salary_ranges', 'salaryRange'],
      ['users', 'user'],
      ['user_details', 'userDetail'],
    ]

    for (const [newName, oldName] of tables) {
      await queryInterface.renameTable(newName, oldName)
    }
  },
}
