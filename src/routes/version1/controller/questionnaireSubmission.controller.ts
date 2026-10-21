import { QuestionnaireSubmissionRepository } from '@/features/questionnaireSubmission/repository/questionnaireSubmissionRepository'
import authorization from '@/middleware/authorization'
import express, { Response, Request } from 'express'
import HttpResponse from '@/libs/http/HttpResponse'
import {
  createQuestionnaireSubmissionSchema,
  submissionParams,
  SubmissionParams,
  SummarizeByQuestionnaireIdParams,
  SummarizeByQuestionnaireIdQuery,
  summarizeByClassIdQuery,
  SummarizeByClassIdQuery,
  summarizeByGradeIdQuery,
  SummarizeByGradeIdQuery,
  summarizeByStudentIdQuery,
  SummarizeByStudentIdQuery,
} from '@/features/questionnaireSubmission/schema'
import asyncHandler from '@/helper/asyncHandler'
import _ from 'lodash'
import {
  CreateQuestionnaireSubmissionDto,
  IGetSummaryOptions,
  IGetSummaryOptionsByClass,
  IGetSummaryOptionsByGrade,
  IGetSummaryOptionsByStudent,
} from '@/features/questionnaireSubmission/dto'
import User from '@/database/model/user'
import UserDetail from '@/database/model/userDetail'
import Class from '@/database/model/class'
import { ErrorResponse } from '@/libs/http/ErrorResponse'
import { RoleId } from '@/libs/constant/roleIds'
import { UserLoginState } from '@/features/user/dto'
import { permissionAccess } from '@/middleware/permissionAccess'

const repository = new QuestionnaireSubmissionRepository()

const route = express.Router()

/**
 * GET /v1/questionnaire-submission/history-me
 * Riwayat seluruh kuesioner yang telah diselesaikan oleh siswa yang sedang login.
 * Hak Akses: Siswa
 */
route.get(
  '/history-me',
  authorization(),
  permissionAccess([RoleId.siswa]),
  asyncHandler(async (req: Request, res: Response) => {
    const data = await repository.getAllSubmissionByLoggedInUser(req)

    const httpResponse = HttpResponse.get({
      message: req.t.success.retrieved,
      ...data,
    })

    res.status(httpResponse.statusCode).json(httpResponse)
  })
)

/**
 * GET /v1/questionnaire-submission/history-submitted
 * Riwayat kuesioner yang disubmit oleh pengguna
 */
route.get(
  '/history-submitted',
  authorization(),
  asyncHandler(async (req: Request, res: Response) => {
    const data = await repository.getAllSubmissionBySubmitter(req)

    const httpResponse = HttpResponse.get({
      message: req.t.success.retrieved,
      ...data,
    })

    res.status(httpResponse.statusCode).json(httpResponse)
  })
)

/**
 * GET /v1/questionnaire-submission/summary/:QuestionnaireId
 * Ringkasan statistik kuesioner seluruh sekolah.
 * Hak Akses: Guru BK
 */
route.get(
  '/summary/:QuestionnaireId',
  authorization(),
  permissionAccess([RoleId.gurubk]),
  asyncHandler(async (req: Request, res: Response) => {
    const params: SummarizeByQuestionnaireIdParams = req.getParams()
    const query: SummarizeByQuestionnaireIdQuery = req.query

    const options: IGetSummaryOptions = {
      QuestionnaireId: params.QuestionnaireId,
      ...query,
    }

    const data = await repository.summarizeByQuestionnaireId(options)

    const httpResponse = HttpResponse.get({
      message: req.t.success.retrieved,
      data,
    })

    res.status(httpResponse.statusCode).json(httpResponse)
  })
)

/**
 * GET /v1/questionnaire-submission/summary-grade/:QuestionnaireId
 * (Alias: /summary-rw/:QuestionnaireId)
 * Agregat hasil per Tingkat/Jenjang.
 * Hak Akses: Guru BK
 */
const handleSummaryGrade = asyncHandler(async (req: Request, res: Response) => {
  const params: SummarizeByQuestionnaireIdParams = req.getParams()
  const query: SummarizeByGradeIdQuery = summarizeByGradeIdQuery.validateSync(
    req.query
  )

  const gradeId = query.GradeId || query.RukunWargaId
  if (!gradeId) {
    throw new ErrorResponse.BadRequest('GradeId wajib diisi')
  }

  const options: IGetSummaryOptionsByGrade = {
    QuestionnaireId: params.QuestionnaireId,
    GradeId: gradeId,
    startDate: query.startDate,
    endDate: query.endDate,
  }

  const data = await repository.summarizeByGradeId(options)

  const httpResponse = HttpResponse.get({
    message: req.t.success.retrieved,
    data,
  })

  res.status(httpResponse.statusCode).json(httpResponse)
})

