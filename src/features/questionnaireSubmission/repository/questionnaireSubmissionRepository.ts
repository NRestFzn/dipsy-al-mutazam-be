import { db, sequelize } from '@/database/databaseConnection'
import {
  CreateQuestionnaireSubmissionDto,
  IGetSummaryOptions,
  IGetSummaryOptionsByClass,
  IGetSummaryOptionsByGrade,
  IGetSummaryOptionsByStudent,
  ISummarize,
  ISummarizeByClassIdDetailed,
  ISummarizeByGradeId,
  ISummarizeByGradeIdDetailed,
  ISummarizeByQuestionnaireIdDetailed,
  ISummarizeByStudentIdDetailed,
  ISummarizePerGrade,
  ISummarizeStudentByClass,
  ISummarizeSubmission,
  ISummarizeSubmissionByUser,
  QuestionnaireSubmissionDto,
} from '../dto'
import { QuestionnaireRepository } from '../../questionnaire/repository/questionnaireRepository'
import { ErrorResponse } from '@/libs/http/ErrorResponse'
import QuestionnaireSubmission from '@/database/model/questionnaireSubmission'
import QuestionnaireAnswer from '@/database/model/questionnaireAnswer'
import QuestionnaireQuestion from '@/database/model/questionnaireQuestion'
import { QueryTypes } from 'sequelize'
import { GradeRepository } from '../../grade/repository/gradeRepository'
import { ClassRepository } from '../../class/repository/classRepository'
import { UserRepository } from '../../user/repository/userRepository'
import { Request } from 'express'
import { QuestionnaireSubmissionQueryRepository } from './questionnaireSubmissionQueryRepository'
import { UserLoginState } from '../../user/dto'
import User from '@/database/model/user'
import UserDetail from '@/database/model/userDetail'
import Grade from '@/database/model/grade'
import Class from '@/database/model/class'
import { MetaPaginationDto } from '@/routes/version1/response/metaData'
import Questionnaire from '@/database/model/questionnaire'
import { evaluateQuestionnaire } from '../../questionnaire/scoring'

const questionnaireRepository = new QuestionnaireRepository()
const gradeRepository = new GradeRepository()
const classRepository = new ClassRepository()
const userRepository = new UserRepository()

export class QuestionnaireSubmissionRepository {
  async getAllSubmissionByLoggedInUser(req: Request): Promise<{
    data: QuestionnaireSubmission[]
    meta: { pagination: MetaPaginationDto }
  }> {
    const user: UserLoginState = req.getState('userLoginState')

    const query = new QuestionnaireSubmissionQueryRepository(req)

    const data = await QuestionnaireSubmission.findAll({
      ...query.queryFilter(),
      include: [{ model: Questionnaire }, { model: User, as: 'submittedBy' }],
      where: { UserId: user.uid },
    })

    const dataCount = await QuestionnaireSubmission.count({
      where: { UserId: user.uid },
    })

    return {
      data,
      meta: {
        pagination: {
          page: query.page,
          pageSize: query.pageSize,
          pageCount: data.length,
          total: dataCount,
        },
      },
    }
  }

  async getAllSubmissionBySubmitter(req: Request): Promise<{
    data: QuestionnaireSubmission[]
    meta: { pagination: MetaPaginationDto }
  }> {
    const user: UserLoginState = req.getState('userLoginState')
    const query = new QuestionnaireSubmissionQueryRepository(req)

    const whereCondition: any = { SubmittedBy: user.uid }
    if (query.QuestionnaireId) {
      whereCondition.QuestionnaireId = query.QuestionnaireId
    }

    const data = await QuestionnaireSubmission.findAll({
      limit: query.limit,
      offset: query.offset,
      order: query.order,
      include: [
        { model: Questionnaire },
        { model: User, as: 'submittedBy' },
        { model: User, as: 'user' },
      ],
      where: whereCondition,
    })

    const dataCount = await QuestionnaireSubmission.count({
      where: whereCondition,
    })

    return {
      data,
      meta: {
        pagination: {
          page: query.page,
          pageSize: query.pageSize,
          pageCount: data.length,
          total: dataCount,
        },
      },
    }
  }

