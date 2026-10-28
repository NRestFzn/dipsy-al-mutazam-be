import { StudentRepository } from '@/features/student/repository/studentRepository'
import { permissionAccess } from '@/middleware/permissionAccess'
import authorization from '@/middleware/authorization'
import express, { Response, Request } from 'express'
import HttpResponse from '@/libs/http/HttpResponse'
import {
  StudentNisnQuery,
  StudentQuery,
  createStudentSchema,
  graduateStudentsSchema,
  promoteStudentsSchema,
  studentNisnQuerySchema,
  studentQuerySchema,
  updateProfileSchema,
  updateStudentSchema,
} from '@/features/student/schema'
import asyncHandler from '@/helper/asyncHandler'
import { RoleId } from '@/libs/constant/roleIds'
import { UserLoginState } from '@/features/user/dto'
import { UserRepository } from '@/features/user/repository/userRepository'
import { Mimetype } from '@/libs/constant/allowedMimetype'
import { MulterConfig, useMulter } from '@/libs/module/multer'
import { allowed_image } from '@/libs/constant/allowedExtension'

const repository = new StudentRepository()
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
  permissionAccess([RoleId.tu]),
  asyncHandler(async (req: Request, res: Response) => {
    const formData = req.getBody()

    const values = createStudentSchema.validateSync(formData)
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
  permissionAccess([RoleId.tu, RoleId.gurubk, RoleId.walikelas]),
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
  '/by-nisn/:nisn',
  authorization(),
  permissionAccess([RoleId.tu, RoleId.gurubk, RoleId.walikelas]),
  asyncHandler(async (req: Request, res: Response) => {
    const params: StudentNisnQuery = req.getParams()
    const querySchema = studentNisnQuerySchema.validateSync(params)
    const data = await repository.getByNisn(querySchema.nisn)

    const httpResponse = HttpResponse.get({
      message: req.t.success.retrieved,
      data,
    })

    res.status(httpResponse.statusCode).json(httpResponse)
  })
)


route.get(
  '/taught-history',
  authorization(),
  permissionAccess([RoleId.tu, RoleId.gurubk, RoleId.walikelas]),
  asyncHandler(async (req: Request, res: Response) => {
    const user: UserLoginState = req.getState('userLoginState')
    const query = req.query as any

    const canInspectTeacher =
      user.RoleIds.includes(RoleId.tu) || user.RoleIds.includes(RoleId.gurubk)

    const teacherId =
      canInspectTeacher && query.TeacherId
        ? String(query.TeacherId)
        : user.uid

    const data = await repository.getTaughtHistory(teacherId)

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
  permissionAccess([RoleId.tu, RoleId.gurubk, RoleId.walikelas]),
  asyncHandler(async (req: Request, res: Response) => {
    const params: StudentQuery = req.getParams()
    const querySchema = studentQuerySchema.validateSync(params)
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
  permissionAccess([RoleId.tu]),
  asyncHandler(async (req: Request, res: Response) => {
    const params: StudentQuery = req.getParams()
    const querySchema = studentQuerySchema.validateSync(params)
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
  permissionAccess([RoleId.tu]),
  asyncHandler(async (req: Request, res: Response) => {
    const formData = req.getBody()

    const values = updateStudentSchema.validateSync(formData)
    const params: StudentQuery = req.getParams()
    const querySchema = studentQuerySchema.validateSync(params)
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

route.post(
  '/promotion',
  authorization(),
  permissionAccess([RoleId.tu]),
  asyncHandler(async (req: Request, res: Response) => {
    const values = promoteStudentsSchema.validateSync(req.getBody())

    await repository.promote(values)

    const httpResponse = HttpResponse.updated({
      message: req.t.success.updated,
    })

    res.status(httpResponse.statusCode).json(httpResponse)
  })
)

route.post(
  '/graduation',
  authorization(),
  permissionAccess([RoleId.tu]),
  asyncHandler(async (req: Request, res: Response) => {
    const values = graduateStudentsSchema.validateSync(req.getBody())

    await repository.graduate(values)

    const httpResponse = HttpResponse.updated({
      message: req.t.success.updated,
    })

    res.status(httpResponse.statusCode).json(httpResponse)
  })
)

route.get(
  '/:id/academic-history',
  authorization(),
  permissionAccess([RoleId.tu, RoleId.gurubk, RoleId.walikelas]),
  asyncHandler(async (req: Request, res: Response) => {
    const params = req.getParams()

    const data = await repository.getAcademicHistory(params.id)

    const httpResponse = HttpResponse.get({
      message: req.t.success.retrieved,
      data,
    })

    res.status(httpResponse.statusCode).json(httpResponse)
  })
)

export { route as StudentController }
