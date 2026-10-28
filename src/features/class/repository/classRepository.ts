import { Request } from 'express'
import { db, sequelize } from '@/database/databaseConnection'
import Class from '@/database/model/class'
import Grade from '@/database/model/grade'
import HomeroomAssignment from '@/database/model/homeroomAssignment'
import StudentClassHistory from '@/database/model/studentClassHistory'
import User from '@/database/model/user'
import UserDetail from '@/database/model/userDetail'
import UserHasRoles from '@/database/model/userHasRoles'
import { RoleId } from '@/libs/constant/roleIds'
import { ErrorResponse } from '@/libs/http/ErrorResponse'
import { ClassQueryRepository } from './classQueryRepository'
import {
  ClassDetailDto,
  ClassDto,
  CreateClassDto,
  UpdateClassDto,
} from '../dto'
import { classListQuerySchema } from '../schema'
import { Sequelize } from 'sequelize-typescript'
import { Op, QueryTypes } from 'sequelize'
import { MetaPaginationDto } from '@/routes/version1/response/metaData'

export const DEFAULT_ACADEMIC_YEAR = '2025/2026'

export async function resolveCurrentAcademicYear(): Promise<string> {
  const yearRows = await sequelize.query<{ academicYear: string; cnt: number }>(
    `SELECT academicYear, COUNT(*) AS cnt
     FROM \`user_details\`
     WHERE academicYear IS NOT NULL AND academicYear != ''
     GROUP BY academicYear
     ORDER BY cnt DESC, academicYear DESC
     LIMIT 1`,
    { type: QueryTypes.SELECT }
  )

  if (yearRows && yearRows.length > 0 && yearRows[0].academicYear) {
    return String(yearRows[0].academicYear)
  }

  const homeroomYears = await HomeroomAssignment.findAll({
    attributes: ['academicYear'],
    group: ['academicYear'],
    order: [['academicYear', 'DESC']],
  })

  if (homeroomYears.some((h) => h.academicYear === DEFAULT_ACADEMIC_YEAR)) {
    return DEFAULT_ACADEMIC_YEAR
  }

  for (const item of homeroomYears) {
    const historyCount = await StudentClassHistory.count({
      where: { academicYear: item.academicYear },
    })
    if (historyCount === 0) {
      return item.academicYear
    }
  }

  return DEFAULT_ACADEMIC_YEAR
}

export class ClassRepository {
  private async validateHomeroomTeacher(
    homeroomTeacherId: string,
    transaction?: any
  ): Promise<void> {
    const teacher = await User.findByPk(homeroomTeacherId, { transaction })
    if (!teacher) {
      throw new ErrorResponse.NotFound('Wali kelas tidak ditemukan')
    }

    const validRole = await UserHasRoles.findOne({
      where: {
        UserId: homeroomTeacherId,
        RoleId: {
          [Op.in]: [RoleId.walikelas, RoleId.gurubk],
        },
      },
      transaction,
    })

    if (!validRole) {
      throw new ErrorResponse.BadRequest(
        'Wali kelas harus memiliki role walikelas atau gurubk'
      )
    }
  }