  async summarizeByQuestionnaireId(
    options: IGetSummaryOptions
  ): Promise<ISummarizeByQuestionnaireIdDetailed> {
    const { startDate, endDate } = options

    const questionnaire = await questionnaireRepository.getById(
      options.QuestionnaireId
    )

    const replacements: Record<string, any> = {
      QuestionnaireId: questionnaire.id,
    }

    let dateFilter = ''

    if (startDate && endDate) {
      dateFilter = 'AND DATE(qs.createdAt) BETWEEN :startDate AND :endDate'
      replacements.startDate = startDate
      replacements.endDate = endDate
    } else if (startDate) {
      dateFilter = 'AND DATE(qs.createdAt) >= :startDate'
      replacements.startDate = startDate
    } else if (endDate) {
      dateFilter = 'AND DATE(qs.createdAt) <= :endDate'
      replacements.endDate = endDate
    }

    const query = `
    WITH ClassCounts AS (SELECT GradeId, COUNT(id) AS totalClass FROM classes GROUP BY GradeId),

    LatestSubmissionsInRange AS (SELECT id, UserId, isRisk FROM
    ( SELECT qs.id, qs.UserId, qs.isRisk, ROW_NUMBER() OVER (PARTITION BY qs.UserId ORDER BY qs.createdAt DESC) AS rn
    FROM questionnaire_submissions qs WHERE qs.QuestionnaireId = :QuestionnaireId ${dateFilter}) t WHERE t.rn = 1),
    
    UnstableMentalScore AS (SELECT ls.UserId, ls.isRisk, SUM(CASE WHEN LOWER(COALESCE(qa.answerValue, '')) = 'true' THEN 1 ELSE 0 END)
    AS trueCount FROM LatestSubmissionsInRange ls
    JOIN questionnaire_answers qa ON qa.QuestionnaireSubmissionId = ls.id
    GROUP BY ls.UserId, ls.isRisk),
    
    UserMentalState AS (SELECT ud.UserId, ud.GradeId,
    CASE
      WHEN ds.trueCount IS NULL THEN NULL
      WHEN ds.isRisk IS NOT NULL THEN ds.isRisk
      WHEN ds.trueCount >= (SELECT riskThreshold FROM questionnaires WHERE id = :QuestionnaireId) THEN 1
      ELSE 0
    END AS healthStatus
    FROM user_details ud LEFT JOIN UnstableMentalScore ds ON ud.UserId = ds.UserId)
    
    SELECT g.name AS gradeName, g.id AS gradeId,
    g.name AS rwName, g.id AS rwId,
    CAST(COALESCE(cc.totalClass, 0) AS SIGNED) AS classCount,
    CAST(COALESCE(cc.totalClass, 0) AS SIGNED) AS rtCount,
    CAST(COUNT(ud.UserId) AS SIGNED) AS userCount,
    CAST(COUNT(ums.UserId) AS SIGNED) AS submitCount,
    CAST(SUM(CASE WHEN ums.healthStatus = 0 THEN 1 ELSE 0 END) AS SIGNED) AS stableMentalCount,
    CAST(SUM(CASE WHEN ums.healthStatus = 1 THEN 1 ELSE 0 END) AS SIGNED) AS unStableMentalCount,
    CAST(COALESCE((SUM(CASE WHEN ums.healthStatus = 1 THEN 1 ELSE 0 END) * 100) / NULLIF(COUNT(ums.UserId), 0), 0) AS UNSIGNED) AS unStableMentalPercentage
    FROM grades g
    LEFT JOIN user_details ud ON ud.GradeId = g.id
    LEFT JOIN (SELECT UserId, GradeId, healthStatus
    FROM UserMentalState
    WHERE healthStatus IS NOT NULL OR EXISTS (SELECT 1 FROM UnstableMentalScore WHERE UnstableMentalScore.UserId = UserMentalState.UserId)) ums ON ud.UserId = ums.UserId
    LEFT JOIN ClassCounts cc ON g.id = cc.GradeId
    GROUP BY g.id, g.name, cc.totalClass
    ORDER BY g.name;`

    const resultQuery = await sequelize.query<ISummarizePerGrade>(query, {
      replacements,
      type: QueryTypes.SELECT,
    })

    const summarize = resultQuery.reduce(
      (acc, curr) => {
        acc.userCount += curr.userCount ?? 0
        acc.submitCount += curr.submitCount ?? 0
        acc.stableMentalCount += curr.stableMentalCount ?? 0
        acc.unStableMentalCount += curr.unStableMentalCount ?? 0
        return acc
      },
      {
        userCount: 0,
        submitCount: 0,
        stableMentalCount: 0,
        unStableMentalCount: 0,
        unStableMentalPercentage: 0,
      }
    )

    summarize.unStableMentalPercentage =
      summarize.submitCount > 0
        ? Math.round(
            (summarize.unStableMentalCount * 100) / summarize.submitCount
          )
        : 0

    const perGrade: ISummarizePerGrade[] = resultQuery.map((row) => ({
      gradeId: row.gradeId,
      gradeName: row.gradeName,
      classCount: row.classCount,
      userCount: row.userCount,
      submitCount: row.submitCount,
      stableMentalCount: row.stableMentalCount,
      unStableMentalCount: row.unStableMentalCount,
      unStableMentalPercentage: row.unStableMentalPercentage,
      // Backward compatibility aliases
      rwId: row.gradeId,
      rwName: row.gradeName,
      rtCount: row.classCount,
    }))

    const data: ISummarizeByQuestionnaireIdDetailed = {
      summarize,
      perGrade,
      perRw: perGrade,
    }

    return data
  }

