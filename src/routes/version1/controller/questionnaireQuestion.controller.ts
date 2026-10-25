import { QuestionnaireQuestionRepository } from '@/features/questionnaireQuestion/repository/questionnaireQuestionRepository'
import { permissionAccess } from '@/middleware/permissionAccess'
import authorization from '@/middleware/authorization'
import express, { Response, Request } from 'express'
import HttpResponse from '@/libs/http/HttpResponse'
import {
  QuestionnaireQuestionQuery,
  createQuestionnaireQuestionSchema,
  questionnaireQuestionQuerySchema,
  updateQuestionnaireQuestionSchema,
} from '@/features/questionnaireQuestion/schema'
import asyncHandler from '@/helper/asyncHandler'
import { RoleId } from '@/libs/constant/roleIds'
import _ from 'lodash'

const repository = new QuestionnaireQuestionRepository()

const route = express.Router()

route.post(
  '/',
  authorization(),
  permissionAccess([RoleId.adminMedis]),
  asyncHandler(async (req: Request, res: Response) => {
    const formData = req.getBody()

    const values = createQuestionnaireQuestionSchema.validateSync(formData)

    const data = await repository.add(values)

    const httpResponse = HttpResponse.created({
      message: req.t.success.created,
      data,
    })

    res.status(httpResponse.statusCode).json(httpResponse)
  })
)

route.get(
  '/',
  authorization(),
  permissionAccess([RoleId.adminMedis]),
  asyncHandler(async (req: Request, res: Response) => {
    const data = await repository.getAll(req)

    const httpResponse = HttpResponse.get({
      message: req.t.success.retrieved,
      ...data,
    })

    res.status(httpResponse.statusCode).json(httpResponse)
  })
)

route.get(
  '/:id',
  authorization(),
  permissionAccess([RoleId.adminMedis]),
  asyncHandler(async (req: Request, res: Response) => {
    const params: QuestionnaireQuestionQuery = req.getParams()

    const querySchema = questionnaireQuestionQuerySchema.validateSync(params)

    const data = await repository.getByPk(querySchema.id)

    const httpResponse = HttpResponse.get({
      message: req.t.success.retrieved,
      data,
    })

    res.status(httpResponse.statusCode).json(httpResponse)
  })
)

route.delete(
  '/:id',
  authorization(),
  permissionAccess([RoleId.adminMedis]),
  asyncHandler(async (req: Request, res: Response) => {
    const params: QuestionnaireQuestionQuery = req.getParams()

    const querySchema = questionnaireQuestionQuerySchema.validateSync(params)

    const data = await repository.delete(querySchema.id)

    const httpResponse = HttpResponse.deleted({
      message: req.t.success.deleted,
    })

    res.status(httpResponse.statusCode).json(httpResponse)
  })
)

route.put(
  '/bulk-update',
  authorization(),
  permissionAccess([RoleId.adminMedis]),
  asyncHandler(async (req: Request, res: Response) => {
    const formData = req.getBody()

    const values = updateQuestionnaireQuestionSchema.validateSync(formData)

    const data = await repository.update(values)

    const httpResponse = HttpResponse.updated({
      message: req.t.success.updated,
      data,
    })

    res.status(httpResponse.statusCode).json(httpResponse)
  })
)

export { route as QuestionnaireQuestionController }
