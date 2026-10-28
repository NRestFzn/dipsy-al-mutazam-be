import { Request } from 'express'
import Grade from '@/database/model/grade'
import Class from '@/database/model/class'
import { ErrorResponse } from '@/libs/http/ErrorResponse'
import { GradeQueryRepository } from './gradeQueryRepository'
import { GradeDetailDto, GradeDto } from '../dto'
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
              WHERE ud.GradeId = Grade.id AND ud.studentStatus = 'aktif'
            )`),
            'studentCount',
          ],
        ],
      },
    })

    const gradeOrderMap: Record<string, number> = {
      VII: 7,
      '7': 7,
      VIII: 8,
      '8': 8,
      IX: 9,
      '9': 9,
      X: 10,
      '10': 10,
      XI: 11,
      '11': 11,
      XII: 12,
      '12': 12,
    }

    const sortedData = [...data].sort((a, b) => {
      const keyA = String(a.name || '')
        .toUpperCase()
        .replace('KELAS ', '')
        .trim()
      const keyB = String(b.name || '')
        .toUpperCase()
        .replace('KELAS ', '')
        .trim()
      const rankA = gradeOrderMap[keyA] ?? 99
      const rankB = gradeOrderMap[keyB] ?? 99
      if (rankA !== rankB) return rankA - rankB
      return String(a.name).localeCompare(String(b.name))
    })

    const dataCount = await Grade.count()

    return {
      data: sortedData as unknown as GradeDto[],
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
              WHERE ud.GradeId = Grade.id AND ud.studentStatus = 'aktif'
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
                  WHERE ud.ClassId = classes.id AND ud.studentStatus = 'aktif'
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

}