  async summarizeByGradeId(
    options: IGetSummaryOptionsByGrade
  ): Promise<ISummarizeByGradeIdDetailed> {
    const { startDate, endDate } = options
    const gradeId = options.GradeId || options.RukunWargaId!

    const questionnaire = await questionnaireRepository.getById(
      options.QuestionnaireId
    )

    const grade = await gradeRepository.getByPk(gradeId)

    const replacements: Record<string, any> = {
      QuestionnaireId: questionnaire.id,
      GradeId: grade.id,
    }

    let dateFilter = ''

    if (startDate && endDate) {
      dateFilter = 'AND DATE(qs.createdAt) BETWEEN :startDate AND :endDate'
      replacements.startDate = startDate
      replacements.endDate = endDate
    } else if (startDate) {
      dateFilter = 'AND DATE(qs.createdAt) >= :startDate'
      replacements.startDate = startDate
    } else if (endDate) {
      dateFilter = 'AND DATE(qs.createdAt) <= :endDate'
      replacements.endDate = endDate
    }

    const query = `
    WITH ClassUserCounts AS (
      SELECT
        c.id AS ClassId,
        c.GradeId,
        COUNT(ud.UserId) AS userCount
      FROM classes c
      LEFT JOIN user_details ud ON ud.ClassId = c.id
      WHERE c.GradeId = :GradeId
      GROUP BY c.id, c.GradeId
    ),
    
    LatestSubmissionsInRange AS (
      SELECT id, UserId, isRisk
      FROM (
        SELECT
          qs.id,
          qs.UserId,
          qs.isRisk,
          ROW_NUMBER() OVER (PARTITION BY qs.UserId ORDER BY qs.createdAt DESC) AS rn
        FROM questionnaire_submissions qs
        WHERE qs.QuestionnaireId = :QuestionnaireId
          ${dateFilter}
      ) t
      WHERE t.rn = 1
    ),

    UnstableMentalScore AS (
      SELECT
        ls.UserId,
        ls.isRisk,
        SUM(CASE WHEN LOWER(COALESCE(qa.answerValue, '')) = 'true' THEN 1 ELSE 0 END) AS trueCount
      FROM LatestSubmissionsInRange ls
      JOIN questionnaire_answers qa ON qa.QuestionnaireSubmissionId = ls.id
      GROUP BY ls.UserId, ls.isRisk
    ),

    UserMentalState AS (
      SELECT
        ud.UserId,
        ud.GradeId,
        ud.ClassId,
        CASE
          WHEN ds.trueCount IS NULL THEN NULL
          WHEN ds.isRisk IS NOT NULL THEN ds.isRisk
          WHEN ds.trueCount >= (SELECT riskThreshold FROM questionnaires WHERE id = :QuestionnaireId) THEN 1
          ELSE 0
        END AS healthStatus
      FROM user_details ud
      LEFT JOIN UnstableMentalScore ds ON ud.UserId = ds.UserId
    )

    SELECT
      c.name AS className, c.id AS classId,
      c.name AS rtName, c.id AS rtId,
      CAST(COALESCE(cuc.userCount, 0) AS SIGNED) AS userCount,
      CAST(COUNT(ums.UserId) AS SIGNED) AS submitCount,
      CAST(SUM(CASE WHEN ums.healthStatus = 0 THEN 1 ELSE 0 END) AS SIGNED) AS stableMentalCount,
      CAST(SUM(CASE WHEN ums.healthStatus = 1 THEN 1 ELSE 0 END) AS SIGNED) AS unStableMentalCount,
      CAST(
        COALESCE(
          (SUM(CASE WHEN ums.healthStatus = 1 THEN 1 ELSE 0 END) * 100)
          / NULLIF(COUNT(ums.UserId), 0),
          0
        ) AS UNSIGNED
      ) AS unStableMentalPercentage
    FROM classes c
    LEFT JOIN ClassUserCounts cuc ON cuc.ClassId = c.id
    LEFT JOIN (
      SELECT UserId, GradeId, ClassId, healthStatus
      FROM UserMentalState
      WHERE healthStatus IS NOT NULL OR EXISTS (
        SELECT 1 FROM UnstableMentalScore ds WHERE ds.UserId = UserMentalState.UserId
      )
    ) ums ON c.id = ums.ClassId
    WHERE c.GradeId = :GradeId
    GROUP BY c.id, c.name, cuc.userCount
    ORDER BY c.name;`

    const resultQuery = await sequelize.query<ISummarizeByGradeId>(query, {
      replacements,
      type: QueryTypes.SELECT,
    })

    const summarize = resultQuery.reduce(
      (acc, curr) => {
        acc.userCount += curr.userCount ?? 0
        acc.submitCount += curr.submitCount ?? 0
        acc.stableMentalCount += curr.stableMentalCount ?? 0
        acc.unStableMentalCount += curr.unStableMentalCount ?? 0
        return acc
      },
      {
        userCount: 0,
        submitCount: 0,
        stableMentalCount: 0,
        unStableMentalCount: 0,
        unStableMentalPercentage: 0,
      }
    )

    summarize.unStableMentalPercentage =
      summarize.submitCount > 0
        ? Math.round(
            (summarize.unStableMentalCount * 100) / summarize.submitCount
          )
        : 0

    const perClass: ISummarizeByGradeId[] = resultQuery.map((row) => ({
      classId: row.classId,
      className: row.className,
      userCount: row.userCount,
      submitCount: row.submitCount,
      stableMentalCount: row.stableMentalCount,
      unStableMentalCount: row.unStableMentalCount,
      unStableMentalPercentage: row.unStableMentalPercentage,
      // Backward compatibility aliases
      rtId: row.classId,
      rtName: row.className,
    }))

    const data: ISummarizeByGradeIdDetailed = {
      summarize,
      perClass,
      perRt: perClass,
    }

    return data
  }

