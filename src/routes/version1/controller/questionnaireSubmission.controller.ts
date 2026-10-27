import { QuestionnaireSubmissionRepository } from '@/features/questionnaireSubmission/repository/questionnaireSubmissionRepository'
import authorization from '@/middleware/authorization'
import express, { Response, Request } from 'express'
import HttpResponse from '@/libs/http/HttpResponse'
import {
  createQuestionnaireSubmissionSchema,
  submissionParams,
  SubmissionParams,
  SummarizeByClassIdQuery,
  summarizeByClassIdQuery,
  SummarizeByGradeIdQuery,
  summarizeByGradeIdQuery,
  SummarizeByQuestionnaireIdParams,
  SummarizeByQuestionnaireIdQuery,
  summarizeByQuestionnaireIdQuery,
  SummarizeByStudentIdQuery,
  summarizeByStudentIdQuery,
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
import StudentClassHistory from '@/database/model/studentClassHistory'
import { ErrorResponse } from '@/libs/http/ErrorResponse'
import { RoleId } from '@/libs/constant/roleIds'
import { UserLoginState } from '@/features/user/dto'
import { permissionAccess } from '@/middleware/permissionAccess'

const repository = new QuestionnaireSubmissionRepository()

const route = express.Router()

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

route.get(
  '/history-submitted',
  authorization(),
  permissionAccess([RoleId.gurubk, RoleId.walikelas]),
  asyncHandler(async (req: Request, res: Response) => {
    const data = await repository.getAllSubmissionBySubmitter(req)

    const httpResponse = HttpResponse.get({
      message: req.t.success.retrieved,
      ...data,
    })

    res.status(httpResponse.statusCode).json(httpResponse)
  })
)

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

route.get(
  '/summary-grade/:QuestionnaireId',
  authorization(),
  permissionAccess([RoleId.gurubk]),
  asyncHandler(async (req: Request, res: Response) => {
    const params: SummarizeByQuestionnaireIdParams = req.getParams()

    const query: SummarizeByGradeIdQuery = summarizeByGradeIdQuery.validateSync(
      req.query
    )

    const options: IGetSummaryOptionsByGrade = {
      QuestionnaireId: params.QuestionnaireId,
      ...query,
    }

    const data = await repository.summarizeByGradeId(options)

    const httpResponse = HttpResponse.get({
      message: req.t.success.retrieved,
      data,
    })

    res.status(httpResponse.statusCode).json(httpResponse)
  })
)

route.get(
  '/summary-class/:QuestionnaireId',
  authorization(),
  permissionAccess([RoleId.gurubk, RoleId.walikelas]),
  asyncHandler(async (req: Request, res: Response) => {
    const params: SummarizeByQuestionnaireIdParams = req.getParams()
    const user: UserLoginState = req.getState('userLoginState')

    const query: SummarizeByClassIdQuery = summarizeByClassIdQuery.validateSync(
      req.query
    )

    let targetClassId = query.ClassId

    // Wali Kelas hanya boleh melihat kelas yang sedang atau pernah ia ampu
    if (
      user.RoleIds.includes(RoleId.walikelas) &&
      !user.RoleIds.includes(RoleId.gurubk)
    ) {
      if (query.academicYear) {
        const taught = await StudentClassHistory.findOne({
          where: {
            homeroomTeacherId: user.uid,
            academicYear: query.academicYear,
            ClassId: query.ClassId,
          },
        })

        if (!taught) {
          throw new ErrorResponse.Forbidden(
            'Anda tidak mengampu kelas ini pada tahun ajaran tersebut'
          )
        }

        targetClassId = query.ClassId
      } else {
        const assignedClass = await Class.findOne({
          where: { homeroomTeacherId: user.uid },
        })

        if (!assignedClass) {
          throw new ErrorResponse.Forbidden(
            'Anda tidak terdaftar sebagai wali kelas'
          )
        }

        targetClassId = assignedClass.id
      }
    }

    const options: IGetSummaryOptionsByClass = {
      QuestionnaireId: params.QuestionnaireId,
      ...query,
      ClassId: targetClassId,
    }

    const data = await repository.summarizeByClassId(options)

    const httpResponse = HttpResponse.get({
      message: req.t.success.retrieved,
      data,
    })

    res.status(httpResponse.statusCode).json(httpResponse)
  })
)

route.get(
  '/summary-student/:QuestionnaireId',
  authorization(),
  permissionAccess([RoleId.gurubk, RoleId.walikelas]),
  asyncHandler(async (req: Request, res: Response) => {
    const params: SummarizeByQuestionnaireIdParams = req.getParams()
    const user: UserLoginState = req.getState('userLoginState')

    const query: SummarizeByStudentIdQuery =
      summarizeByStudentIdQuery.validateSync(req.query)

    // If request is from Wali Kelas (and not Guru BK), verify student is in their class
    if (
      user.RoleIds.includes(RoleId.walikelas) &&
      !user.RoleIds.includes(RoleId.gurubk)
    ) {
      const assignedClass = await Class.findOne({
        where: { homeroomTeacherId: user.uid },
      })

      const taughtHistory = await StudentClassHistory.findOne({
        where: { UserId: query.UserId, homeroomTeacherId: user.uid },
      })

      const studentDetail = await UserDetail.findOne({
        where: { UserId: query.UserId },
      })

      const isCurrentClass =
        !!assignedClass &&
        !!studentDetail &&
        studentDetail.ClassId === assignedClass.id

      if (!isCurrentClass && !taughtHistory) {
        throw new ErrorResponse.Forbidden('Siswa bukan anggota kelas Anda')
      }
    }

    const options: IGetSummaryOptionsByStudent = {
      QuestionnaireId: params.QuestionnaireId,
      ...query,
    }

    const data = await repository.summarizeByUserId(options)

    const httpResponse = HttpResponse.get({
      message: req.t.success.retrieved,
      data,
    })

    res.status(httpResponse.statusCode).json(httpResponse)
  })
)

route.get(
  '/summary-me/:QuestionnaireId',
  authorization(),
  permissionAccess([RoleId.siswa]),
  asyncHandler(async (req: Request, res: Response) => {
    const params: SummarizeByQuestionnaireIdParams = req.getParams()
    const user: UserLoginState = req.getState('userLoginState')

    const options: IGetSummaryOptionsByStudent = {
      QuestionnaireId: params.QuestionnaireId,
      UserId: user.uid,
      startDate: req.query.startDate
        ? new Date(req.query.startDate as string)
        : undefined,
      endDate: req.query.endDate
        ? new Date(req.query.endDate as string)
        : undefined,
    }

    const data = await repository.summarizeByUserId(options)

    const httpResponse = HttpResponse.get({
      message: req.t.success.retrieved,
      data,
    })

    res.status(httpResponse.statusCode).json(httpResponse)
  })
)

route.get(
  '/:id/detail',
  authorization(),
  asyncHandler(async (req: Request, res: Response) => {
    const params: SubmissionParams = submissionParams.validateSync(req.params)

    const data = await repository.submissionDetail(params.id)

    const httpResponse = HttpResponse.created({
      message: req.t.success.retrieved,
      data,
    })

    res.status(httpResponse.statusCode).json(httpResponse)
  })
)

route.post(
  '/:questionnaireId/submit',
  authorization(),
  asyncHandler(async (req: Request, res: Response) => {
    const formData = req.getBody()

    const user = req.getState('userLoginState') as UserLoginState

    const params = req.getParams()

    const activeRoleId = req.header('x-active-role')

    const isTeacher =
      (activeRoleId === RoleId.gurubk &&
        user.RoleIds.includes(RoleId.gurubk)) ||
      (activeRoleId === RoleId.walikelas &&
        user.RoleIds.includes(RoleId.walikelas))

    const isAssisted = isTeacher

    const newFormData: CreateQuestionnaireSubmissionDto = {
      UserId: isAssisted ? formData.UserId : user.uid,
      QuestionnaireId: params.questionnaireId,
      answers: formData.answers,
      isAssisted,
      SubmittedBy: user.uid,
    }

    const values = createQuestionnaireSubmissionSchema.validateSync(newFormData)

    const data = await repository.add(values)

    const httpResponse = HttpResponse.created({
      message: req.t.success.created,
      data,
    })

    res.status(httpResponse.statusCode).json(httpResponse)
  })
)

export { route as QuestionnaireSubmissionController }
