import asyncHandler from '@/helper/asyncHandler'
import express, { Response, Request } from 'express'
import { AuthRepository } from '@/features/auth/repository/authRepository'
import HttpResponse from '@/libs/http/HttpResponse'
import {
  loginSchema,
  loginWithNikSchema,
  registerSchema,
} from '@/features/auth/schema'

const repository = new AuthRepository()

const route = express.Router()

route.post(
  '/signup',
  asyncHandler(async (req: Request, res: Response) => {
    const formData = req.getBody()

    const values = registerSchema.validateSync(formData)

    const data = await repository.register({ ...values, isKader: false })

    const httpResponse = HttpResponse.created({
      message: req.t.auth.registerSuccess,
      data,
    })

    res.status(201).json(httpResponse)
  })
)

route.post(
  '/signin',
  asyncHandler(async (req: Request, res: Response) => {
    const formData = req.getBody()

    const values = loginSchema.validateSync(formData)

    const data = await repository.login(values)

    const httpResponse = HttpResponse.get({
      message: req.t.auth.loginSuccess,
      data,
    })

    res.status(200).json(httpResponse)
  })
)

route.post(
  '/signin/resident',
  asyncHandler(async (req: Request, res: Response) => {
    const formData = req.getBody()

    const values = loginWithNikSchema.validateSync(formData)

    const data = await repository.loginWithNik(values)

    const httpResponse = HttpResponse.get({
      message: req.t.auth.loginSuccess,
      data,
    })

    res.status(200).json(httpResponse)
  })
)

export { route as AuthController }