route.get(
  '/summary-grade/:QuestionnaireId',
  authorization(),
  permissionAccess([RoleId.gurubk]),
  handleSummaryGrade
)

route.get(
  '/summary-rw/:QuestionnaireId',
  authorization(),
  permissionAccess([RoleId.gurubk]),
  handleSummaryGrade
)

/**
 * GET /v1/questionnaire-submission/summary-class/:QuestionnaireId
 * (Alias: /summary-rt/:QuestionnaireId)
 * Agregat hasil per Kelas. Wali kelas otomatis difilter hanya untuk kelas binaannya.
 * Hak Akses: Guru BK, Wali Kelas
 */
const handleSummaryClass = asyncHandler(async (req: Request, res: Response) => {
  const params: SummarizeByQuestionnaireIdParams = req.getParams()
  const user = req.getState('userLoginState') as UserLoginState
  const query: SummarizeByClassIdQuery = summarizeByClassIdQuery.validateSync(
    req.query
  )

  let classId = query.ClassId || query.RukunTetanggaId
  let gradeId = query.GradeId || query.RukunWargaId

  const isWaliKelas =
    user.RoleIds.includes(RoleId.walikelas) &&
    !user.RoleIds.includes(RoleId.gurubk)

  if (isWaliKelas) {
    const homeroomClass = await Class.findOne({
      where: { homeroomTeacherId: user.uid },
    })

    if (!homeroomClass) {
      throw new ErrorResponse.Forbidden(
        'Anda belum ditugaskan sebagai wali kelas untuk kelas manapun'
      )
    }

    if (classId && classId !== homeroomClass.id) {
      throw new ErrorResponse.Forbidden(
        'Anda tidak memiliki akses untuk melihat rekapitulasi kelas lain'
      )
    }

    classId = homeroomClass.id
    gradeId = homeroomClass.GradeId
  }

  if (!classId) {
    throw new ErrorResponse.BadRequest('ClassId wajib diisi')
  }

  const options: IGetSummaryOptionsByClass = {
    QuestionnaireId: params.QuestionnaireId,
    ClassId: classId,
    GradeId: gradeId || '',
    startDate: query.startDate,
    endDate: query.endDate,
  }

  const data = await repository.summarizeByClassId(options)

  const httpResponse = HttpResponse.get({
    message: req.t.success.retrieved,
    data,
  })

  res.status(httpResponse.statusCode).json(httpResponse)
})

route.get(
  '/summary-class/:QuestionnaireId',
  authorization(),
  permissionAccess([RoleId.gurubk, RoleId.walikelas]),
  handleSummaryClass
)

route.get(
  '/summary-rt/:QuestionnaireId',
  authorization(),
  permissionAccess([RoleId.gurubk, RoleId.walikelas]),
  handleSummaryClass
)

/**
 * GET /v1/questionnaire-submission/summary-student/:QuestionnaireId
 * (Alias: /summary-user/:QuestionnaireId)
 * Rincian hasil individual siswa (skor total, skor subskala SDQ, status).
 * Hak Akses: Guru BK, Wali Kelas
 */
const handleSummaryStudent = asyncHandler(
  async (req: Request, res: Response) => {
    const params: SummarizeByQuestionnaireIdParams = req.getParams()
    const user = req.getState('userLoginState') as UserLoginState
    const query: SummarizeByStudentIdQuery =
      summarizeByStudentIdQuery.validateSync(req.query)

    const targetUserId = query.UserId || query.StudentId
    if (!targetUserId) {
      throw new ErrorResponse.BadRequest('UserId wajib diisi')
    }

    const isWaliKelas =
      user.RoleIds.includes(RoleId.walikelas) &&
      !user.RoleIds.includes(RoleId.gurubk)

    if (isWaliKelas) {
      const homeroomClass = await Class.findOne({
        where: { homeroomTeacherId: user.uid },
      })

      if (!homeroomClass) {
        throw new ErrorResponse.Forbidden(
          'Anda belum ditugaskan sebagai wali kelas untuk kelas manapun'
        )
      }

      const studentDetail = await UserDetail.findOne({
        where: { UserId: targetUserId },
      })

      if (!studentDetail || studentDetail.ClassId !== homeroomClass.id) {
        throw new ErrorResponse.Forbidden(
          'Anda hanya dapat melihat data siswa di kelas binaan Anda'
        )
      }
    }

    const options: IGetSummaryOptionsByStudent = {
      QuestionnaireId: params.QuestionnaireId,
      UserId: targetUserId,
      ClassId: query.ClassId || '',
      GradeId: query.GradeId || '',
      startDate: query.startDate,
      endDate: query.endDate,
    }

    const data = await repository.summarizeByStudentId(options)

    const httpResponse = HttpResponse.get({
      message: req.t.success.retrieved,
      data,
    })

    res.status(httpResponse.statusCode).json(httpResponse)
  }
)

