import { AcademicYearRepository } from '@/features/academicYear/repository/academicYearRepository'
import {
  createAcademicYearSchema,
  updateAcademicYearSchema,
} from '@/features/academicYear/schema'
import { permissionAccess } from '@/middleware/permissionAccess'
import authorization from '@/middleware/authorization'
import express, { Response, Request } from 'express'
import HttpResponse from '@/libs/http/HttpResponse'
import asyncHandler from '@/helper/asyncHandler'
import { RoleId } from '@/libs/constant/roleIds'

const repository = new AcademicYearRepository()

const route = express.Router()

const readAccess = [
  RoleId.tu,
  RoleId.gurubk,
  RoleId.walikelas,
  RoleId.siswa,
]

route.get(
  '/current',
  authorization(),
  permissionAccess(readAccess),
  asyncHandler(async (req: Request, res: Response) => {
    const academicYear = await repository.getCurrent()

    const httpResponse = HttpResponse.get({
      message: req.t.success.retrieved,
      data: { academicYear },
    })

    res.status(httpResponse.statusCode).json(httpResponse)
  })
)

route.get(
  '/',
  authorization(),
  permissionAccess(readAccess),
  asyncHandler(async (req: Request, res: Response) => {
    const data = await repository.getAll()

    const httpResponse = HttpResponse.get({
      message: req.t.success.retrieved,
      data,
    })

    res.status(httpResponse.statusCode).json(httpResponse)
  })
)

route.post(
  '/',
  authorization(),
  permissionAccess([RoleId.tu]),
  asyncHandler(async (req: Request, res: Response) => {
    const values = createAcademicYearSchema.validateSync(req.getBody())

    const data = await repository.create(values)

    const httpResponse = HttpResponse.created({
      message: req.t.success.created,
      data,
    })

    res.status(httpResponse.statusCode).json(httpResponse)
  })
)

route.put(
  '/:id/activate',
  authorization(),
  permissionAccess([RoleId.tu]),
  asyncHandler(async (req: Request, res: Response) => {
    const params = req.getParams()

    const data = await repository.activate(params.id)

    const httpResponse = HttpResponse.updated({
      message: req.t.success.updated,
      data,
    })

    res.status(httpResponse.statusCode).json(httpResponse)
  })
)

route.put(
  '/:id',
  authorization(),
  permissionAccess([RoleId.tu]),
  asyncHandler(async (req: Request, res: Response) => {
    const params = req.getParams()
    const values = updateAcademicYearSchema.validateSync(req.getBody())

    const data = await repository.update(params.id, values)

    const httpResponse = HttpResponse.updated({
      message: req.t.success.updated,
      data,
    })

    res.status(httpResponse.statusCode).json(httpResponse)
  })
)

route.delete(
  '/:id',
  authorization(),
  permissionAccess([RoleId.tu]),
  asyncHandler(async (req: Request, res: Response) => {
    const params = req.getParams()

    await repository.delete(params.id)

    const httpResponse = HttpResponse.deleted({
      message: req.t.success.deleted,
    })

    res.status(httpResponse.statusCode).json(httpResponse)
  })
)

export { route as AcademicYearController }
