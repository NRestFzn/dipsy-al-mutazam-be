import { GradeRepository } from '@/features/grade/repository/gradeRepository'
import express, { Response, Request } from 'express'
import HttpResponse from '@/libs/http/HttpResponse'
import { GradeQuery, gradeQuerySchema } from '@/features/grade/schema'
import asyncHandler from '@/helper/asyncHandler'

const repository = new GradeRepository()

const route = express.Router()

// Tingkat/jenjang adalah master data, jadi hanya tersedia endpoint baca.
route.get(
  '/',
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
  asyncHandler(async (req: Request, res: Response) => {
    const params: GradeQuery = req.getParams()

    const querySchema = gradeQuerySchema.validateSync(params)

    const data = await repository.getById(querySchema.id)

    const httpResponse = HttpResponse.get({
      message: req.t.success.retrieved,
      data,
    })

    res.status(httpResponse.statusCode).json(httpResponse)
  })
)

export { route as GradeController }
