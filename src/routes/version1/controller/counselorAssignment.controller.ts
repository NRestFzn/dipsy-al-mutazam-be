import { CounselorAssignmentRepository } from '@/features/counselorAssignment/repository/counselorAssignmentRepository'
import {
  counselorAssignmentMeQuerySchema,
  counselorAssignmentQuerySchema,
  replaceCounselorAssignmentSchema,
} from '@/features/counselorAssignment/schema'
import { UserLoginState } from '@/features/user/dto'
import asyncHandler from '@/helper/asyncHandler'
import { RoleId } from '@/libs/constant/roleIds'
import HttpResponse from '@/libs/http/HttpResponse'
import authorization from '@/middleware/authorization'
import { permissionAccess } from '@/middleware/permissionAccess'
import express, { Request, Response } from 'express'

const repository = new CounselorAssignmentRepository()
const route = express.Router()

route.get(
  '/me',
  authorization(),
  permissionAccess([RoleId.gurubk, RoleId.tu]),
  asyncHandler(async (req: Request, res: Response) => {
    const user: UserLoginState = req.getState('userLoginState')
    const query = counselorAssignmentMeQuerySchema.validateSync(req.query)

    const data = await repository.getMyAssignmentsGroupedByYear(
      user.uid,
      query.academicYear
    )

    const httpResponse = HttpResponse.get({
      message: req.t.success.retrieved,
      data,
    })

    res.status(httpResponse.statusCode).json(httpResponse)
  })
)

route.get(
  '/',
  authorization(),
  permissionAccess([RoleId.tu]),
  asyncHandler(async (req: Request, res: Response) => {
    const query = counselorAssignmentQuerySchema.validateSync(req.query)

    const data = await repository.getAll(query)

    const httpResponse = HttpResponse.get({
      message: req.t.success.retrieved,
      data,
    })

    res.status(httpResponse.statusCode).json(httpResponse)
  })
)

route.put(
  '/',
  authorization(),
  permissionAccess([RoleId.tu]),
  asyncHandler(async (req: Request, res: Response) => {
    const formData = replaceCounselorAssignmentSchema.validateSync(
      req.getBody()
    )

    const data = await repository.replace(formData)

    const httpResponse = HttpResponse.updated({
      message: req.t.success.updated,
      data,
    })

    res.status(httpResponse.statusCode).json(httpResponse)
  })
)

export { route as CounselorAssignmentController }
