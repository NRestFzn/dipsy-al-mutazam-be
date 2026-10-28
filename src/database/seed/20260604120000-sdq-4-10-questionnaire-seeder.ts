'use strict'

import { QuestionnaireScoringConfig } from '@/features/questionnaire/scoring'
import { DataTypes, QueryInterface } from 'sequelize'

const CATEGORY_ID = '63e419c7-a687-41b7-8606-f5f93511bb10'
const QUESTIONNAIRE_ID = '7a5975f9-0fda-4a81-912c-12a6fdfc3934'

const reverseScoreOverrides = {
  not_true: 2,
  somewhat_true: 1,
  certainly_true: 0,
}

const normalRange = (maxScore: number) => ({
  key: 'normal',
  label: 'Normal',
  minScore: 0,
  maxScore,
  isRisk: false,
})

const borderlineRange = (score: number) => ({
  key: 'borderline',
  label: 'Borderline',
  minScore: score,
  maxScore: score,
  isRisk: true,
  recommendation: 'Konseling',
})

const abnormalRange = (minScore: number, maxScore = 10) => ({
  key: 'abnormal',
  label: 'Abnormal',
  minScore,
  maxScore,
  isRisk: true,
  recommendation: 'Rujuk fasilitas kesehatan',
})

const scoringConfig: QuestionnaireScoringConfig = {
  answerOptions: [
    {
      value: 'not_true',
      label: 'Tidak Benar',
      score: 0,
    },
    {
      value: 'somewhat_true',
      label: 'Agak Benar',
      score: 1,
    },
    {
      value: 'certainly_true',
      label: 'Benar',
      score: 2,
    },
  ],
  categories: [
    {
      key: 'emotional',
      label: 'Gejala Emosional',
      includeInTotal: true,
      ranges: [normalRange(3), borderlineRange(4), abnormalRange(5)],
    },
    {
      key: 'conduct',
      label: 'Masalah Perilaku',
      includeInTotal: true,
      ranges: [normalRange(2), borderlineRange(3), abnormalRange(4)],
    },
    {
      key: 'hyperactivity',
      label: 'Hiperaktivitas',
      includeInTotal: true,
      ranges: [normalRange(5), borderlineRange(6), abnormalRange(7)],
    },
    {
      key: 'peer',
      label: 'Masalah Teman Sebaya',
      includeInTotal: true,
      ranges: [normalRange(2), borderlineRange(3), abnormalRange(4)],
    },
    {
      key: 'prosocial',
      label: 'Perilaku Prososial',
      includeInTotal: false,
      ranges: [
        {
          ...abnormalRange(0, 4),
          minScore: 0,
        },
        {
          ...borderlineRange(5),
          minScore: 5,
        },
        {
          ...normalRange(10),
          minScore: 6,
          maxScore: 10,
        },
      ],
    },
  ],
  total: {
    label: 'Total Kesulitan',
    ranges: [
      normalRange(13),
      {
        key: 'borderline',
        label: 'Borderline',
        minScore: 14,
        maxScore: 16,
        isRisk: true,
        recommendation: 'Konseling',
      },
      abnormalRange(17, 40),
    ],
  },
}

