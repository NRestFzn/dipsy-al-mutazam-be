import { ResidentRepository } from '@/features/resident/repository/residentRepository'
import { permissionAccess } from '@/middleware/permissionAccess'
import authorization from '@/middleware/authorization'
import express, { Response, Request } from 'express'
import HttpResponse from '@/libs/http/HttpResponse'
import {
  ResidentNikQuery,
  ResidentQuery,
  createResidentSchema,
  residentNikQuerySchema,
  residentQuerySchema,
  updateProfileSchema,
  updateResidentSchema,
} from '@/features/resident/schema'
import asyncHandler from '@/helper/asyncHandler'
import { RoleId } from '@/libs/constant/roleIds'
import _ from 'lodash'
import { UserLoginState } from '@/features/user/dto'
import { UserRepository } from '@/features/user/repository/userRepository'
import { Mimetype } from '@/libs/constant/allowedMimetype'
import { MulterConfig, useMulter } from '@/libs/module/multer'
import { allowed_image } from '@/libs/constant/allowedExtension'

const repository = new ResidentRepository()

const userRepository = new UserRepository()

const route = express.Router()

const mimeType = new Mimetype()

const multerConfig: MulterConfig = {
  allowed_ext: allowed_image,
  allowed_mimetype: mimeType.image,
}

const uploadFile = useMulter(multerConfig)

route.post(
  '/',
  authorization(),
  permissionAccess([RoleId.adminDesa]),
  asyncHandler(async (req: Request, res: Response) => {
    const formData = req.getBody()

    const values = createResidentSchema.validateSync(formData)

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
  permissionAccess([RoleId.adminDesa, RoleId.kaderDesa]),
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
  '/me',
  authorization(),
  asyncHandler(async (req: Request, res: Response) => {
    const user: UserLoginState = req.getState('userLoginState')

    const data = await repository.getById(user.uid)

    const httpResponse = HttpResponse.get({
      message: req.t.success.retrieved,
      data,
    })

    res.status(httpResponse.statusCode).json(httpResponse)
  })
)

route.put(
  '/me',
  authorization(),
  asyncHandler(async (req: Request, res: Response) => {
    const user: UserLoginState = req.getState('userLoginState')

    const formData = req.getBody()

    const value = updateProfileSchema.validateSync(formData, {
      stripUnknown: true,
    })

    const data = await repository.updateByToken(user.uid, value)

    const httpResponse = HttpResponse.updated({
      message: req.t.user.profileUpdated,
      data,
    })

    res.status(httpResponse.statusCode).json(httpResponse)
  })
)

route.get(
  '/by-nik/:nik',
  authorization(),
  permissionAccess([RoleId.adminDesa]),
  asyncHandler(async (req: Request, res: Response) => {
    const params: ResidentNikQuery = req.getParams()

    const querySchema = residentNikQuerySchema.validateSync(params)

    const data = await repository.getByNik(querySchema.nik)

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
  permissionAccess([RoleId.adminDesa]),
  asyncHandler(async (req: Request, res: Response) => {
    const params: ResidentQuery = req.getParams()

    const querySchema = residentQuerySchema.validateSync(params)

    const data = await repository.getById(querySchema.id)

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
  permissionAccess([RoleId.adminDesa]),
  asyncHandler(async (req: Request, res: Response) => {
    const params: ResidentQuery = req.getParams()

    const querySchema = residentQuerySchema.validateSync(params)

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
  permissionAccess([RoleId.adminDesa]),
  asyncHandler(async (req: Request, res: Response) => {
    let formData = req.getBody()

    const values = updateResidentSchema.validateSync(formData)

    const params: ResidentQuery = req.getParams()

    const querySchema = residentQuerySchema.validateSync(params)

    const data = await repository.update(querySchema.id, values)

    const httpResponse = HttpResponse.updated({
      message: req.t.success.updated,
      data,
    })

    res.status(httpResponse.statusCode).json(httpResponse)
  })
)

route.put(
  '/update/profile-picture',
  authorization(),
  uploadFile.single('profilePicture'),
  asyncHandler(async (req: Request, res: Response) => {
    const user: UserLoginState = req.getState('userLoginState')

    const file = req.file as Express.Multer.File

    const data = await userRepository.updateProfilePict(user.uid, file.filename)

    const httpResponse = HttpResponse.updated({
      message: req.t.user.profilePictureUpdated,
      data,
    })

    res.status(httpResponse.statusCode).json(httpResponse)
  })
)

export { route as ResidentController }