  // Backward compatibility alias for summarizeByRwId
  async summarizeByRwId(
    options: IGetSummaryOptionsByGrade
  ): Promise<ISummarizeByGradeIdDetailed> {
    return this.summarizeByGradeId(options)
  }

  async summarizeByClassId(
    options: IGetSummaryOptionsByClass
  ): Promise<ISummarizeByClassIdDetailed> {
    const { startDate, endDate } = options
    const classId = options.ClassId || options.RukunTetanggaId!

    const questionnaire = await questionnaireRepository.getById(
      options.QuestionnaireId
    )

    const cls = await classRepository.getByPk(classId)

    const replacements: Record<string, any> = {
      QuestionnaireId: questionnaire.id,
      ClassId: cls.id,
    }

    let dateFilter = ''
    if (startDate && endDate) {
      dateFilter = 'AND DATE(qs.createdAt) BETWEEN :startDate AND :endDate'
      replacements.startDate = startDate
      replacements.endDate = endDate
    } else if (startDate) {
      dateFilter = 'AND DATE(qs.createdAt) >= :startDate'
      replacements.startDate = startDate
    } else if (endDate) {
      dateFilter = 'AND DATE(qs.createdAt) <= :endDate'
      replacements.endDate = endDate
    }

    const query = `
      WITH LatestSubmissionsInRange AS (
        SELECT
          qs.id,
          qs.UserId,
          qs.isRisk,
          qs.score,
          qs.resultKey,
          qs.resultLabel,
          qs.createdAt AS submissionDate,
          ROW_NUMBER() OVER (PARTITION BY qs.UserId ORDER BY qs.createdAt DESC) AS rn
        FROM questionnaire_submissions qs
        WHERE qs.QuestionnaireId = :QuestionnaireId
        ${dateFilter}
      ),

      UnstableMentalScore AS (
        SELECT ls.UserId, ls.submissionDate, ls.isRisk, ls.score, ls.resultKey, ls.resultLabel,
        SUM(CASE WHEN LOWER(COALESCE(qa.answerValue, '')) = 'true' THEN 1 ELSE 0 END) AS trueCount
        FROM LatestSubmissionsInRange ls
        JOIN questionnaire_answers qa ON qa.QuestionnaireSubmissionId = ls.id
        WHERE ls.rn = 1
        GROUP BY ls.UserId, ls.submissionDate, ls.isRisk, ls.score, ls.resultKey, ls.resultLabel
      ),

      UserMentalState AS (
        SELECT
          ud.id,
          u.id AS UserId,
          u.fullname,
          ud.nisn,
          ud.ClassId,
          ud.GradeId,
          ds.submissionDate AS lastSubmissionDate,
          ds.score,
          ds.resultKey,
          ds.resultLabel,
          CASE
            WHEN ds.isRisk IS NOT NULL THEN ds.isRisk
            WHEN ds.trueCount >= (SELECT riskThreshold FROM questionnaires WHERE id = :QuestionnaireId) THEN 1
            WHEN ds.trueCount IS NOT NULL THEN 0
            ELSE NULL
          END AS isMentalUnStable
        FROM user_details ud
        INNER JOIN users u ON ud.UserId = u.id
        LEFT JOIN UnstableMentalScore ds ON ds.UserId = ud.UserId
        WHERE ud.ClassId = :ClassId
      )

      SELECT
        um.UserId,
        um.fullname,
        um.nisn,
        um.lastSubmissionDate,
        um.isMentalUnStable,
        um.score,
        um.resultKey,
        um.resultLabel
      FROM UserMentalState um
      JOIN classes c ON um.ClassId = c.id
      WHERE c.id = :ClassId
      ORDER BY um.fullname;
    `

    const rows = await sequelize.query<ISummarizeStudentByClass>(query, {
      replacements,
      type: QueryTypes.SELECT,
    })

    const students: ISummarizeStudentByClass[] = rows.map((r) => ({
      UserId: r.UserId,
      fullname: r.fullname,
      nisn: r.nisn,
      lastSubmissionDate: r.lastSubmissionDate,
      isMentalUnStable: r.isMentalUnStable !== null ? !!r.isMentalUnStable : null,
      score: r.score !== undefined ? r.score : null,
      resultKey: r.resultKey || null,
      resultLabel: r.resultLabel || null,
    }))

    const submitCount = students.filter((u) => u.lastSubmissionDate).length
    const unStableMentalCount = students.filter((u) => u.isMentalUnStable === true).length
    const stableMentalCount = students.filter((u) => u.isMentalUnStable === false).length

    const summarize: ISummarize = {
      userCount: students.length,
      submitCount,
      stableMentalCount,
      unStableMentalCount,
      unStableMentalPercentage:
        submitCount > 0
          ? Math.round((unStableMentalCount * 100) / submitCount)
          : 0,
    }

    const data: ISummarizeByClassIdDetailed = {
      summarize,
      students,
      users: students,
    }

    return data
  }

