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
  summarizeByRtIdQuery,
  SummarizeByRtIdQuery,
  summarizeByRwIdQuery,
  SummarizeByRwIdQuery,
  summarizeByUserIdQuery,
  SummarizeByUserIdQuery,
} from '@/features/questionnaireSubmission/schema'
import asyncHandler from '@/helper/asyncHandler'
import _ from 'lodash'
import {
  CreateQuestionnaireSubmissionDto,
  IGetSummaryOptions,
  IGetSummaryOptionsByRt,
  IGetSummaryOptionsByRw,
  IGetSummaryOptionsByUser,
} from '@/features/questionnaireSubmission/dto'
import User from '@/database/model/user'
import UserDetail from '@/database/model/userDetail'
import { ErrorResponse } from '@/libs/http/ErrorResponse'
import { RoleId } from '@/libs/constant/roleIds'
import { UserLoginState } from '@/features/user/dto'
import { permissionAccess } from '@/middleware/permissionAccess'

const repository = new QuestionnaireSubmissionRepository()

const route = express.Router()

route.get(
  '/history-me',
  authorization(),
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
  '/summary-rw/:QuestionnaireId',
  authorization(),
  asyncHandler(async (req: Request, res: Response) => {
    const params: SummarizeByQuestionnaireIdParams = req.getParams()

    const query: SummarizeByRwIdQuery = summarizeByRwIdQuery.validateSync(
      req.query
    )

    const options: IGetSummaryOptionsByRw = {
      QuestionnaireId: params.QuestionnaireId,
      ...query,
    }

    const data = await repository.summarizeByRwId(options)

    const httpResponse = HttpResponse.get({
      message: req.t.success.retrieved,
      data,
    })

    res.status(httpResponse.statusCode).json(httpResponse)
  })
)

route.get(
  '/summary-rt/:QuestionnaireId',
  authorization(),
  asyncHandler(async (req: Request, res: Response) => {
    const params: SummarizeByQuestionnaireIdParams = req.getParams()

    const query: SummarizeByRtIdQuery = summarizeByRtIdQuery.validateSync(
      req.query
    )

    const options: IGetSummaryOptionsByRt = {
      QuestionnaireId: params.QuestionnaireId,
      ...query,
    }

    const data = await repository.summarizeByRtId(options)

    const httpResponse = HttpResponse.get({
      message: req.t.success.retrieved,
      data,
    })

    res.status(httpResponse.statusCode).json(httpResponse)
  })
)

route.get(
  '/summary-user/:QuestionnaireId',
  authorization(),
  asyncHandler(async (req: Request, res: Response) => {
    const params: SummarizeByQuestionnaireIdParams = req.getParams()

    const query: SummarizeByUserIdQuery = summarizeByUserIdQuery.validateSync(
      req.query
    )

    const options: IGetSummaryOptionsByUser = {
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
  asyncHandler(async (req: Request, res: Response) => {
    const params: SummarizeByQuestionnaireIdParams = req.getParams()

    const user = await User.findByPk(req.getState('userLoginState').uid, {
      include: [{ model: UserDetail }],
    })

    if (!user) {
      throw new ErrorResponse.NotFound(req.t.user.notFound)
    }

    if (!user.userDetail) {
      throw new ErrorResponse.BadRequest(req.t.user.inCompleteDetail)
    }

    const query: SummarizeByUserIdQuery = summarizeByUserIdQuery.validateSync({
      ...req.query,
      UserId: user.id,
      RukunTetanggaId: user.userDetail.RukunTetanggaId,
      RukunWargaId: user.userDetail.RukunWargaId,
    })

    const options: IGetSummaryOptionsByUser = {
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

    const isKaderDesa =
      activeRoleId === RoleId.kaderDesa &&
      user.RoleIds.includes(RoleId.kaderDesa)

    const isKepalaKeluarga =
      activeRoleId === RoleId.kepalaKeluarga &&
      user.RoleIds.includes(RoleId.kepalaKeluarga)

    const isAssisted = isKaderDesa || isKepalaKeluarga

    const newFormData: CreateQuestionnaireSubmissionDto = {
      UserId: isAssisted ? formData.UserId : user.uid,
      QuestionnaireId: params.questionnaireId,
      answers: formData.answers,
      isAssisted: isAssisted,
      SubmittedBy: user.uid,
    }

    const values = createQuestionnaireSubmissionSchema.validateSync(newFormData)

    const data = await repository.add(newFormData)

    const httpResponse = HttpResponse.created({
      message: req.t.success.created,
      data,
    })

    res.status(httpResponse.statusCode).json(httpResponse)
  })
)

export { route as QuestionnaireSubmissionController }
