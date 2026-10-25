'use strict'

import _ from 'lodash'
import { DataTypes, QueryInterface } from 'sequelize'
import { v4 } from 'uuid'

/** @type {import('sequelize-cli').Migration} */
export async function up(
  queryInterface: QueryInterface,
  Sequelize: typeof DataTypes
) {
  const questionnaireId = v4()
  const questionnaireCategoryId = v4()

  const questions = [
    'Apakah Anda sering merasa sakit kepala?',
    'Apakah Anda kehilangan nafsu makan?',
    'Apakah tidur Anda tidak nyenyak?',
    'Apakah Anda mudah merasa takut?',
    'Apakah Anda merasa cemas, tegang, atau khawatir?',
    'Apakah tangan Anda gemetar?',
    'Apakah Anda mengalami gangguan pencernaan?',
    'Apakah Anda merasa sulit berpikir jernih?',
    'Apakah Anda merasa tidak bahagia?',
    'Apakah Anda lebih sering menangis?',
    'Apakah Anda merasa sulit untuk menikmati aktivitas sehari-hari?',
    'Apakah Anda mengalami kesulitan untuk mengambil keputusan?',
    'Apakah aktivitas/tugas sehari-hari Anda terbengkalai?',
    'Apakah Anda merasa tidak mampu berperan dalam kehidupan ini?',
    'Apakah Anda kehilangan minat terhadap banyak hal?',
    'Apakah Anda merasa tidak berharga?',
    'Apakah Anda mempunyai pikiran untuk mengakhiri hidup Anda?',
    'Apakah Anda merasa lelah sepanjang waktu?',
    'Apakah Anda merasa tidak enak di perut?',
    'Apakah Anda mudah lelah?',
  ]

  const questionnaireQuestionFormData = []

  for (let i = 0; i < questions.length; i++) {
    questionnaireQuestionFormData.push({
      id: v4(),
      questionText: questions[i],
      questionType: 'radio',
      order: i + 1,
      status: 'publish',
      options: JSON.stringify(['Ya', 'Tidak']),
      QuestionnaireId: questionnaireId,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  }

  await queryInterface.bulkInsert('questionnaire_categories', [
    {
      id: questionnaireCategoryId,
      name: 'Dewasa',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ])

  await queryInterface.bulkInsert('questionnaires', [
    {
      id: questionnaireId,
      title: 'Self-Reporting Questionnaire',
      description: 'lorem ipsum dolor sit amet',
      status: 'publish',
      riskThreshold: 6,
      CategoryId: questionnaireCategoryId,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ])
  await queryInterface.bulkInsert(
    'questionnaire_questions',
    questionnaireQuestionFormData
  )
}

export async function down(
  queryInterface: QueryInterface,
  Sequelize: typeof DataTypes
) {
  await queryInterface.bulkDelete('questionnaires', {})
  await queryInterface.bulkDelete('questionnaire_questions', {})
}