const questions = [
  {
    id: 'c9e6dfa9-9925-49ed-a2e0-4a424d7824fd',
    questionText: 'Dapat memperdulikan perasaan orang lain',
    scoringCategory: 'prosocial',
  },
  {
    id: 'fdcee9ab-7c96-4e53-96d9-c2d99abf0eba',
    questionText: 'Gelisah, terlalu aktif, tidak dapat diam untuk waktu lama',
    scoringCategory: 'hyperactivity',
  },
  {
    id: '223581ef-0b88-4cad-938d-aaf8cdbbcf84',
    questionText:
      'Sering mengeluh sakit kepala, sakit perut, atau sakit-sakit lainnya',
    scoringCategory: 'emotional',
  },
  {
    id: '371a6fed-e991-48a0-9612-e6e7fee66249',
    questionText:
      'Kalau mempunyai mainan, kesenangan, atau pensil, anak bersedia berbagi dengan anak-anak lain',
    scoringCategory: 'prosocial',
  },
  {
    id: '6957b6c8-6524-4ab8-a02b-b93377c53fb6',
    questionText: 'Sering sulit mengendalikan kemarahan',
    scoringCategory: 'conduct',
  },
  {
    id: 'a9deb3e4-adfe-4b06-81ad-857792fb5990',
    questionText: 'Cenderung menyendiri, lebih suka bermain seorang diri',
    scoringCategory: 'peer',
  },
  {
    id: '4017d0da-6208-4567-9f99-4036d6afd0f1',
    questionText:
      'Umumnya bertingkah laku baik, biasanya melakukan apa yang disuruh oleh orang dewasa',
    scoringCategory: 'conduct',
    reverseScore: true,
  },
  {
    id: 'b5848d7f-2ca9-4b77-8a78-fc7ccbd557c1',
    questionText: 'Banyak kekhawatiran atau sering tampak khawatir',
    scoringCategory: 'emotional',
  },
  {
    id: '07736136-5f8c-41a1-a04f-09731e72ed49',
    questionText:
      'Suka menolong jika seseorang terluka, kecewa, atau merasa sakit',
    scoringCategory: 'prosocial',
  },
  {
    id: '2655a6dd-891b-4246-bb2c-9eca363b47c1',
    questionText: 'Terus-menerus bergerak dengan resah atau menggeliat-geliat',
    scoringCategory: 'hyperactivity',
  },
  {
    id: 'eb25950f-667a-4064-a8e3-fe70bb4e7bc0',
    questionText: 'Mempunyai satu atau lebih teman baik',
    scoringCategory: 'peer',
    reverseScore: true,
  },
  {
    id: 'e7872f72-8294-4ef3-aa52-81c409f4ac01',
    questionText:
      'Sering berkelahi dengan anak-anak lain atau mengintimidasi mereka',
    scoringCategory: 'conduct',
  },
  {
    id: '1fbd55bb-ed28-4863-a6e4-6b3db9468c30',
    questionText: 'Sering merasa tidak bahagia, sedih, atau menangis',
    scoringCategory: 'emotional',
  },
  {
    id: '80045f69-8aa9-4d7e-a306-21f36e28aca7',
    questionText: 'Pada umumnya disukai oleh anak-anak lain',
    scoringCategory: 'peer',
    reverseScore: true,
  },
  {
    id: '708030eb-2fe7-4ff6-be5e-60e7293a6cdf',
    questionText: 'Mudah teralih perhatiannya, tidak dapat berkonsentrasi',
    scoringCategory: 'hyperactivity',
  },
  {
    id: 'ad9be028-5366-4aae-aad7-fe3dedb4c4aa',
    questionText:
      'Gugup atau sulit berpisah dengan orang tua atau pengasuhnya pada situasi baru, mudah kehilangan rasa percaya diri',
    scoringCategory: 'emotional',
  },
  {
    id: '778a5e3c-d982-48f0-be02-65c36a1849d9',
    questionText: 'Bersikap baik terhadap anak-anak yang lebih muda',
    scoringCategory: 'prosocial',
  },
  {
    id: '32da8f93-6cac-481c-9a10-ec5c56fd48b7',
    questionText: 'Sering berbohong atau berbuat curang',
    scoringCategory: 'conduct',
  },
  {
    id: '0263d070-7559-4e3b-b9f6-a6a9b73490ad',
    questionText:
      'Diganggu, dipermainkan, diintimidasi, atau diancam oleh anak-anak lain',
    scoringCategory: 'peer',
  },
  {
    id: '5d667e1a-0460-4e4b-a1ef-4c297a9b986c',
    questionText:
      'Sering menawarkan diri untuk membantu orang lain, seperti orang tua, guru, atau anak-anak lain',
    scoringCategory: 'prosocial',
  },
  {
    id: '4e2b646c-5b15-4380-83ea-42240dcb9d59',
    questionText:
      'Sebelum melakukan sesuatu, ia berpikir dahulu tentang akibatnya',
    scoringCategory: 'hyperactivity',
    reverseScore: true,
  },
  {
    id: 'e655b27a-9c33-42c5-b194-aa72f1879439',
    questionText: 'Mencuri dari rumah, sekolah, atau tempat lain',
    scoringCategory: 'conduct',
  },
  {
    id: 'e3baf4c8-8da0-42f6-8be6-ad0adfa075b1',
    questionText:
      'Lebih mudah berteman dengan orang dewasa daripada dengan anak-anak lain',
    scoringCategory: 'peer',
  },
  {
    id: '8ff46eeb-9507-465f-a77b-40e3746e245a',
    questionText: 'Banyak yang ditakuti, mudah menjadi takut',
    scoringCategory: 'emotional',
  },
  {
    id: 'e54c557a-b843-4725-ab89-b0eda1711d65',
    questionText:
      'Memiliki perhatian yang baik terhadap apa pun, mampu menyelesaikan tugas atau pekerjaan rumah sampai selesai',
    scoringCategory: 'hyperactivity',
    reverseScore: true,
  },
]

