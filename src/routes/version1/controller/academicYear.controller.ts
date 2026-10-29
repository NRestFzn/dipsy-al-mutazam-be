import { resolveCurrentAcademicYear } from '@/features/class/repository/classRepository'
import { permissionAccess } from '@/middleware/permissionAccess'
import authorization from '@/middleware/authorization'
import express, { Response, Request } from 'express'
import HttpResponse from '@/libs/http/HttpResponse'
import asyncHandler from '@/helper/asyncHandler'
import { RoleId } from '@/libs/constant/roleIds'

const route = express.Router()

route.get(
  '/current',
  authorization(),
  permissionAccess([
    RoleId.tu,
    RoleId.gurubk,
    RoleId.walikelas,
    RoleId.siswa,
  ]),
  asyncHandler(async (req: Request, res: Response) => {
    const academicYear = await resolveCurrentAcademicYear()

    const httpResponse = HttpResponse.get({
      message: req.t.success.retrieved,
      data: { academicYear },
    })

    res.status(httpResponse.statusCode).json(httpResponse)
  })
)

export { route as AcademicYearController }