  // Backward compatibility alias for summarizeByRtId
  async summarizeByRtId(
    options: IGetSummaryOptionsByClass
  ): Promise<ISummarizeByClassIdDetailed> {
    return this.summarizeByClassId(options)
  }

  async summarizeByStudentId(
    options: IGetSummaryOptionsByStudent
  ): Promise<ISummarizeByStudentIdDetailed> {
    const { startDate, endDate, UserId } = options

    const questionnaire = await questionnaireRepository.getById(
      options.QuestionnaireId
    )

    const studentUser = await User.findByPk(UserId, {
      include: [
        {
          model: UserDetail,
          include: [{ model: Grade }, { model: Class }],
        },
      ],
    })

    if (!studentUser) {
      throw new ErrorResponse.NotFound('user.notFound')
    }

    const replacements: Record<string, any> = {
      QuestionnaireId: questionnaire.id,
      UserId: studentUser.id,
    }

    let dateFilter = ''

    if (startDate && endDate) {
      dateFilter = 'AND DATE(qs.createdAt) BETWEEN :startDate AND :endDate'
      replacements.startDate = startDate
      replacements.endDate = endDate
    } else if (startDate) {
      dateFilter = 'AND DATE(qs.createdAt) >= :startDate'
      replacements.startDate = startDate
    } else if (endDate) {
      dateFilter = 'AND DATE(qs.createdAt) <= :endDate'
      replacements.endDate = endDate
    }

    const query = `
    WITH UserSubmissions AS (
      SELECT
        qs.id AS submissionId,
        qs.UserId,
        qs.createdAt AS submissionDate,
        qs.score,
        qs.resultKey,
        qs.resultLabel,
        qs.isRisk,
        qs.scoringResult
      FROM questionnaire_submissions qs
      WHERE qs.QuestionnaireId = :QuestionnaireId
        AND qs.UserId = :UserId
        ${dateFilter}
    ),

    AnswerCounts AS (
      SELECT
        us.submissionId,
        us.submissionDate,
        us.score,
        us.resultKey,
        us.resultLabel,
        us.isRisk,
        us.scoringResult,
        SUM(CASE WHEN LOWER(COALESCE(qa.answerValue, '')) = 'true' THEN 1 ELSE 0 END) AS trueCount
      FROM UserSubmissions us
      LEFT JOIN questionnaire_answers qa ON qa.QuestionnaireSubmissionId = us.submissionId
      GROUP BY us.submissionId, us.submissionDate, us.score, us.resultKey, us.resultLabel, us.isRisk, us.scoringResult
    )

    SELECT
      ac.submissionId,
      ac.submissionDate,
      COALESCE(ac.score, ac.trueCount) AS score,
      ac.trueCount,
      COALESCE(ac.resultKey, CASE WHEN ac.trueCount >= (SELECT riskThreshold FROM questionnaires WHERE id = :QuestionnaireId) THEN 'risk' ELSE 'stable' END) AS resultKey,
      COALESCE(ac.resultLabel, CASE WHEN ac.trueCount >= (SELECT riskThreshold FROM questionnaires WHERE id = :QuestionnaireId) THEN 'Berisiko' ELSE 'Stabil' END) AS resultLabel,
      CASE
        WHEN ac.isRisk IS NOT NULL THEN ac.isRisk
        WHEN ac.trueCount >= (SELECT riskThreshold FROM questionnaires WHERE id = :QuestionnaireId) THEN 1
        ELSE 0
      END AS isMentalUnStable,
      ac.scoringResult
    FROM AnswerCounts ac
    ORDER BY ac.submissionDate DESC;`

    const rawSubmissions = await sequelize.query<any>(query, {
      replacements,
      type: QueryTypes.SELECT,
    })

    const submissions: ISummarizeSubmissionByUser[] = rawSubmissions.map((s) => ({
      submissionId: s.submissionId,
      submissionDate: s.submissionDate,
      score: Number(s.score),
      resultKey: s.resultKey,
      resultLabel: s.resultLabel,
      isMentalUnStable: !!s.isMentalUnStable,
      scoringResult: typeof s.scoringResult === 'string' ? JSON.parse(s.scoringResult) : s.scoringResult,
    }))

    const submitCount = submissions.length
    const stableMentalCount = submissions.filter((s) => !s.isMentalUnStable).length
    const unStableMentalCount = submissions.filter((s) => s.isMentalUnStable).length
    const unStableMentalPercentage =
      submitCount > 0
        ? Math.round((unStableMentalCount * 100) / submitCount)
        : 0

    const data: ISummarizeByStudentIdDetailed = {
      UserId: studentUser.id,
      fullname: studentUser.fullname,
      nisn: studentUser.userDetail?.nisn || null,
      gradeName: studentUser.userDetail?.grade?.name || null,
      className: studentUser.userDetail?.class?.name || null,
      summarize: {
        submitCount,
        stableMentalCount,
        unStableMentalCount,
        unStableMentalPercentage,
      },
      submissions,
    }

    return data
  }

