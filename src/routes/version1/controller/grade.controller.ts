import { GradeRepository } from '@/features/grade/repository/gradeRepository'
import { permissionAccess } from '@/middleware/permissionAccess'
import authorization from '@/middleware/authorization'
import express, { Response, Request } from 'express'
import HttpResponse from '@/libs/http/HttpResponse'
import {
  GradeQuery,
  createGradeSchema,
  gradeQuerySchema,
  updateGradeSchema,
} from '@/features/grade/schema'
import asyncHandler from '@/helper/asyncHandler'
import { RoleId } from '@/libs/constant/roleIds'

const repository = new GradeRepository()

const route = express.Router()

route.post(
  '/',
  authorization(),
  permissionAccess([RoleId.gurubk]),
  asyncHandler(async (req: Request, res: Response) => {
    const formData = req.getBody()

    const values = createGradeSchema.validateSync(formData)

    const data = await repository.add(values)

    const httpResponse = HttpResponse.created({
      message: req.t.grade.created,
      data,
    })

    res.status(httpResponse.statusCode).json(httpResponse)
  })
)

route.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const data = await repository.getAll(req)

    const httpResponse = HttpResponse.get({
      message: req.t.grade.retrieved,
      ...data,
    })

    res.status(httpResponse.statusCode).json(httpResponse)
  })
)

route.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const params: GradeQuery = req.getParams()

    const querySchema = gradeQuerySchema.validateSync(params)

    const data = await repository.getById(querySchema.id)

    const httpResponse = HttpResponse.get({
      message: req.t.grade.retrieved,
      data,
    })

    res.status(httpResponse.statusCode).json(httpResponse)
  })
)

route.delete(
  '/:id',
  authorization(),
  permissionAccess([RoleId.gurubk]),
  asyncHandler(async (req: Request, res: Response) => {
    const params: GradeQuery = req.getParams()

    const querySchema = gradeQuerySchema.validateSync(params)

    const data = await repository.delete(querySchema.id)

    const httpResponse = HttpResponse.deleted({
      message: req.t.grade.deleted,
    })

    res.status(httpResponse.statusCode).json(httpResponse)
  })
)

route.put(
  '/:id',
  authorization(),
  permissionAccess([RoleId.gurubk]),
  asyncHandler(async (req: Request, res: Response) => {
    const formData = req.getBody()

    const values = updateGradeSchema.validateSync(formData)

    const params: GradeQuery = req.getParams()

    const querySchema = gradeQuerySchema.validateSync(params)

    const data = await repository.update(querySchema.id, values)

    const httpResponse = HttpResponse.updated({
      message: req.t.grade.updated,
      data,
    })

    res.status(httpResponse.statusCode).json(httpResponse)
  })
)

export { route as GradeController, route as RukunWargaController }
