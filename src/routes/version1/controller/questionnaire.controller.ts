import { QuestionnaireRepository } from '@/features/questionnaire/repository/questionnaireRepository'
import { permissionAccess } from '@/middleware/permissionAccess'
import authorization from '@/middleware/authorization'
import express, { Response, Request } from 'express'
import HttpResponse from '@/libs/http/HttpResponse'
import {
  QuestionnaireQuery,
  createQuestionnaireSchema,
  questionnaireQuerySchema,
  updateQuestionnaireSchema,
} from '@/features/questionnaire/schema'
import asyncHandler from '@/helper/asyncHandler'
import { RoleId } from '@/libs/constant/roleIds'
import _ from 'lodash'

const repository = new QuestionnaireRepository()

const route = express.Router()

route.post(
  '/',
  authorization(),
  permissionAccess([RoleId.adminMedis]),
  asyncHandler(async (req: Request, res: Response) => {
    const formData = req.getBody()

    const values = createQuestionnaireSchema.validateSync(formData)

    const data = await repository.add({ ...values, status: 'draft' })

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
  '/public',
  authorization(),
  asyncHandler(async (req: Request, res: Response) => {
    const data = await repository.getAllPublic(req)

    const httpResponse = HttpResponse.get({
      message: req.t.success.retrieved,
      ...data,
    })

    res.status(httpResponse.statusCode).json(httpResponse)
  })
)

route.get(
  '/me',
  authorization(),
  asyncHandler(async (req: Request, res: Response) => {
    const data = await repository.getAllAvailabilityByUserId(req)

    const httpResponse = HttpResponse.get({
      message: req.t.success.retrieved,
      data,
    })

    res.status(httpResponse.statusCode).json(httpResponse)
  })
)

route.get(
  '/:id',
  authorization(),
  permissionAccess([RoleId.adminMedis]),
  asyncHandler(async (req: Request, res: Response) => {
    const params: QuestionnaireQuery = req.getParams()

    const querySchema = questionnaireQuerySchema.validateSync(params)

    const data = await repository.getById(querySchema.id)

    const httpResponse = HttpResponse.get({
      message: req.t.success.retrieved,
      data,
    })

    res.status(httpResponse.statusCode).json(httpResponse)
  })
)

route.get(
  '/:id/public',
  authorization(),
  asyncHandler(async (req: Request, res: Response) => {
    const params: QuestionnaireQuery = req.getParams()

    const querySchema = questionnaireQuerySchema.validateSync(params)

    const data = await repository.getByIdPublic(querySchema.id)

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
    const params: QuestionnaireQuery = req.getParams()

    const querySchema = questionnaireQuerySchema.validateSync(params)

    const data = await repository.delete(querySchema.id)

    const httpResponse = HttpResponse.deleted({
      message: req.t.success.deleted,
    })

    res.status(httpResponse.statusCode).json(httpResponse)
  })
)

route.put(
  '/:id',
  authorization(),
  permissionAccess([RoleId.adminMedis]),
  asyncHandler(async (req: Request, res: Response) => {
    const formData = req.getBody()

    const values = updateQuestionnaireSchema.validateSync(formData)

    const params: QuestionnaireQuery = req.getParams()

    const querySchema = questionnaireQuerySchema.validateSync(params)

    const data = await repository.update(querySchema.id, values)

    const httpResponse = HttpResponse.updated({
      message: req.t.success.updated,
      data,
    })

    res.status(httpResponse.statusCode).json(httpResponse)
  })
)

export { route as QuestionnaireController }
