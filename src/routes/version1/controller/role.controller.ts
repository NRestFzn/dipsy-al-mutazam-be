import { RoleRepository } from '@/features/role/repository/roleRepository'
import { permissionAccess } from '@/middleware/permissionAccess'
import authorization from '@/middleware/authorization'
import express, { Response, Request } from 'express'
import HttpResponse from '@/libs/http/HttpResponse'
import { RoleQuery, roleQuerySchema, roleSchema } from '@/features/role/schema'
import asyncHandler from '@/helper/asyncHandler'
import { RoleId } from '@/libs/constant/roleIds'
import _ from 'lodash'

const repository = new RoleRepository()

const route = express.Router()

route.post(
  '/',
  authorization(),
  permissionAccess([RoleId.adminMedis]),
  asyncHandler(async (req: Request, res: Response) => {
    const formData = req.getBody()

    const values = roleSchema.validateSync(formData)

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
    const params: RoleQuery = req.getParams()

    const querySchema = roleQuerySchema.validateSync(params)

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
    const params: RoleQuery = req.getParams()

    const querySchema = roleQuerySchema.validateSync(params)

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

    const values = roleSchema.validateSync(formData)

    const params: RoleQuery = req.getParams()

    const querySchema = roleQuerySchema.validateSync(params)

    const data = await repository.update(querySchema.id, values)

    const httpResponse = HttpResponse.updated({
      message: req.t.success.updated,
      data,
    })

    res.status(httpResponse.statusCode).json(httpResponse)
  })
)

export { route as RoleController }
