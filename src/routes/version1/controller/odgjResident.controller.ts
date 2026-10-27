import { OdgjResidentRepository } from '@/features/odgjResident/repository/odgjResidentRepository'
import {
  createOdgjScheduleSchema,
  createOdgjResidentSchema,
  odgjResidentParamSchema,
  odgjScheduleParamSchema,
  updateOdgjScheduleSchema,
  updateOdgjResidentSchema,
} from '@/features/odgjResident/schema'
import asyncHandler from '@/helper/asyncHandler'
import HttpResponse from '@/libs/http/HttpResponse'
import { RoleId } from '@/libs/constant/roleIds'
import authorization from '@/middleware/authorization'
import { permissionAccess } from '@/middleware/permissionAccess'
import express, { Request, Response } from 'express'

const repository = new OdgjResidentRepository()
const route = express.Router()

route.get(
  '/',
  authorization(),
  permissionAccess([RoleId.adminDesa]),
  asyncHandler(async (req: Request, res: Response) => {
    const data = await repository.getAll(req)

    const httpResponse = HttpResponse.get({
      message: req.t.odgjResident.retrieved,
      ...data,
    })

    res.status(httpResponse.statusCode).json(httpResponse)
  })
)

route.post(
  '/',
  authorization(),
  permissionAccess([RoleId.adminDesa]),
  asyncHandler(async (req: Request, res: Response) => {
    const formData = req.getBody()
    const values = createOdgjResidentSchema.validateSync(formData, {
      stripUnknown: true,
    })

    const result = await repository.create(values)

    const httpResponse = HttpResponse.created({
      message: req.t.odgjResident.created,
      data: result.data,
      ...(result.schedule ? { meta: { schedule: result.schedule } } : {}),
    })

    res.status(httpResponse.statusCode).json(httpResponse)
  })
)

route.put(
  '/:id',
  authorization(),
  permissionAccess([RoleId.adminDesa]),
  asyncHandler(async (req: Request, res: Response) => {
    const params = odgjResidentParamSchema.validateSync(req.params)
    const formData = req.getBody()
    const values = updateOdgjResidentSchema.validateSync(formData, {
      stripUnknown: true,
    })

    const data = await repository.update(params.id, values)

    const httpResponse = HttpResponse.updated({
      message: req.t.odgjResident.updated,
      data,
    })

    res.status(httpResponse.statusCode).json(httpResponse)
  })
)

route.post(
  '/:id/schedules',
  authorization(),
  permissionAccess([RoleId.adminDesa]),
  asyncHandler(async (req: Request, res: Response) => {
    const params = odgjResidentParamSchema.validateSync(req.params)
    const formData = req.getBody()
    const values = createOdgjScheduleSchema.validateSync(formData, {
      stripUnknown: true,
    })

    const result = await repository.createSchedule(params.id, values)

    const httpResponse = HttpResponse.created({
      message:
        result.schedule && result.schedule.recurrenceCount > 1
          ? req.t.odgjResident.recurringSchedulesCreated
          : req.t.odgjResident.scheduleCreated,
      data: result.data,
      ...(result.schedule ? { meta: { schedule: result.schedule } } : {}),
    })

    res.status(httpResponse.statusCode).json(httpResponse)
  })
)

route.put(
  '/:id/schedules/:scheduleId',
  authorization(),
  permissionAccess([RoleId.adminDesa]),
  asyncHandler(async (req: Request, res: Response) => {
    const params = odgjScheduleParamSchema.validateSync(req.params)
    const formData = req.getBody()
    const values = updateOdgjScheduleSchema.validateSync(formData, {
      stripUnknown: true,
    })

    const data = await repository.updateSchedule(
      params.id,
      params.scheduleId,
      values
    )

    const httpResponse = HttpResponse.updated({
      message: req.t.odgjResident.scheduleUpdated,
      data,
    })

    res.status(httpResponse.statusCode).json(httpResponse)
  })
)

route.delete(
  '/:id/schedules/:scheduleId',
  authorization(),
  permissionAccess([RoleId.adminDesa]),
  asyncHandler(async (req: Request, res: Response) => {
    const params = odgjScheduleParamSchema.validateSync(req.params)

    const data = await repository.deleteSchedule(params.id, params.scheduleId)

    const httpResponse = HttpResponse.deleted({
      message: req.t.odgjResident.scheduleDeleted,
      data,
    })

    res.status(httpResponse.statusCode).json(httpResponse)
  })
)

route.delete(
  '/:id',
  authorization(),
  permissionAccess([RoleId.adminDesa]),
  asyncHandler(async (req: Request, res: Response) => {
    const params = odgjResidentParamSchema.validateSync(req.params)

    await repository.delete(params.id)

    const httpResponse = HttpResponse.deleted({
      message: req.t.odgjResident.deleted,
    })

    res.status(httpResponse.statusCode).json(httpResponse)
  })
)

export { route as OdgjResidentController }
