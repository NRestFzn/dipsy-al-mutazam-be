import { Request } from 'express'
import Grade from '@/database/model/grade'
import Class from '@/database/model/class'
import { ErrorResponse } from '@/libs/http/ErrorResponse'
import { GradeQueryRepository } from './gradeQueryRepository'
import {
  CreateGradeDto,
  GradeDetailDto,
  GradeDto,
  UpdateGradeDto,
} from '../dto'
import { Sequelize } from 'sequelize-typescript'
import { MetaPaginationDto } from '@/routes/version1/response/metaData'

export class GradeRepository {
  async getAll(req: Request): Promise<{
    data: GradeDto[]
    meta: { pagination: MetaPaginationDto }
  }> {
    const query = new GradeQueryRepository(req)

    const data = await Grade.findAll({
      ...query.queryFilter(),
      attributes: {
        include: [
          [
            Sequelize.literal(`(
              SELECT COUNT(*)
              FROM classes AS c
              WHERE c.GradeId = Grade.id
            )`),
            'classCount',
          ],
          [
            Sequelize.literal(`(
              SELECT COUNT(*)
              FROM user_details AS ud
              WHERE ud.GradeId = Grade.id
            )`),
            'studentCount',
          ],
        ],
      },
    })

    const dataCount = await Grade.count()

    return {
      data,
      meta: {
        pagination: {
          page: query.page,
          pageSize: query.pageSize,
          pageCount: data.length,
          total: dataCount,
        },
      },
    }
  }

  async getByPk(id: string): Promise<Grade> {
    const data = await Grade.findByPk(id)

    if (!data) throw new ErrorResponse.NotFound('errors.notFound')

    return data
  }

  async getById(id: string): Promise<GradeDetailDto> {
    const data = await Grade.findOne({
      where: { id },
      attributes: {
        include: [
          [
            Sequelize.literal(`(
              SELECT COUNT(*)
              FROM classes AS c
              WHERE c.GradeId = Grade.id
            )`),
            'classCount',
          ],
          [
            Sequelize.literal(`(
              SELECT COUNT(*)
              FROM user_details AS ud
              WHERE ud.GradeId = Grade.id
            )`),
            'studentCount',
          ],
        ],
      },
      include: [
        {
          model: Class,
          attributes: {
            include: [
              [
                Sequelize.literal(`(
                  SELECT COUNT(*)
                  FROM user_details AS ud
                  WHERE ud.ClassId = classes.id
                )`),
                'studentCount',
              ],
            ],
          },
        },
      ],
    })

    if (!data) throw new ErrorResponse.NotFound('errors.notFound')

    return data as unknown as GradeDetailDto
  }

  async add(formData: CreateGradeDto): Promise<GradeDto> {
    const data = await Grade.create({
      name: formData.name,
      level: formData.level || null,
    })

    return data as unknown as GradeDto
  }

  async update(id: string, formData: UpdateGradeDto): Promise<void> {
    const data = await this.getByPk(id)

    await data.update({
      ...(formData.name ? { name: formData.name } : {}),
      ...(formData.level !== undefined ? { level: formData.level } : {}),
    })
  }

  async delete(id: string): Promise<void> {
    const data = await this.getByPk(id)

    await data.destroy()
  }
}

// Backwards compatibility alias
export const RukunWargaRepository = GradeRepository