  async getAll(req: Request): Promise<{
    data: ClassDto[]
    meta: { pagination: MetaPaginationDto }
  }> {
    classListQuerySchema.validateSync(req.query)

    const query = new ClassQueryRepository(req)
    const academicYear =
      query.academicYear || (await resolveCurrentAcademicYear())

    const rows = await Class.findAll({
      ...query.queryFilter(),
      include: [
        {
          model: Grade,
          attributes: ['id', 'name', 'level'],
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

    const classIds = rows.map((r) => r.id)
    const assignments =
      classIds.length > 0
        ? await HomeroomAssignment.findAll({
            where: {
              ClassId: { [Op.in]: classIds },
              academicYear,
            },
            include: [
              {
                model: User,
                as: 'teacher',
                attributes: ['id', 'fullname', 'email'],
              },
            ],
          })
        : []

    const assignmentByClassId = new Map<string, HomeroomAssignment>()
    for (const assignment of assignments) {
      assignmentByClassId.set(assignment.ClassId, assignment)
    }

    const data: ClassDto[] = rows.map((row) => {
      const json: any = row.toJSON()
      const assignment = assignmentByClassId.get(row.id)
      const teacher = assignment?.teacher
        ? (assignment.teacher.toJSON() as any)
        : null

      return {
        ...json,
        academicYear,
        homeroomTeacherId: assignment?.UserId ?? null,
        homeroomTeacher: teacher,
      }
    })

    const countCondition = query.GradeId ? { GradeId: query.GradeId } : {}
    const dataCount = await Class.count({ where: countCondition })

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

  async getByPk(id: string): Promise<Class> {
    const data = await Class.findByPk(id)

    if (!data) throw new ErrorResponse.NotFound('errors.notFound')

    return data
  }

  async getById(id: string, academicYearParam?: string): Promise<ClassDetailDto> {
    const academicYear =
      academicYearParam || (await resolveCurrentAcademicYear())

    const data = await Class.findOne({
      where: { id },
      include: [
        {
          model: Grade,
          attributes: ['id', 'name', 'level'],
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

    const assignment = await HomeroomAssignment.findOne({
      where: {
        ClassId: id,
        academicYear,
      },
      include: [
        {
          model: User,
          as: 'teacher',
          attributes: ['id', 'fullname', 'email'],
        },
      ],
    })

    const json: any = data.toJSON()
    const teacher = assignment?.teacher
      ? (assignment.teacher.toJSON() as any)
      : null

    return {
      ...json,
      academicYear,
      homeroomTeacherId: assignment?.UserId ?? null,
      homeroomTeacher: teacher,
    } as ClassDetailDto
  }

  async add(formData: CreateClassDto): Promise<ClassDto> {
    const grade = await Grade.findByPk(formData.GradeId)

    if (!grade) {
      throw new ErrorResponse.NotFound('Tingkat/Grade tidak ditemukan')
    }

    const homeroomTeacherId = formData.homeroomTeacherId || null
    const academicYear =
      formData.academicYear || (await resolveCurrentAcademicYear())

    if (homeroomTeacherId) {
      await this.validateHomeroomTeacher(homeroomTeacherId)
    }

    let createdClassId = ''

    await db.sequelize!.transaction(async (transaction) => {
      const created = await Class.create(
        {
          name: formData.name,
          GradeId: formData.GradeId,
        },
        { transaction }
      )

      createdClassId = created.id

      if (homeroomTeacherId) {
        await HomeroomAssignment.create(
          {
            ClassId: created.id,
            UserId: homeroomTeacherId,
            academicYear,
          },
          { transaction }
        )
      }
    })

    return this.getById(createdClassId, academicYear)
  }

  async update(id: string, formData: UpdateClassDto): Promise<ClassDto> {
    const data = await this.getByPk(id)

    if (formData.GradeId) {
      const grade = await Grade.findByPk(formData.GradeId)
      if (!grade) {
        throw new ErrorResponse.NotFound('Tingkat/Grade tidak ditemukan')
      }
    }

    const homeroomTeacherId = formData.homeroomTeacherId
    const academicYear =
      formData.academicYear || (await resolveCurrentAcademicYear())

    if (homeroomTeacherId) {
      await this.validateHomeroomTeacher(homeroomTeacherId)
    }

    await db.sequelize!.transaction(async (transaction) => {
      await data.update(
        {
          ...(formData.name ? { name: formData.name } : {}),
          ...(formData.GradeId ? { GradeId: formData.GradeId } : {}),
        },
        { transaction }
      )

      if (homeroomTeacherId !== undefined) {
        if (homeroomTeacherId === null) {
          await HomeroomAssignment.destroy({
            where: {
              ClassId: id,
              academicYear,
            },
            transaction,
          })
        } else {
          const existing = await HomeroomAssignment.findOne({
            where: {
              ClassId: id,
              academicYear,
            },
            transaction,
          })

          if (existing) {
            await existing.update(
              { UserId: homeroomTeacherId },
              { transaction }
            )
          } else {
            await HomeroomAssignment.create(
              {
                ClassId: id,
                UserId: homeroomTeacherId,
                academicYear,
              },
              { transaction }
            )
          }
        }
      }
    })

    return this.getById(id, academicYear)
  }

  async delete(id: string): Promise<void> {
    const data = await this.getByPk(id)

    await data.destroy()
  }
}