route.get(
  '/summary-student/:QuestionnaireId',
  authorization(),
  permissionAccess([RoleId.gurubk, RoleId.walikelas]),
  handleSummaryStudent
)

route.get(
  '/summary-user/:QuestionnaireId',
  authorization(),
  permissionAccess([RoleId.gurubk, RoleId.walikelas]),
  handleSummaryStudent
)

/**
 * GET /v1/questionnaire-submission/summary-me/:QuestionnaireId
 * Ringkasan hasil kuesioner milik siswa yang sedang login.
 * Hak Akses: Siswa
 */
route.get(
  '/summary-me/:QuestionnaireId',
  authorization(),
  permissionAccess([RoleId.siswa]),
  asyncHandler(async (req: Request, res: Response) => {
    const params: SummarizeByQuestionnaireIdParams = req.getParams()
    const user = req.getState('userLoginState') as UserLoginState

    const options: IGetSummaryOptionsByStudent = {
      QuestionnaireId: params.QuestionnaireId,
      UserId: user.uid,
      ClassId: '',
      GradeId: '',
      startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
      endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
    }

    const data = await repository.summarizeByStudentId(options)

    const httpResponse = HttpResponse.get({
      message: req.t.success.retrieved,
      data,
    })

    res.status(httpResponse.statusCode).json(httpResponse)
  })
)

/**
 * GET /v1/questionnaire-submission/:id/detail
 * Detail satu submission kuesioner
 */
route.get(
  '/:id/detail',
  authorization(),
  asyncHandler(async (req: Request, res: Response) => {
    const params: SubmissionParams = submissionParams.validateSync(req.params)

    const data = await repository.submissionDetail(params.id)

    const httpResponse = HttpResponse.get({
      message: req.t.success.retrieved,
      data,
    })

    res.status(httpResponse.statusCode).json(httpResponse)
  })
)

/**
 * POST /v1/questionnaire-submission/:questionnaireId/submit
 * POST /v1/questionnaire-submission
 * Submit kuesioner secara mandiri (Siswa) atau dibantu (Guru BK / Wali Kelas)
 * Hak Akses: Siswa, Guru BK, Wali Kelas
 */
const handleSubmit = asyncHandler(async (req: Request, res: Response) => {
  const formData = req.getBody()
  const user = req.getState('userLoginState') as UserLoginState
  const questionnaireId =
    req.params.questionnaireId || formData.QuestionnaireId

  if (!questionnaireId) {
    throw new ErrorResponse.BadRequest('QuestionnaireId wajib diisi')
  }

  const isStaff =
    user.RoleIds.includes(RoleId.gurubk) ||
    user.RoleIds.includes(RoleId.walikelas)

  const isAssisted = isStaff && !!formData.UserId && formData.UserId !== user.uid

  const newFormData: CreateQuestionnaireSubmissionDto = {
    UserId: isAssisted ? formData.UserId : user.uid,
    QuestionnaireId: questionnaireId,
    answers: formData.answers,
    isAssisted,
    SubmittedBy: user.uid,
  }

  const values = createQuestionnaireSubmissionSchema.validateSync(newFormData)
  const data = await repository.add(values as CreateQuestionnaireSubmissionDto)

  const httpResponse = HttpResponse.created({
    message: req.t.success.created,
    data,
  })

  res.status(httpResponse.statusCode).json(httpResponse)
})

route.post(
  '/:questionnaireId/submit',
  authorization(),
  permissionAccess([RoleId.siswa, RoleId.gurubk, RoleId.walikelas]),
  handleSubmit
)

route.post(
  '/',
  authorization(),
  permissionAccess([RoleId.siswa, RoleId.gurubk, RoleId.walikelas]),
  handleSubmit
)

export { route as QuestionnaireSubmissionController }
