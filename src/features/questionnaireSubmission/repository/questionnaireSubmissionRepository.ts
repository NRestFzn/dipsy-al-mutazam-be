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
  ISummarizeSubmissionByStudent,
  QuestionnaireSubmissionDto,
} from '../dto'
import { QuestionnaireRepository } from '../../questionnaire/repository/questionnaireRepository'
import { ErrorResponse } from '@/libs/http/ErrorResponse'
import QuestionnaireSubmission from '@/database/model/questionnaireSubmission'
import UserDetail from '@/database/model/userDetail'
import { resolveCurrentAcademicYear } from '@/features/class/repository/classRepository'
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
import { MetaPaginationDto } from '@/routes/version1/response/metaData'
import Questionnaire from '@/database/model/questionnaire'
import StudentClassHistory from '@/database/model/studentClassHistory'
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
      where: {
        UserId: user.uid,
      },
      include: [
        {
          model: Questionnaire,
        },
      ],
    })

    const dataCount = await QuestionnaireSubmission.count({
      where: {
        UserId: user.uid,
      },
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

    const data = await QuestionnaireSubmission.findAll({
      ...query.queryFilter(),
      where: {
        SubmittedBy: user.uid,
      },
      include: [
        {
          model: Questionnaire,
        },
        {
          model: User,
          as: 'user',
        },
      ],
    })

    const dataCount = await QuestionnaireSubmission.count({
      where: {
        SubmittedBy: user.uid,
      },
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
    const { startDate, endDate, academicYear, assignedClassIds } = options

    const questionnaire = await questionnaireRepository.getById(
      options.QuestionnaireId
    )

    if (assignedClassIds !== undefined && assignedClassIds.length === 0) {
      return {
        hasAssignment: false,
        summarize: {
          userCount: 0,
          submitCount: 0,
          stableMentalCount: 0,
          unStableMentalCount: 0,
          unStableMentalPercentage: 0,
        },
        perGrade: [],
      }
    }

    const replacements: Record<string, any> = {
      QuestionnaireId: questionnaire.id,
    }

    if (academicYear) {
      replacements.academicYear = academicYear
    }

    const yearFilter = academicYear
      ? 'AND qs.academicYear = :academicYear'
      : ''

    if (assignedClassIds && assignedClassIds.length > 0) {
      replacements.assignedClassIds = assignedClassIds
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

    const historyCount = academicYear
      ? await StudentClassHistory.count({ where: { academicYear } })
      : 0
    const useHistory = Boolean(academicYear && historyCount > 0)

    const assignedClassFilterOnClasses =
      assignedClassIds && assignedClassIds.length > 0
        ? 'WHERE id IN (:assignedClassIds)'
        : ''

    const assignedClassFilterOnScope =
      assignedClassIds && assignedClassIds.length > 0
        ? 'AND sc.ClassId IN (:assignedClassIds)'
        : ''

    const userScopeCte = useHistory
      ? `UserScope AS (
          SELECT h.UserId, h.GradeId, h.ClassId
          FROM student_class_histories h
          WHERE h.academicYear = :academicYear ${assignedClassFilterOnScope.replace('sc.', 'h.')}
        ),`
      : `UserScope AS (
          SELECT ud.UserId, ud.GradeId, ud.ClassId
          FROM user_details ud
          WHERE ud.studentStatus = 'aktif' ${assignedClassFilterOnScope.replace('sc.', 'ud.')}
        ),`

    const assignedGradeFilter =
      assignedClassIds && assignedClassIds.length > 0
        ? 'WHERE g.id IN (SELECT DISTINCT GradeId FROM classes WHERE id IN (:assignedClassIds))'
        : ''

    const query = `
    WITH GradeClassCounts AS (SELECT GradeId, COUNT(id) AS totalClass FROM classes ${assignedClassFilterOnClasses} GROUP BY GradeId),
    ${userScopeCte}
    LatestSubmissionsInRange AS (SELECT id, UserId, isRisk FROM
    ( SELECT qs.id, qs.UserId, qs.isRisk, ROW_NUMBER() OVER (PARTITION BY qs.UserId ORDER BY qs.createdAt DESC) AS rn
    FROM questionnaire_submissions qs WHERE qs.QuestionnaireId = :QuestionnaireId ${dateFilter} ${yearFilter}) t WHERE t.rn = 1),
    
    UnstableMentalScore AS (SELECT ls.UserId, ls.isRisk, SUM(CASE WHEN LOWER(COALESCE(qa.answerValue, '')) = 'true' THEN 1 ELSE 0 END)
    AS trueCount FROM LatestSubmissionsInRange ls
    JOIN questionnaire_answers qa ON qa.QuestionnaireSubmissionId = ls.id
    GROUP BY ls.UserId, ls.isRisk),
    
    UserMentalState AS (SELECT sc.UserId, sc.GradeId,
    CASE
      WHEN ds.trueCount IS NULL THEN NULL
      WHEN ds.isRisk IS NOT NULL THEN ds.isRisk
      WHEN ds.trueCount >= (select riskThreshold FROM questionnaires where id = :QuestionnaireId) THEN 1
      ELSE 0
    END AS healthStatus
    FROM UserScope sc LEFT JOIN UnstableMentalScore ds ON sc.UserId = ds.UserId)
    
    SELECT g.name AS gradeName, g.id as gradeId, g.level as gradeLevel,
    CAST(COALESCE(gcc.totalClass, 0) AS SIGNED) AS classCount,
    CAST(COUNT(sc.UserId) AS SIGNED) AS userCount,
    CAST(COUNT(ums.UserId) AS SIGNED) AS submitCount,
    CAST(SUM(CASE WHEN ums.healthStatus = 0 THEN 1 ELSE 0 END) AS SIGNED) AS stableMentalCount,
    CAST(SUM(CASE WHEN ums.healthStatus = 1 THEN 1 ELSE 0 END) AS SIGNED) AS unStableMentalCount,
    CAST(COALESCE((SUM(CASE WHEN ums.healthStatus = 1 THEN 1 ELSE 0 END) * 100) / NULLIF(COUNT(ums.UserId), 0),0) AS UNSIGNED) AS unStableMentalPercentage
    FROM grades g
    LEFT JOIN UserScope sc ON sc.GradeId = g.id
    LEFT JOIN (SELECT UserId, GradeId, healthStatus
    FROM UserMentalState
    WHERE healthStatus IS NOT NULL OR EXISTS (SELECT 1 FROM UnstableMentalScore WHERE UnstableMentalScore.UserId = UserMentalState.UserId)) ums ON sc.UserId = ums.UserId
    LEFT JOIN GradeClassCounts gcc ON g.id = gcc.GradeId
    ${assignedGradeFilter}
    GROUP BY g.id, g.name, g.level, gcc.totalClass
    ORDER BY CASE UPPER(TRIM(REPLACE(g.name, 'KELAS ', '')))
      WHEN 'VII' THEN 7
      WHEN '7' THEN 7
      WHEN 'VIII' THEN 8
      WHEN '8' THEN 8
      WHEN 'IX' THEN 9
      WHEN '9' THEN 9
      WHEN 'X' THEN 10
      WHEN '10' THEN 10
      WHEN 'XI' THEN 11
      WHEN '11' THEN 11
      WHEN 'XII' THEN 12
      WHEN '12' THEN 12
      ELSE 99
    END ASC, g.name ASC;`

    const resultQuery = await sequelize.query<ISummarizePerGrade>(query, {
      replacements: {
        ...replacements,
      },
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

    const data: ISummarizeByQuestionnaireIdDetailed = {
      hasAssignment: true,
      summarize,
      perGrade: resultQuery.map((row) => ({
        gradeId: row.gradeId,
        gradeName: row.gradeName,
        gradeLevel: row.gradeLevel,
        classCount: row.classCount,
        userCount: row.userCount,
        submitCount: row.submitCount,
        stableMentalCount: row.stableMentalCount,
        unStableMentalCount: row.unStableMentalCount,
        unStableMentalPercentage: row.unStableMentalPercentage,
      })),
    }

    return data
  }

  async summarizeByGradeId(
    options: IGetSummaryOptionsByGrade
  ): Promise<ISummarizeByGradeIdDetailed> {
    const { startDate, endDate, academicYear, assignedClassIds } = options

    const questionnaire = await questionnaireRepository.getById(
      options.QuestionnaireId
    )

    const grade = await gradeRepository.getByPk(options.GradeId)

    if (assignedClassIds !== undefined && assignedClassIds.length === 0) {
      return {
        hasAssignment: false,
        summarize: {
          userCount: 0,
          submitCount: 0,
          stableMentalCount: 0,
          unStableMentalCount: 0,
          unStableMentalPercentage: 0,
        },
        perClass: [],
      }
    }

    const replacements: Record<string, any> = {
      QuestionnaireId: questionnaire.id,
      GradeId: grade.id,
    }

    if (academicYear) {
      replacements.academicYear = academicYear
    }

    const yearFilter = academicYear
      ? 'AND qs.academicYear = :academicYear'
      : ''

    if (assignedClassIds && assignedClassIds.length > 0) {
      replacements.assignedClassIds = assignedClassIds
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

    const historyCount = academicYear
      ? await StudentClassHistory.count({ where: { academicYear } })
      : 0
    const useHistory = Boolean(academicYear && historyCount > 0)

    const assignedClassFilter =
      assignedClassIds && assignedClassIds.length > 0
        ? 'AND c.id IN (:assignedClassIds)'
        : ''

    const assignedClassFilterOnScope =
      assignedClassIds && assignedClassIds.length > 0
        ? 'AND ClassId IN (:assignedClassIds)'
        : ''

    const userScopeCte = useHistory
      ? `UserScope AS (
          SELECT h.UserId, h.GradeId, h.ClassId
          FROM student_class_histories h
          WHERE h.academicYear = :academicYear ${assignedClassFilterOnScope}
        ),`
      : `UserScope AS (
          SELECT ud.UserId, ud.GradeId, ud.ClassId
          FROM user_details ud
          WHERE ud.studentStatus = 'aktif' ${assignedClassFilterOnScope}
        ),`

    const query = `
    WITH ${userScopeCte}
    ClassUserCounts AS (SELECT
      c.id AS ClassId,
      c.GradeId,
      COUNT(sc.UserId) AS userCount
    FROM classes c
    LEFT JOIN UserScope sc ON sc.ClassId = c.id
    WHERE c.GradeId = :GradeId ${assignedClassFilter}
    GROUP BY c.id, c.GradeId),
    
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
        ${dateFilter} ${yearFilter}
    ) t
    WHERE t.rn = 1),

    UnstableMentalScore AS (
    SELECT
      ls.UserId,
      ls.isRisk,
      SUM(CASE WHEN LOWER(COALESCE(qa.answerValue, '')) = 'true' THEN 1 ELSE 0 END) AS trueCount
    FROM LatestSubmissionsInRange ls
    JOIN questionnaire_answers qa ON qa.QuestionnaireSubmissionId = ls.id
    GROUP BY ls.UserId, ls.isRisk),

    UserMentalState AS (
    SELECT
      sc.UserId,
      sc.GradeId,
      sc.ClassId,
      CASE
        WHEN ds.trueCount IS NULL THEN NULL
        WHEN ds.isRisk IS NOT NULL THEN ds.isRisk
        WHEN ds.trueCount >= (select riskThreshold from questionnaires where id = :QuestionnaireId) THEN 1
        ELSE 0
      END AS healthStatus
    FROM UserScope sc
    LEFT JOIN UnstableMentalScore ds ON sc.UserId = ds.UserId)

    SELECT
    c.name AS className, c.id as classId,
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
    )) ums ON c.id = ums.ClassId
    WHERE c.GradeId = :GradeId ${assignedClassFilter}
    GROUP BY c.id, c.name, cuc.userCount
    ORDER BY c.name;`

    const resultQuery = await sequelize.query<ISummarizeByGradeId>(query, {
      replacements: {
        ...replacements,
      },
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

    const data: ISummarizeByGradeIdDetailed = {
      hasAssignment: true,
      summarize,
      perClass: resultQuery.map((row) => ({
        classId: row.classId,
        className: row.className,
        userCount: row.userCount,
        submitCount: row.submitCount,
        stableMentalCount: row.stableMentalCount,
        unStableMentalCount: row.unStableMentalCount,
        unStableMentalPercentage: row.unStableMentalPercentage,
      })),
    }

    return data
  }

  async summarizeByClassId(
    options: IGetSummaryOptionsByClass
  ): Promise<ISummarizeByClassIdDetailed> {
    const { startDate, endDate, academicYear, assignedClassIds } = options

    const questionnaire = await questionnaireRepository.getById(
      options.QuestionnaireId
    )

    const cls = await classRepository.getByPk(options.ClassId)

    if (
      assignedClassIds !== undefined &&
      (assignedClassIds.length === 0 || !assignedClassIds.includes(cls.id))
    ) {
      return {
        hasAssignment: false,
        summarize: {
          userCount: 0,
          submitCount: 0,
          stableMentalCount: 0,
          unStableMentalCount: 0,
          unStableMentalPercentage: 0,
        },
        students: [],
      }
    }

    const effectiveStartDate: any = startDate
    const effectiveEndDate: any = endDate

    const replacements: Record<string, any> = {
      QuestionnaireId: questionnaire.id,
      ClassId: cls.id,
    }

    if (academicYear) replacements.academicYear = academicYear

    const yearFilter = academicYear
      ? 'AND qs.academicYear = :academicYear'
      : ''

    let dateFilter = ''
    if (effectiveStartDate && effectiveEndDate) {
      dateFilter = 'AND DATE(qs.createdAt) BETWEEN :startDate AND :endDate'
      replacements.startDate = effectiveStartDate
      replacements.endDate = effectiveEndDate
    } else if (effectiveStartDate) {
      dateFilter = 'AND DATE(qs.createdAt) >= :startDate'
      replacements.startDate = effectiveStartDate
    } else if (effectiveEndDate) {
      dateFilter = 'AND DATE(qs.createdAt) <= :endDate'
      replacements.endDate = effectiveEndDate
    }

    const historyCount = academicYear
      ? await StudentClassHistory.count({ where: { academicYear } })
      : 0
    const useHistory = Boolean(academicYear && historyCount > 0)

    const scopeCte = useHistory
      ? `UserScope AS (
          SELECT h.UserId, h.ClassId
          FROM student_class_histories h
          WHERE h.academicYear = :academicYear
        ),
      `
      : `UserScope AS (
          SELECT ud.UserId, ud.ClassId
          FROM user_details ud
          WHERE ud.studentStatus = 'aktif'
        ),
      `

    const query = `
      WITH ${scopeCte}LatestSubmissionsInRange AS (
        SELECT
          qs.id,
          qs.UserId,
          qs.isRisk,
          qs.createdAt AS submissionDate,
          ROW_NUMBER() OVER (PARTITION BY qs.UserId ORDER BY qs.createdAt DESC) AS rn
        FROM questionnaire_submissions qs
        WHERE qs.QuestionnaireId = :QuestionnaireId
        ${dateFilter} ${yearFilter}
      ),

      UnstableMentalScore AS (
        SELECT ls.UserId, ls.submissionDate, ls.isRisk,
        SUM(CASE WHEN LOWER(COALESCE(qa.answerValue, '')) = 'true' THEN 1 ELSE 0 END) AS trueCount
        FROM LatestSubmissionsInRange ls
        JOIN questionnaire_answers qa ON qa.QuestionnaireSubmissionId = ls.id
        WHERE ls.rn = 1
        GROUP BY ls.UserId, ls.submissionDate, ls.isRisk
      ),

      UserMentalState AS (
        SELECT
          u.id as UserId,
          u.fullname,
          sc.ClassId,
          ds.submissionDate AS lastSubmissionDate,
          CASE
            WHEN ds.UserId IS NULL THEN 0
            WHEN ds.isRisk IS NOT NULL THEN ds.isRisk
            WHEN ds.trueCount >= (select riskThreshold from questionnaires where id = :QuestionnaireId) THEN 1
            ELSE 0
          END AS isMentalUnStable
        FROM UserScope sc
        INNER JOIN users u on sc.UserId = u.id
        LEFT JOIN UnstableMentalScore ds ON ds.UserId = sc.UserId
      )

      SELECT
        um.UserId,
        um.fullname,
        um.lastSubmissionDate,
        um.isMentalUnStable
      FROM UserMentalState um
      JOIN classes c ON um.ClassId = c.id
      WHERE c.id = :ClassId
      ORDER BY c.name, um.fullname;
    `

    const rows = await sequelize.query<ISummarizeStudentByClass>(query, {
      replacements,
      type: QueryTypes.SELECT,
    })

    const students = rows.map((r) => ({
      UserId: r.UserId,
      fullname: r.fullname,
      lastSubmissionDate: r.lastSubmissionDate,
      isMentalUnStable: r.lastSubmissionDate ? !!r.isMentalUnStable : null,
    }))

    const submitCount = students.filter((u) => u.lastSubmissionDate).length

    const unStableMentalCount = students.filter(
      (u) => u.lastSubmissionDate && u.isMentalUnStable
    ).length

    const stableMentalCount = submitCount - unStableMentalCount

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
      hasAssignment: true,
      summarize,
      students,
    }

    return data
  }

  async summarizeByUserId(
    options: IGetSummaryOptionsByStudent
  ): Promise<ISummarizeByStudentIdDetailed> {
    const { startDate, endDate, academicYear, includeAllYears } = options

    const questionnaire = await questionnaireRepository.getById(
      options.QuestionnaireId
    )

    const user = await userRepository.getById(options.UserId)

    const replacements: Record<string, any> = {
      QuestionnaireId: questionnaire.id,
      UserId: user.id,
    }

    const yearFilter =
      academicYear && !includeAllYears
        ? 'AND qs.academicYear = :academicYear'
        : ''

    if (yearFilter) replacements.academicYear = academicYear

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
      qs.isRisk
    FROM questionnaire_submissions qs
    JOIN user_details ud ON ud.UserId = qs.UserId
    WHERE qs.QuestionnaireId = :QuestionnaireId
      AND ud.UserId = :UserId
      ${dateFilter} ${yearFilter}),

    AnswerCounts AS (
    SELECT
      us.submissionId,
      us.submissionDate,
      us.score,
      us.resultKey,
      us.resultLabel,
      us.isRisk,
      SUM(CASE WHEN LOWER(COALESCE(qa.answerValue, '')) = 'true' THEN 1 ELSE 0 END) AS trueCount
    FROM UserSubmissions us
    JOIN questionnaire_answers qa ON qa.QuestionnaireSubmissionId = us.submissionId
    GROUP BY us.submissionId, us.submissionDate, us.score, us.resultKey, us.resultLabel, us.isRisk)

    SELECT
      ac.submissionId,
      ac.submissionDate,
      COALESCE(ac.score, ac.trueCount) AS score,
      ac.trueCount,
      COALESCE(ac.resultKey, CASE WHEN ac.trueCount >= (select riskThreshold from questionnaires where id = :QuestionnaireId) THEN 'risk' ELSE 'stable' END) AS resultKey,
      COALESCE(ac.resultLabel, CASE WHEN ac.trueCount >= (select riskThreshold from questionnaires where id = :QuestionnaireId) THEN 'Berisiko' ELSE 'Stabil' END) AS resultLabel,
    CASE
      WHEN ac.isRisk IS NOT NULL THEN ac.isRisk
      WHEN ac.trueCount >= (select riskThreshold from questionnaires where id = :QuestionnaireId) THEN 1
      ELSE 0
    END AS isMentalUnStable
    FROM AnswerCounts ac
    ORDER BY ac.submissionDate DESC;`

    const submissions = await sequelize.query<ISummarizeSubmissionByStudent>(
      query,
      {
        replacements,
        type: QueryTypes.SELECT,
      }
    )

    const submitCount = submissions.length

    const stableMentalCount = submissions.filter(
      (s) => !s.isMentalUnStable
    ).length

    const unStableMentalCount = submissions.filter(
      (s) => s.isMentalUnStable
    ).length

    const unStableMentalPercentage =
      submitCount > 0
        ? Math.round((unStableMentalCount * 100) / submitCount)
        : 0

    const data: ISummarizeByStudentIdDetailed = {
      UserId: user.id,
      fullname: user.fullname,
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
        throw new ErrorResponse.BadRequest(
          'questionnaire.invalidAnswerOption',
          {
            id: answer.QuestionId,
          }
        )
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

    const studentDetail = await UserDetail.findOne({
      where: { UserId: formData.UserId },
    })

    const academicYear =
      studentDetail?.academicYear || (await resolveCurrentAcademicYear())

    await db.sequelize!.transaction(async (transaction) => {
      const bulkCreate = []

      const questionnaireSubmission = await QuestionnaireSubmission.create(
        {
          isAssisted: formData.isAssisted,
          SubmittedBy: formData.SubmittedBy,
          UserId: formData.UserId,
          QuestionnaireId: formData.QuestionnaireId,
          academicYear,
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
