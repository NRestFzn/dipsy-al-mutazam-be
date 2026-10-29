import { Request } from 'express'
import { Op } from 'sequelize'
import User from '@/database/model/user'
import Role from '@/database/model/role'
import UserHasRoles from '@/database/model/userHasRoles'
import Class from '@/database/model/class'
import Grade from '@/database/model/grade'
import HomeroomAssignment from '@/database/model/homeroomAssignment'
import { resolveCurrentAcademicYear } from '../../class/repository/classRepository'
import { db } from '@/database/databaseConnection'
import { ErrorResponse } from '@/libs/http/ErrorResponse'
import { MetaPaginationDto } from '@/routes/version1/response/metaData'
import { CreateTeacherDto, TeacherDto, UpdateTeacherDto } from '../dto'

const TEACHER_ROLE_NAMES = ['gurubk', 'walikelas']

export class TeacherRepository {
  async getAll(req: Request): Promise<{
    data: TeacherDto[]
    meta: { pagination: MetaPaginationDto }
  }> {
    const page = Number(req.query.page ?? 1)
    const pageSize = Number(req.query.pageSize ?? 10)
    const search = String(req.query.search ?? '').trim()
    const roleName = String(req.query.roleName ?? '').trim()

    const where: Record<string, any> = {}

    if (search) {
      ;(where as any)[Op.or] = [
        { fullname: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ]
    }

    const { rows, count } = await User.findAndCountAll({
      where,
      include: [
        {
          model: Role,
          through: { attributes: [] },
          where: roleName
            ? { name: roleName }
            : { name: { [Op.in]: TEACHER_ROLE_NAMES } },
          required: true,
        },
      ],
      distinct: true,
      limit: pageSize,
      offset: (page - 1) * pageSize,
      order: [['fullname', 'ASC']],
    })

    const ids = rows.map((row) => row.id)
    const academicYear =
      String(req.query.academicYear ?? '').trim() ||
      (await resolveCurrentAcademicYear())

    const assignments = ids.length
      ? await HomeroomAssignment.findAll({
          where: {
            UserId: { [Op.in]: ids },
            academicYear,
          },
          include: [{ model: Class, include: [Grade] }],
        })
      : []

    const data: TeacherDto[] = rows.map((row) => ({
      id: row.id,
      fullname: row.fullname,
      email: row.email,
      profilePicture: row.profilePicture ?? null,
      roles: (row.roles ?? []).map((role) => ({
        id: role.id,
        name: role.name,
      })) as any,
      homeroomClasses: assignments
        .filter((item) => item.UserId === row.id && (item as any).class)
        .map((item) => {
          const cls = (item as any).class
          return {
            id: cls.id,
            name: cls.name,
            gradeName: cls.grade?.name ?? null,
          }
        }),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }))

    return {
      data,
      meta: {
        pagination: {
          page,
          pageSize,
          pageCount: data.length,
          total: count,
        },
      },
    }
  }

  private async resolveRole(roleName: string): Promise<Role> {
    if (!TEACHER_ROLE_NAMES.includes(roleName)) {
      throw new ErrorResponse.BadRequest('errors.badRequest')
    }

    const role = await Role.findOne({ where: { name: roleName } })

    if (!role) throw new ErrorResponse.NotFound('errors.notFound')

    return role
  }

  async create(formData: CreateTeacherDto): Promise<void> {
    await db.sequelize!.transaction(async (transaction) => {
      const duplicate = await User.findOne({
        where: { email: formData.email },
        transaction,
      })

      if (duplicate) {
        throw new ErrorResponse.BaseResponse('auth.emailUsed', 'Conflict', 409)
      }

      const role = await this.resolveRole(formData.roleName)

      const user = await User.create(
        {
          fullname: formData.fullname,
          email: formData.email,
          password: formData.password,
        } as any,
        { transaction }
      )

      await UserHasRoles.create({ UserId: user.id, RoleId: role.id } as any, {
        transaction,
      })
    })
  }

  async update(id: string, formData: UpdateTeacherDto): Promise<void> {
    await db.sequelize!.transaction(async (transaction) => {
      const user = await User.findByPk(id, { transaction })

      if (!user) throw new ErrorResponse.NotFound('user.notFound')

      if (formData.email && formData.email !== user.email) {
        const duplicate = await User.findOne({
          where: { email: formData.email },
          transaction,
        })

        if (duplicate) {
          throw new ErrorResponse.BaseResponse(
            'auth.emailUsed',
            'Conflict',
            409
          )
        }
      }

      await user.update(
        {
          ...(formData.fullname ? { fullname: formData.fullname } : {}),
          ...(formData.email ? { email: formData.email } : {}),
          ...(formData.password ? { password: formData.password } : {}),
        } as any,
        { transaction }
      )

      if (formData.roleName) {
        const role = await this.resolveRole(formData.roleName)

        await UserHasRoles.destroy({ where: { UserId: id }, transaction })
        await UserHasRoles.create({ UserId: id, RoleId: role.id } as any, {
          transaction,
        })
      }
    })
  }

  async delete(id: string): Promise<void> {
    await db.sequelize!.transaction(async (transaction) => {
      const user = await User.findByPk(id, { transaction })

      if (!user) throw new ErrorResponse.NotFound('user.notFound')

      const homeroom = await HomeroomAssignment.findOne({
        where: { UserId: id },
        transaction,
      })

      if (homeroom) {
        throw new ErrorResponse.BadRequest('teacher.stillHomeroom')
      }

      await UserHasRoles.destroy({ where: { UserId: id }, transaction })
      await user.destroy({ transaction })
    })
  }
}
