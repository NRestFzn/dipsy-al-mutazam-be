import { ClassRepository } from '@/features/class/repository/classRepository'
import { permissionAccess } from '@/middleware/permissionAccess'
import authorization from '@/middleware/authorization'
import express, { Response, Request } from 'express'
import HttpResponse from '@/libs/http/HttpResponse'
import {
  ClassQuery,
  createClassSchema,
  classQuerySchema,
  updateClassSchema,
} from '@/features/class/schema'
import asyncHandler from '@/helper/asyncHandler'
import { RoleId } from '@/libs/constant/roleIds'

const repository = new ClassRepository()

const route = express.Router()

route.post(
  '/',
  authorization(),
  permissionAccess([RoleId.gurubk]),
  asyncHandler(async (req: Request, res: Response) => {
    const formData = req.getBody()

    const values = createClassSchema.validateSync(formData)

    const data = await repository.add(values)

    const httpResponse = HttpResponse.created({
      message: req.t.class.created,
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
      message: req.t.class.retrieved,
      ...data,
    })

    res.status(httpResponse.statusCode).json(httpResponse)
  })
)

route.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const params: ClassQuery = req.getParams()

    const querySchema = classQuerySchema.validateSync(params)

    const data = await repository.getById(querySchema.id)

    const httpResponse = HttpResponse.get({
      message: req.t.class.retrieved,
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
    const params: ClassQuery = req.getParams()

    const querySchema = classQuerySchema.validateSync(params)

    const data = await repository.delete(querySchema.id)

    const httpResponse = HttpResponse.deleted({
      message: req.t.class.deleted,
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

    const values = updateClassSchema.validateSync(formData)

    const params: ClassQuery = req.getParams()

    const querySchema = classQuerySchema.validateSync(params)

    const data = await repository.update(querySchema.id, values)

    const httpResponse = HttpResponse.updated({
      message: req.t.class.updated,
      data,
    })

    res.status(httpResponse.statusCode).json(httpResponse)
  })
)

export { route as ClassController, route as RukunTetanggaController }