  // Backward compatibility alias for summarizeByUserId
  async summarizeByUserId(
    options: IGetSummaryOptionsByStudent
  ): Promise<ISummarizeByStudentIdDetailed> {
    return this.summarizeByStudentId(options)
  }

  async submissionDetail(id: string): Promise<ISummarizeSubmission> {
    const submission = await QuestionnaireSubmission.findByPk(id, {
      include: [
        {
          model: QuestionnaireAnswer,
          include: [{ model: QuestionnaireQuestion }],
        },
        { model: User, as: 'user' },
        { model: User, as: 'submittedBy' },
      ],
    })

    if (!submission) throw new ErrorResponse.NotFound('errors.notFound')

    const questionnaire = await questionnaireRepository.getByPk(
      submission?.QuestionnaireId
    )

    const trueCount = submission.questionnaireAnswer.filter(
      (e) => e.answerValue === 'true'
    ).length

    const falseCount = submission.questionnaireAnswer.filter(
      (e) => e.answerValue === 'false'
    ).length

    const answeredCount = submission.questionnaireAnswer.length
    const scoringResult =
      submission.scoringResult ??
      evaluateQuestionnaire({
        scoringType: questionnaire.scoringType,
        riskThreshold: questionnaire.riskThreshold,
        scoringConfig: questionnaire.scoringConfig,
        questions: submission.questionnaireAnswer.map(
          (answer) => answer.questionnaireQuestion
        ),
        answers: submission.questionnaireAnswer.map((answer) => ({
          QuestionId: answer.QuestionnaireQuestionId,
          answerValue: answer.answerValue,
        })),
      })

    const submissionToJson = submission.toJSON()

    const data: ISummarizeSubmission = {
      ...submissionToJson,
      trueCount,
      falseCount,
      answeredCount,
      score: submission.score ?? scoringResult.score,
      resultKey: submission.resultKey ?? scoringResult.resultKey,
      resultLabel: submission.resultLabel ?? scoringResult.resultLabel,
      isMentalUnstable: submission.isRisk ?? scoringResult.isRisk,
      scoringResult,
    }

    return data
  }

