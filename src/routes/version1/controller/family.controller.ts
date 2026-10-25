import { FamilyRepository } from '@/features/family/repository/familyRepository'
import authorization from '@/middleware/authorization'
import express, { Response, Request } from 'express'
import HttpResponse from '@/libs/http/HttpResponse'
import asyncHandler from '@/helper/asyncHandler'
import { permissionAccess } from '@/middleware/permissionAccess'
import { RoleId } from '@/libs/constant/roleIds'
import {
  createFamilySchema,
  updateFamilyHeadSchema,
} from '@/features/family/schema'
import User from '@/database/model/user'
import UserDetail from '@/database/model/userDetail'
import { ErrorResponse } from '@/libs/http/ErrorResponse'
import { registerSchema } from '@/features/auth/schema'

const repository = new FamilyRepository()
const route = express.Router()

route.get(
  '/me/my-family',
  authorization(),
  permissionAccess([RoleId.kepalaKeluarga, RoleId.kaderDesa]),
  asyncHandler(async (req: Request, res: Response) => {
    const user = req.getState('userLoginState')
    const userDetail = await UserDetail.findOne({ where: { UserId: user.uid } })

    if (!userDetail || !userDetail.FamilyId) {
      throw new ErrorResponse.NotFound(
        'Anda tidak tergabung dalam keluarga manapun'
      )
    }

    const data = await repository.getFamilyDetail(userDetail.FamilyId)
    const httpResponse = HttpResponse.get({
      message: 'Berhasil mengambil detail keluarga',
      data,
    })
    res.status(httpResponse.statusCode).json(httpResponse)
  })
)

route.post(
  '/me/my-family/members/by-nik',
  authorization(),
  permissionAccess([RoleId.kepalaKeluarga, RoleId.kaderDesa]),
  asyncHandler(async (req: Request, res: Response) => {
    const user = req.getState('userLoginState')
    const userDetail = await UserDetail.findOne({ where: { UserId: user.uid } })

    if (!userDetail || !userDetail.FamilyId) {
      throw new ErrorResponse.NotFound(
        'Anda tidak tergabung dalam keluarga manapun'
      )
    }

    const { nik } = req.getBody()
    const data = await repository.addMemberByNik(
      userDetail.FamilyId,
      nik as string
    )
    const httpResponse = HttpResponse.created({
      message: 'Berhasil menambahkan anggota keluarga',
      data,
    })
    res.status(httpResponse.statusCode).json(httpResponse)
  })
)

route.post(
  '/me/my-family/members/register',
  authorization(),
  permissionAccess([RoleId.kepalaKeluarga, RoleId.kaderDesa]),
  asyncHandler(async (req: Request, res: Response) => {
    const user = req.getState('userLoginState')
    const userDetail = await UserDetail.findOne({ where: { UserId: user.uid } })

    if (!userDetail || !userDetail.FamilyId) {
      throw new ErrorResponse.NotFound(
        'Anda tidak tergabung dalam keluarga manapun'
      )
    }

    const formData = req.getBody()
    const values = registerSchema.validateSync(formData)
    const data = await repository.registerAndAddMember(userDetail.FamilyId, {
      ...values,
      isKader: false,
    })
    const httpResponse = HttpResponse.created({
      message: 'Berhasil mendaftarkan anggota keluarga',
      data,
    })
    res.status(httpResponse.statusCode).json(httpResponse)
  })
)

route.delete(
  '/me/my-family/members/:userId',
  authorization(),
  permissionAccess([RoleId.kepalaKeluarga, RoleId.kaderDesa]),
  asyncHandler(async (req: Request, res: Response) => {
    const user = req.getState('userLoginState')
    const userDetail = await UserDetail.findOne({ where: { UserId: user.uid } })

    if (!userDetail || !userDetail.FamilyId) {
      throw new ErrorResponse.NotFound(
        'Anda tidak tergabung dalam keluarga manapun'
      )
    }

    const userId = req.params.userId as string
    await repository.removeMember(userDetail.FamilyId, userId)
    const httpResponse = HttpResponse.get({
      message: 'Berhasil menghapus anggota keluarga',
      data: null,
    })
    res.status(httpResponse.statusCode).json(httpResponse)
  })
)

route.get(
  '/',
  authorization(),
  permissionAccess([RoleId.adminDesa, RoleId.kaderDesa]),
  asyncHandler(async (req: Request, res: Response) => {
    const data = await repository.getAllFamilies()
    const httpResponse = HttpResponse.get({
      message: 'Berhasil mengambil data keluarga',
      data,
    })
    res.status(httpResponse.statusCode).json(httpResponse)
  })
)

route.get(
  '/:id',
  authorization(),
  permissionAccess([RoleId.adminDesa, RoleId.kaderDesa]),
  asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string
    const data = await repository.getFamilyDetail(id)
    const httpResponse = HttpResponse.get({
      message: 'Berhasil mengambil detail keluarga',
      data,
    })
    res.status(httpResponse.statusCode).json(httpResponse)
  })
)

route.post(
  '/',
  authorization(),
  permissionAccess([RoleId.adminDesa, RoleId.kaderDesa]),
  asyncHandler(async (req: Request, res: Response) => {
    const formData = req.getBody()
    const values = createFamilySchema.validateSync(formData)
    const data = await repository.createFamily(values)
    const httpResponse = HttpResponse.created({
      message: 'Berhasil membuat keluarga',
      data,
    })
    res.status(httpResponse.statusCode).json(httpResponse)
  })
)

route.put(
  '/:id/head',
  authorization(),
  permissionAccess([RoleId.adminDesa, RoleId.kaderDesa]),
  asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string
    const formData = req.getBody()
    const values = updateFamilyHeadSchema.validateSync(formData)
    const data = await repository.updateFamilyHead(id, values)
    const httpResponse = HttpResponse.get({
      message: 'Berhasil mengubah kepala keluarga',
      data,
    })
    res.status(httpResponse.statusCode).json(httpResponse)
  })
)

route.post(
  '/:id/members/by-nik',
  authorization(),
  permissionAccess([RoleId.adminDesa, RoleId.kaderDesa]),
  asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string
    const { nik } = req.getBody()
    const data = await repository.addMemberByNik(id, nik as string)
    const httpResponse = HttpResponse.created({
      message: 'Berhasil menambahkan anggota keluarga',
      data,
    })
    res.status(httpResponse.statusCode).json(httpResponse)
  })
)

route.post(
  '/:id/members/register',
  authorization(),
  permissionAccess([RoleId.adminDesa, RoleId.kaderDesa]),
  asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string
    const formData = req.getBody()
    const values = registerSchema.validateSync(formData)
    const data = await repository.registerAndAddMember(id, {
      ...values,
      isKader: false,
    })
    const httpResponse = HttpResponse.created({
      message: 'Berhasil mendaftarkan anggota keluarga',
      data,
    })
    res.status(httpResponse.statusCode).json(httpResponse)
  })
)

route.delete(
  '/:id/members/:userId',
  authorization(),
  permissionAccess([RoleId.adminDesa, RoleId.kaderDesa]),
  asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string
    const userId = req.params.userId as string
    await repository.removeMember(id, userId)
    const httpResponse = HttpResponse.get({
      message: 'Berhasil menghapus anggota keluarga',
      data: null,
    })
    res.status(httpResponse.statusCode).json(httpResponse)
  })
)

export { route as FamilyController }
