import { Request } from 'express'
import Class from '@/database/model/class'
import Grade from '@/database/model/grade'
import User from '@/database/model/user'
import UserDetail from '@/database/model/userDetail'
import { ErrorResponse } from '@/libs/http/ErrorResponse'
import { ClassQueryRepository } from './classQueryRepository'
import {
  ClassDetailDto,
  ClassDto,
  CreateClassDto,
  UpdateClassDto,
} from '../dto'
import { Sequelize } from 'sequelize-typescript'
import { MetaPaginationDto } from '@/routes/version1/response/metaData'

export class ClassRepository {
  async getAll(req: Request): Promise<{
    data: ClassDto[]
    meta: { pagination: MetaPaginationDto }
  }> {
    const query = new ClassQueryRepository(req)

    const data = await Class.findAll({
      ...query.queryFilter(),
      include: [
        {
          model: Grade,
          attributes: ['id', 'name', 'level'],
        },
        {
          model: User,
          as: 'homeroomTeacher',
          attributes: ['id', 'fullname', 'email'],
        },
      ],
      attributes: {
        include: [
          [
            Sequelize.literal(`(
              SELECT COUNT(*)
              FROM user_details AS ud
              WHERE ud.ClassId = \`Class\`.\`id\`
            )`),
            'studentCount',
          ],
        ],
      },
    })

    const countCondition = query.GradeId ? { GradeId: query.GradeId } : {}
    const dataCount = await Class.count({ where: countCondition })

    return {
      data: data as unknown as ClassDto[],
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

  async getByPk(id: string): Promise<Class> {
    const data = await Class.findByPk(id)

    if (!data) throw new ErrorResponse.NotFound('errors.notFound')

    return data
  }

  async getById(id: string): Promise<ClassDetailDto> {
    const data = await Class.findOne({
      where: { id },
      include: [
        {
          model: Grade,
          attributes: ['id', 'name', 'level'],
        },
        {
          model: User,
          as: 'homeroomTeacher',
          attributes: ['id', 'fullname', 'email'],
        },
        {
          model: UserDetail,
          include: [
            {
              model: User,
              attributes: ['id', 'fullname', 'email'],
            },
          ],
        },
      ],
      attributes: {
        include: [
          [
            Sequelize.literal(`(
              SELECT COUNT(*)
              FROM user_details AS ud
              WHERE ud.ClassId = \`Class\`.\`id\`
            )`),
            'studentCount',
          ],
        ],
      },
    })

    if (!data) throw new ErrorResponse.NotFound('errors.notFound')

    return data as unknown as ClassDetailDto
  }

  async add(formData: CreateClassDto): Promise<ClassDto> {
    const grade = await Grade.findByPk(formData.GradeId)

    if (!grade) {
      throw new ErrorResponse.NotFound('Tingkat/Grade tidak ditemukan')
    }

    const homeroomTeacherId = formData.homeroomTeacherId || null

    if (homeroomTeacherId) {
      const teacher = await User.findByPk(homeroomTeacherId)
      if (!teacher) {
        throw new ErrorResponse.NotFound('Wali kelas tidak ditemukan')
      }
    }

    const data = await Class.create({
      name: formData.name,
      GradeId: formData.GradeId,
      homeroomTeacherId,
    })

    return this.getByPk(data.id) as unknown as ClassDto
  }

  async update(id: string, formData: UpdateClassDto): Promise<void> {
    const data = await this.getByPk(id)

    if (formData.GradeId) {
      const grade = await Grade.findByPk(formData.GradeId)
      if (!grade) {
        throw new ErrorResponse.NotFound('Tingkat/Grade tidak ditemukan')
      }
    }

    const homeroomTeacherId = formData.homeroomTeacherId

    if (homeroomTeacherId) {
      const teacher = await User.findByPk(homeroomTeacherId)
      if (!teacher) {
        throw new ErrorResponse.NotFound('Wali kelas tidak ditemukan')
      }
    }

    await data.update({
      ...(formData.name ? { name: formData.name } : {}),
      ...(formData.GradeId ? { GradeId: formData.GradeId } : {}),
      ...(homeroomTeacherId !== undefined ? { homeroomTeacherId } : {}),
    })
  }

  async delete(id: string): Promise<void> {
    const data = await this.getByPk(id)

    await data.destroy()
  }
}