export async function up(
  queryInterface: QueryInterface,
  Sequelize: typeof DataTypes
) {
  const [existing]: any = await queryInterface.sequelize.query(
    `SELECT id FROM questionnaires WHERE id = '${QUESTIONNAIRE_ID}' LIMIT 1`
  )
  if (existing && existing.length > 0) {
    return
  }

  const transaction = await queryInterface.sequelize.transaction()
  const now = new Date()

  try {
    await queryInterface.bulkInsert(
      'questionnaire_categories',
      [
        {
          id: CATEGORY_ID,
          name: 'Anak 4-10 Tahun',
          createdAt: now,
          updatedAt: now,
        },
      ],
      { transaction }
    )

    await queryInterface.bulkInsert(
      'questionnaires',
      [
        {
          id: QUESTIONNAIRE_ID,
          title:
            'Strengths and Difficulties Questionnaire (SDQ) Usia 4-10 Tahun',
          description:
            'Skrining kekuatan dan kesulitan emosional serta perilaku anak usia 4-10 tahun. Bukan alat diagnosis klinis.',
          status: 'publish',
          riskThreshold: 0,
          cooldownInMinutes: 0,
          scoringType: 'weighted_score',
          scoringConfig: JSON.stringify(scoringConfig),
          CategoryId: CATEGORY_ID,
          createdAt: now,
          updatedAt: now,
        },
      ],
      { transaction }
    )

    const answerOptions = scoringConfig.answerOptions.map(
      (option) => option.label
    )

    await queryInterface.bulkInsert(
      'questionnaire_questions',
      questions.map((question, index) => ({
        id: question.id,
        questionText: question.questionText,
        questionType: 'radio',
        order: index + 1,
        status: 'publish',
        scoringCategory: question.scoringCategory,
        scoreOverrides: question.reverseScore
          ? JSON.stringify(reverseScoreOverrides)
          : null,
        options: JSON.stringify(answerOptions),
        QuestionnaireId: QUESTIONNAIRE_ID,
        createdAt: now,
        updatedAt: now,
      })),
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
    await queryInterface.bulkDelete(
      'questionnaire_questions',
      { QuestionnaireId: QUESTIONNAIRE_ID },
      { transaction }
    )
    await queryInterface.bulkDelete(
      'questionnaires',
      { id: QUESTIONNAIRE_ID },
      { transaction }
    )
    await queryInterface.bulkDelete(
      'questionnaire_categories',
      { id: CATEGORY_ID },
      { transaction }
    )

    await transaction.commit()
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}