  async add(
    formData: CreateQuestionnaireSubmissionDto
  ): Promise<QuestionnaireSubmissionDto> {
    let submission: any

    const questionnaire = await questionnaireRepository.getByIdPublic(
      formData.QuestionnaireId
    )

    if (!questionnaire)
      throw new ErrorResponse.NotFound('questionnaire.notFound')

    if (formData.answers.length < questionnaire.questions.length) {
      throw new ErrorResponse.BadRequest('questionnaire.inCompleteAnswer')
    }

    if (formData.answers.length > questionnaire.questions.length) {
      throw new ErrorResponse.BadRequest('questionnaire.exceededAnswer')
    }

    const questionIds = new Set(
      questionnaire.questions.map((question) => question.id)
    )
    const submittedQuestionIds = formData.answers.map(
      (answer) => answer.QuestionId
    )

    if (new Set(submittedQuestionIds).size !== submittedQuestionIds.length) {
      throw new ErrorResponse.BadRequest('questionnaire.duplicateAnswer')
    }

    for (const answer of formData.answers) {
      if (!questionIds.has(answer.QuestionId)) {
        throw new ErrorResponse.BadRequest(
          'questionnaire.questionNotInQuestionnaire',
          { id: answer.QuestionId }
        )
      }

      if (
        questionnaire.scoringType === 'binary_threshold' &&
        !['true', 'false'].includes(answer.answerValue.toLowerCase())
      ) {
        throw new ErrorResponse.BadRequest('questionnaire.invalidAnswerOption', {
          id: answer.QuestionId,
        })
      }
    }

    const scoringResult = evaluateQuestionnaire({
      scoringType: questionnaire.scoringType,
      riskThreshold: questionnaire.riskThreshold,
      scoringConfig: questionnaire.scoringConfig,
      questions: questionnaire.questions,
      answers: formData.answers,
    })

    const evaluatedAnswerByQuestion = new Map(
      scoringResult.answers.map((answer) => [answer.QuestionId, answer])
    )

    await db.sequelize!.transaction(async (transaction) => {
      const bulkCreate = []

      const questionnaireSubmission = await QuestionnaireSubmission.create(
        {
          isAssisted: formData.isAssisted,
          SubmittedBy: formData.SubmittedBy,
          UserId: formData.UserId,
          QuestionnaireId: formData.QuestionnaireId,
          score: scoringResult.score,
          resultKey: scoringResult.resultKey,
          resultLabel: scoringResult.resultLabel,
          isRisk: scoringResult.isRisk,
          scoringResult,
        },
        { transaction }
      )

      for (const answer of formData.answers) {
        const evaluatedAnswer = evaluatedAnswerByQuestion.get(
          answer.QuestionId
        )!

        bulkCreate.push({
          answerValue: evaluatedAnswer.answerValue,
          answerLabel: evaluatedAnswer.answerLabel,
          score: evaluatedAnswer.score,
          QuestionnaireQuestionId: evaluatedAnswer.QuestionId,
          QuestionnaireSubmissionId: questionnaireSubmission.id,
        })
      }

      await QuestionnaireAnswer.bulkCreate(bulkCreate, { transaction })

      submission = questionnaireSubmission
    })

    return submission
  }
}
